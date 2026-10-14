import { gsap, Observer, ScrollTrigger } from './gsap'
import { getLenis } from './useLenis'
import { holdScroll, isScrollLocked, onLockChange, releaseScroll } from './scrollLock'
import { isNavigating, onNavigate } from './navigate'

export const STEP = 1.1 // duração de uma troca, em segundos
const WHEEL_GAP = 120 // ms sem wheel que encerram um gesto
const WHEEL_STEP = 30 // px acumulados num gesto pra dar um passo
const EDGE = 12 // px da fronteira do palco em que ele já prende
const ARRIVAL_COOLDOWN = 600 // ms depois de prender em que nenhum gesto conta
const TOUCH_NUDGE = 0.4 // fração da tela que a página anda quando o swipe solta o palco (celular)

/** Etiqueta do passo i na timeline mestra (no fim da troca que chega nele). */
export const stepLabel = (i: number) => `p${i}`

/** Sobrevive a remontagens (tela mudando entre mobile e desktop): passo atual e se estava preso. */
export interface StageMemory {
  current: number
  engaged: boolean
}

export interface StageSize {
  vw: number
  vh: number
}

export interface SteppedStageOptions {
  /** O palco (altura da tela) que prende. */
  stage: HTMLElement
  /** Só no celular: fundo fixo que cobre o resto da tela enquanto o palco está preso. */
  backdrop?: HTMLElement | null
  count: number
  desktop: boolean
  reduced: boolean
  memory: { current: StageMemory }
  /**
   * Mede e monta a timeline mestra: uma troca por par de passos, com stepLabel(i) no fim de cada uma.
   * Chamada na montagem e a cada reconstrução (resize, fontes).
   */
  build: (size: StageSize) => gsap.core.Timeline
  /** Depois de mover a timeline sem animar e no fim de cada troca. */
  afterSeek?: () => void
  /** Assinatura das medidas que mudam com as fontes: se mudar depois de document.fonts.ready, reconstrói. */
  fontKey?: () => string
  /** Passo atual mudou (marcar inert, estado do React, vídeos). */
  onCurrent: (i: number) => void
  /** Uma troca começou, pra esse lado. */
  onStep?: (dir: 1 | -1) => void
  /** Troca em reduced-motion: some, `seek` coloca o passo novo no lugar, volta, e chama `done`. */
  reducedSwap?: (seek: () => void, done: () => void) => gsap.core.Animation
  /** Elementos focáveis do passo i (Tab anda pelos passos). */
  focusables: (i: number) => HTMLElement[]
  onEngaged: (engaged: boolean) => void
  /** Montado (medidas e timeline prontas), já no passo inicial. */
  onSetup?: (start: number) => void
}

export interface SteppedStage {
  destroy: () => void
}

/**
 * Palco em passos, uma tela de altura. Chegando por cima, ao encostar no topo, o scroll trava (Lenis stop) e
 * entra o primeiro passo; chegando por baixo, entra o último. Dentro, um gesto (wheel, swipe, tecla) vale um passo,
 * qualquer que seja a força; gestos durante a troca e no intervalo depois dela são descartados. Nas pontas, o gesto
 * solta o scroll (Lenis start). Todas as trocas vivem numa timeline só: a ida e a volta são a mesma animação,
 * pra frente ou invertida. O conteúdo de cada palco (a timeline) vem de fora, em `build`.
 */
export function createSteppedStage(opts: SteppedStageOptions): SteppedStage {
  const { stage, count: n, desktop, reduced, memory } = opts
  const cooldown = desktop ? 250 : 350
  // Celular (toque, até 767px): fundo fixo e vizinhas escondidas enquanto preso, inércia segurada, resize da barra
  // de endereço sem reconstruir. No desktop tudo isso fica de fora.
  const touchStage = !desktop
  const backdrop = touchStage ? (opts.backdrop ?? null) : null

  let vw = 0
  // Altura já conhecida antes do setup: as regras de "palco inteiro fora da tela" dependem dela desde o começo.
  let vh = stage.clientHeight
  let current = Math.min(memory.current.current, n - 1)
  let engaged = false
  let master: gsap.core.Timeline | null = null
  let moving: gsap.core.Animation | null = null
  let cooldownUntil = 0
  let stopped = false
  let ready = false
  let builtKey = ''
  let rebuildPending = false
  let refreshPending = false
  let refreshCall: gsap.core.Tween | null = null

  const measureAndBuild = () => {
    vw = stage.clientWidth
    vh = stage.clientHeight
    master?.kill()
    master = opts.build({ vw, vh })
    builtKey = opts.fontKey?.() ?? ''
  }

  const setCurrent = (i: number) => {
    current = i
    opts.onCurrent(i)
  }

  /** Coloca o passo i no lugar, sem animação. */
  const applyInstant = (i: number) => {
    moving?.kill()
    moving = null
    master?.seek(stepLabel(i), false)
    opts.afterSeek?.()
    setCurrent(i)
  }

  const nearIO = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !ready) setup()
    },
    { rootMargin: '100% 0px 100% 0px' },
  )
  nearIO.observe(stage)

  // --- Gestos ---
  // Wheel: detector próprio. Um gesto começa no primeiro evento e termina quando (a) passam WHEEL_GAP ms sem
  // evento, (b) a força volta a crescer depois de estar caindo (dedo empurrou de novo enquanto a inércia ainda
  // chegava) ou (c) o sentido inverte. O passo sai quando o gesto acumula WHEEL_STEP px; o resto dele é descartado.
  // Gesto que começa durante a troca, no intervalo depois dela ou na chegada à seção é descartado inteiro,
  // então a cauda da inércia nunca conta como gesto novo.
  const wheel = { active: false, last: 0, prevAbs: 0, falling: false, sign: 0, acc: 0, done: false }
  const lineHeight = 16
  const normalize = (e: WheelEvent) =>
    e.deltaMode === 1 ? e.deltaY * lineHeight : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
  const blockedNow = () => !!moving || performance.now() < cooldownUntil
  const nudge = (px: number) => {
    const lenis = getLenis()
    if (!lenis) {
      window.scrollBy(0, px)
      return
    }
    lenis.scrollTo(lenis.targetScroll + px, { programmatic: false, lerp: lenis.options.lerp })
  }
  // Celular: o swipe que solta o palco empurra a página quando o dedo sai (enquanto preso o toque não rola nada).
  const touchNudge = (dir: 1 | -1) => {
    const target = window.scrollY + dir * Math.round(vh * TOUCH_NUDGE)
    const lenis = getLenis()
    if (!lenis) window.scrollTo(0, target)
    else lenis.scrollTo(target, { duration: 0.8, easing: (p) => 1 - Math.pow(1 - p, 3) })
  }

  const onWheel = (e: WheelEvent) => {
    const listening = engaged && !isScrollLocked()
    if (listening) e.preventDefault()
    const d = normalize(e)
    if (d === 0) return
    const now = performance.now()
    const abs = Math.abs(d)
    const sign = Math.sign(d)
    const reaccel = wheel.falling && abs > Math.max(wheel.prevAbs * 1.5, wheel.prevAbs + 4)
    if (!wheel.active || now - wheel.last > WHEEL_GAP || sign !== wheel.sign || reaccel) {
      wheel.active = true
      wheel.sign = sign
      wheel.acc = 0
      wheel.falling = false
      // Começou no meio da troca ou no intervalo: o gesto inteiro não conta.
      wheel.done = blockedNow()
    } else if (abs < wheel.prevAbs) {
      wheel.falling = true
    }
    wheel.last = now
    wheel.prevAbs = abs
    if (!listening || wheel.done) return
    wheel.acc += abs
    if (wheel.acc >= WHEEL_STEP) {
      wheel.done = true
      step(sign > 0 ? 1 : -1)
      if (!engaged) nudge(d)
    }
  }
  window.addEventListener('wheel', onWheel, { passive: false })

  // Toque: um toque vale no máximo um passo; o Observer só diz pra que lado o dedo foi (40px de tolerância).
  let touchUsed = false
  let pendingNudge: 0 | 1 | -1 = 0
  const onTouchStart = () => {
    touchUsed = blockedNow()
    pendingNudge = 0
  }
  window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
  const onTouchEnd = () => {
    if (!pendingNudge) return
    const dir = pendingNudge
    pendingNudge = 0
    // No quadro seguinte: o touchend do Lenis roda antes e pararia uma animação de scroll começada agora.
    gsap.delayedCall(0, () => touchNudge(dir))
  }
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  const onSwipe = (dir: 1 | -1) => {
    if (touchUsed) return
    touchUsed = true
    step(dir, 'touch')
  }

  let focusAfter: 'first' | 'last' | null = null

  const goto = (next: number, dir: 1 | -1) => {
    setCurrent(next)
    opts.onStep?.(dir)
    if (!master) return
    const tl = master
    if (reduced && opts.reducedSwap) {
      moving = opts.reducedSwap(() => {
        tl.seek(stepLabel(next), false)
        opts.afterSeek?.()
      }, done)
      return
    }
    moving = tl.tweenTo(stepLabel(next), { ease: 'none', onComplete: done })
  }
  function done() {
    moving = null
    cooldownUntil = performance.now() + cooldown
    opts.afterSeek?.()
    if (focusAfter) {
      const list = opts.focusables(current)
      const el = focusAfter === 'first' ? list[0] : list[list.length - 1]
      focusAfter = null
      el?.focus({ preventScroll: true })
    }
    // Celular: o que o resize pediu durante a troca roda agora, com ela inteira.
    if (rebuildPending) {
      rebuildPending = false
      rebuild()
    }
    if (refreshPending) {
      refreshPending = false
      scheduleRefresh()
    }
  }

  function step(dir: 1 | -1, source: 'touch' | 'other' = 'other') {
    if (!engaged || blockedNow()) return
    const next = current + dir
    if (next < 0 || next >= n) release(dir, source)
    else goto(next, dir)
  }

  const touchObserver = Observer.create({
    target: window,
    type: 'touch',
    tolerance: 40,
    preventDefault: true,
    onUp: () => onSwipe(1),
    onDown: () => onSwipe(-1),
  })
  touchObserver.disable()
  const listen = (on: boolean) => (on ? touchObserver.enable() : touchObserver.disable())

  // --- Prender e soltar ---
  const stageTop = () => stage.getBoundingClientRect().top
  // De que lado da fronteira a tela está: acima do palco, abaixo, ou acabou de soltar numa direção.
  let side: 'above' | 'below' | 'released-up' | 'released-down' = stageTop() > 0 ? 'above' : 'below'

  // Encosta o palco no topo. Perto, num pulo curto; longe (flick que passou da fronteira), deslizando com o
  // Lenis, que anima mesmo parado quando forçado. Scroll nativo primeiro no pulo: com o Lenis parado, a posição
  // que ele guarda fica velha e um scrollTo pra "onde ele acha que está" não faz nada.
  let snapping = false
  let snapFallback: gsap.core.Tween | null = null
  const snapNow = () => {
    const y = Math.round(stageTop() + window.scrollY)
    window.scrollTo(0, y)
    getLenis()?.scrollTo(y, { immediate: true, force: true })
  }
  /** Encosta o palco no topo e devolve quanto tempo o encaixe leva (ms). */
  const snap = (): number => {
    const top = stageTop()
    const y = Math.round(top + window.scrollY)
    const lenis = getLenis()
    const dist = Math.abs(top)
    if (!lenis || dist <= 2 || reduced) {
      snapNow()
      return 0
    }
    snapping = true
    const end = () => {
      snapping = false
      snapFallback?.kill()
      snapFallback = null
      // Celular: se a inércia empurrou a página durante o encaixe, termina no lugar exato.
      if (touchStage && engaged && Math.abs(stageTop()) > 1) snapNow()
    }
    snapFallback?.kill()
    snapFallback = gsap.delayedCall(0.7, end)
    const duration = Math.min(0.45, Math.max(0.18, dist / 1400))
    lenis.scrollTo(y, { duration, force: true, onComplete: end })
    return duration * 1000
  }

  // Celular: enquanto o palco está preso nada de fora dele aparece. O fundo fixo na cor do palco cobre o resto da
  // tela, as seções vizinhas somem até o Lenis ser liberado, e o toque no palco não rola a página.
  // As vizinhas são procuradas na hora de prender: as seções montam uma por quadro e, quando o palco é criado, a de
  // baixo pode ainda não existir. Ao soltar, mostra de volta as mesmas que escondeu.
  const section = stage.closest('section')
  let neighbors: HTMLElement[] = []
  const holdVisuals = (on: boolean) => {
    if (!touchStage) return
    if (on) {
      neighbors = [section?.previousElementSibling, section?.nextElementSibling].filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      )
    }
    if (backdrop) backdrop.style.opacity = on ? '1' : '0'
    neighbors.forEach((el) => {
      el.style.visibility = on ? 'hidden' : ''
    })
    stage.style.touchAction = on ? 'none' : ''
  }

  const engage = (i: number) => {
    if (engaged || isNavigating() || isScrollLocked()) return
    if (!ready) setup(false)
    engaged = true
    // Parar o Lenis antes de encostar: o stop mata qualquer animação em voo, inclusive a do encaixe.
    holdScroll()
    holdVisuals(true)
    if (i !== current) applyInstant(i)
    const snapMs = snap()
    // O gesto que trouxe até aqui (e a inércia dele) não conta como passo. No celular o gesto de chegada já fica
    // descartado inteiro, então basta o intervalo normal entre passos, contado depois do encaixe.
    wheel.done = true
    touchUsed = true
    cooldownUntil = performance.now() + (desktop ? ARRIVAL_COOLDOWN : snapMs + cooldown)
    listen(true)
    stage.dataset.engaged = 'true'
    opts.onEngaged(true)
  }

  const disengage = () => {
    if (!engaged) return
    engaged = false
    listen(false)
    holdVisuals(false)
    releaseScroll()
    delete stage.dataset.engaged
    opts.onEngaged(false)
  }

  // Solta o scroll e deixa a página seguir com o gesto do usuário.
  function release(dir: 1 | -1, source: 'touch' | 'other' = 'other') {
    disengage()
    side = dir > 0 ? 'released-down' : 'released-up'
    if (touchStage && source === 'touch') pendingNudge = dir
  }

  // Salto nativo (Home, End, PageDown, scrollTo suave): a página anda em passos grandes sem o Lenis. Só prende
  // se ela parar dentro do palco; enquanto continua andando, o palco deixa passar.
  const JUMP = 160
  let lastY = window.scrollY
  let jumpTimer: gsap.core.Tween | null = null

  // A cada scroll: cruzou a fronteira do palco? Prende.
  const onScroll = () => {
    const y = window.scrollY
    const delta = Math.abs(y - lastY)
    lastY = y
    jumpTimer?.kill()
    jumpTimer = null
    if (isNavigating() || isScrollLocked()) return
    const top = stageTop()
    // Preso, mas a página saiu dali (busca na página, tecla Home, salto de âncora): solta.
    if (engaged) {
      if (snapping) return
      // Celular: a inércia do dedo continua depois de prender (no iOS nenhum JS para), então o palco volta pro
      // lugar a cada passo dela em vez de soltar. Só um salto de mais de uma tela e meia (busca na página) solta.
      if (touchStage) {
        if (Math.abs(top) >= vh * 1.5) {
          disengage()
          side = top > 0 ? 'above' : 'below'
        } else if (Math.abs(top) > 1) snapNow()
        return
      }
      if (Math.abs(top) > EDGE * 2) {
        disengage()
        side = top > 0 ? 'above' : 'below'
      }
      return
    }
    // Palco inteiro fora da tela: é a hora de deixar pronto o passo pelo qual ele vai entrar
    // (o último vindo de baixo, o primeiro vindo de cima), sem ninguém ver a troca.
    // Também é o caso do salto (âncora, tecla End, busca na página) que passou do palco num evento só: não prende.
    if (top <= -vh) {
      side = 'below'
      if (ready && current !== n - 1) applyInstant(n - 1)
      return
    }
    if (top >= vh) {
      side = 'above'
      if (ready && current !== 0) applyInstant(0)
      return
    }
    const lenis = getLenis()
    // Só no desktop: no celular um flick rápido anda mais que isso por quadro e tem que prender na hora.
    if (desktop && delta > JUMP && (!lenis || lenis.isScrolling !== 'smooth')) {
      // Decide só quando a página parar; um evento novo cancela e decide de novo.
      jumpTimer = gsap.delayedCall(0.12, () => {
        jumpTimer = null
        if (!engaged && !isNavigating() && !isScrollLocked()) settle(stageTop())
      })
      return
    }
    settle(top)
  }
  // Perto o bastante da fronteira já prende: o scroll suave desacelera e pode parar a 1px sem cruzar.
  function settle(top: number) {
    if (side === 'above' && top <= EDGE) engage(0)
    else if (side === 'below' && top >= -EDGE) engage(n - 1)
    else if (side === 'released-up') {
      if (top > EDGE * 2) side = 'above'
      else if (top < -EDGE * 2) engage(0)
    } else if (side === 'released-down') {
      if (top < -EDGE * 2) side = 'below'
      else if (top > EDGE * 2) engage(n - 1)
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  const onKey = (e: KeyboardEvent) => {
    if (!engaged || e.defaultPrevented) return
    const t = e.target as HTMLElement | null
    if (t?.closest('input, textarea, [role=dialog]')) return
    const down = ['ArrowDown', 'PageDown', ' '].includes(e.key)
    const up = ['ArrowUp', 'PageUp'].includes(e.key)
    if (!down && !up) return
    e.preventDefault()
    if (e.repeat) return
    step(down ? 1 : -1)
    if (!engaged) nudge((down ? 1 : -1) * (e.key === 'ArrowDown' || e.key === 'ArrowUp' ? 40 : window.innerHeight * 0.85))
  }
  window.addEventListener('keydown', onKey)

  // Tab no último foco do passo avança (Shift+Tab no primeiro volta); nas pontas solta o palco e deixa
  // o navegador seguir. Sem isso o foco pulava pra seção seguinte com a página rolando por baixo do palco.
  const onTab = (e: KeyboardEvent) => {
    if (!engaged || e.key !== 'Tab') return
    if (moving) {
      e.preventDefault()
      return
    }
    const list = opts.focusables(current)
    const active = document.activeElement
    if (!list.length || !(active instanceof HTMLElement) || !list.includes(active)) return
    const atEnd = !e.shiftKey && active === list[list.length - 1]
    const atStart = e.shiftKey && active === list[0]
    if (!atEnd && !atStart) return
    const dir: 1 | -1 = atEnd ? 1 : -1
    const next = current + dir
    if (next < 0 || next >= n) {
      release(dir)
      return
    }
    e.preventDefault()
    focusAfter = dir > 0 ? 'first' : 'last'
    goto(next, dir)
  }
  window.addEventListener('keydown', onTab)

  // Menu e ficha por cima: gestos param de ser lidos enquanto a camada está aberta.
  const offLock = onLockChange((locked) => {
    if (engaged) listen(!locked)
  })

  // Navegação pelo menu atravessa o palco sem prender; no fim, prende se parou nele.
  const offNav = onNavigate((phase, target) => {
    if (phase === 'start') {
      if (moving) applyInstant(current)
      disengage()
      if (target === stage && ready && current !== 0) applyInstant(0)
      return
    }
    const top = stageTop()
    if (Math.abs(top) < 4) {
      side = 'above'
      engage(0)
    } else if (top > 0) {
      side = 'above'
      applyInstant(0)
    } else {
      side = 'below'
      applyInstant(n - 1)
    }
  })

  /**
   * Monta o palco (medidas, timeline mestra, estado do passo atual). Pesado, então só roda quando o palco
   * chega a uma tela de distância, fora do carregamento da página.
   */
  function setup(reengage = true) {
    if (ready || stopped) return
    ready = true
    measureAndBuild()
    // Celular: montado com a página abaixo do palco (flick rápido vindo de baixo), já nasce no último passo.
    const start = touchStage && !engaged && stageTop() < 0 && !memory.current.engaged ? n - 1 : current
    applyInstant(start)
    opts.onSetup?.(start)
    // Estava preso antes de remontar: continua preso no mesmo passo.
    if (reengage && memory.current.engaged && Math.abs(stageTop()) <= EDGE) engage(start)
    // As fontes mudam a altura do texto: se mudou mesmo, mede de novo.
    if (opts.fontKey) {
      document.fonts.ready.then(() => {
        if (stopped) return
        if (opts.fontKey?.() !== builtKey) requestRebuild()
      })
    }
  }

  function rebuild() {
    measureAndBuild()
    applyInstant(current)
    if (engaged) snap()
  }
  // No celular nunca no meio de uma troca (ela seria cortada): espera o fim.
  function requestRebuild() {
    if (touchStage && moving) rebuildPending = true
    else rebuild()
  }
  function scheduleRefresh() {
    refreshCall?.kill()
    refreshCall = gsap.delayedCall(0.25, () => {
      refreshCall = null
      if (moving || isScrollLocked()) refreshPending = true
      else ScrollTrigger.refresh()
    })
  }

  const onResize = () => {
    if (!ready) return
    if (desktop) {
      rebuild()
      return
    }
    // Celular: a barra de endereço muda a altura da janela a cada scroll, mas o palco tem 100svh e não muda.
    // Só reconstrói se o palco mudou de tamanho de verdade (rotação); os gatilhos da página se ajustam à tela nova.
    if (stage.clientWidth !== vw || stage.clientHeight !== vh) requestRebuild()
    else if (engaged && !snapping && Math.abs(stageTop()) > 1) snapNow()
    scheduleRefresh()
  }
  window.addEventListener('resize', onResize)

  return {
    destroy() {
      stopped = true
      memory.current = { current, engaged }
      moving?.kill()
      master?.kill()
      touchObserver.kill()
      offLock()
      offNav()
      disengage()
      nearIO.disconnect()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchend', onTouchEnd)
      refreshCall?.kill()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', onTab)
      jumpTimer?.kill()
      snapFallback?.kill()
      window.removeEventListener('resize', onResize)
    },
  }
}

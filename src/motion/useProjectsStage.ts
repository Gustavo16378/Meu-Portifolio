import { useEffect, useRef } from 'react'
import { gsap, Observer, ScrollTrigger } from './gsap'
import { getLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { holdScroll, isScrollLocked, onLockChange, releaseScroll } from './scrollLock'
import { isNavigating, onNavigate } from './navigate'
import { tickerDt, watchVisibility } from './spring'
import { compose, type Composition, type FrameRect } from '../components/projectLayout'
import type { Project } from '../data/projects'

export interface StageEls {
  /** O palco (altura da tela) que prende. */
  stage: HTMLElement
  /** Tudo que troca de projeto, menos o fundo (em reduced-motion some e volta inteiro). */
  content: HTMLElement
  /** Varredura diagonal: uma camada só com a cor do próximo. */
  wipe: HTMLElement
  glow: HTMLElement
  deskTravel: HTMLElement
  mobTravel: HTMLElement
  deskFloat: HTMLElement
  mobFloat: HTMLElement
  glints: HTMLElement[]
  deskLayers: HTMLElement[]
  mobLayers: HTMLElement[]
  /** Nome em contorno: camada que entra e sai, e a faixa dentro que desliza sozinha. */
  names: HTMLElement[]
  nameTracks: HTMLElement[]
  texts: HTMLElement[]
  videos: (HTMLVideoElement | null)[]
  /**
   * Só no celular: fundo fixo na cor do palco, com a própria varredura, que cobre a tela inteira enquanto o palco
   * está preso (no iOS, com a barra recolhida, a tela fica mais alta que os 100svh do palco).
   */
  backdrop?: HTMLElement | null
  backdropWipe?: HTMLElement | null
}

interface Options {
  projects: Project[]
  desktop: boolean
  posterOnly: boolean
  onCurrent: (index: number) => void
  onEngaged: (engaged: boolean) => void
}

const STEP = 1.1 // duração de uma troca, em segundos
const WHEEL_GAP = 120 // ms sem wheel que encerram um gesto
const WHEEL_STEP = 30 // px acumulados num gesto pra dar um passo
const EDGE = 12 // px da fronteira do palco em que ele já prende
const ARRIVAL_COOLDOWN = 600 // ms depois de prender em que nenhum gesto conta
const TOUCH_NUDGE = 0.4 // fração da tela que a página anda quando o swipe solta o palco (celular)
const NAME_OPACITY = 0.55
const DRIFT = 26 // px/s do nome em contorno, parado
const label = (i: number) => `p${i}`

/**
 * Palco da seção de projetos, uma tela de altura. Chegando por cima, ao encostar no topo, o scroll
 * trava (Lenis stop) e entra o primeiro projeto; chegando por baixo, entra o último. Dentro, o Observer é o
 * único controle: um gesto (wheel, swipe, tecla) vale um passo, qualquer que seja a força; gestos durante a
 * troca e no intervalo depois dela são descartados. Nas pontas, o gesto solta o scroll (Lenis start).
 * Todas as trocas vivem numa timeline só: a ida e a volta são a mesma animação, pra frente ou invertida.
 */
export function useProjectsStage(
  getEls: () => StageEls | null,
  { projects, desktop, posterOnly, onCurrent, onEngaged }: Options,
) {
  const manual = useRef<Set<number>>(new Set())
  const api = useRef<{ playManually: (i: number) => void }>({ playManually: () => undefined })
  // Sobrevive a remontagens (tela mudando entre mobile e desktop): projeto atual e se estava preso.
  const memory = useRef({ current: 0, engaged: false })
  const cb = useRef({ onCurrent, onEngaged })
  cb.current = { onCurrent, onEngaged }

  useEffect(() => {
    const found = getEls()
    if (!found) return
    const els: StageEls = found
    const n = projects.length
    const reduced = prefersReducedMotion()
    const cooldown = desktop ? 250 : 350
    // Celular (toque, até 767px): fundo fixo e vizinhas escondidas enquanto preso, inércia segurada, resize da barra
    // de endereço sem reconstruir. No desktop tudo isso fica de fora e o palco roda como antes.
    const touchStage = !desktop
    const backdrop = touchStage ? (els.backdrop ?? null) : null
    const backdropWipe = touchStage ? (els.backdropWipe ?? null) : null
    const wipes = backdropWipe ? [els.wipe, backdropWipe] : els.wipe

    let vw = 0
    // Altura já conhecida antes do setup: as regras de "palco inteiro fora da tela" dependem dela desde o começo.
    let vh = els.stage.clientHeight
    let comps: Composition[] = []
    let current = Math.min(memory.current.current, n - 1)
    let engaged = false
    let master: gsap.core.Timeline | null = null
    let moving: gsap.core.Animation | null = null
    let cooldownUntil = 0
    let stageVisible = false
    let stageNear = false
    let stopped = false
    let ready = false
    let textHeights = ''
    let rebuildPending = false
    let refreshPending = false
    let refreshCall: gsap.core.Tween | null = null

    // --- Frames: tamanho base (o maior que assumem), e daí só transform ---
    const frames = [
      { travel: els.deskTravel, key: 'desk' as const, baseW: 0, baseH: 0, ratio: 1000 / 1600 },
      { travel: els.mobTravel, key: 'mob' as const, baseW: 0, baseH: 0, ratio: 1039 / 480 },
    ]
    gsap.set([els.deskTravel, els.mobTravel], { transformOrigin: '50% 50%' })

    const measure = () => {
      vw = els.stage.clientWidth
      vh = els.stage.clientHeight
      // Onde o texto de cada projeto ficou: algumas composições se ajustam a ele.
      // Em lote, pra não forçar layout a cada texto: tira o top aplicado antes (escrita), mede todos
      // na posição do CSS (leitura), e só então aplica os tops novos (escrita).
      els.texts.forEach((el) => {
        el.style.top = ''
        el.style.bottom = ''
      })
      const stageTop = els.stage.getBoundingClientRect().top
      const boxes = els.texts.map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top - stageTop, bottom: r.bottom - stageTop }
      })
      textHeights = boxes.map((b) => Math.round(b.bottom - b.top)).join(',')
      comps = projects.map((p, i) => compose(p.id, vw, vh, desktop, boxes[i]))
      comps.forEach((c, i) => {
        if (c.textTop === undefined) return
        els.texts[i].style.top = `${Math.round(c.textTop)}px`
        els.texts[i].style.bottom = 'auto'
      })
      for (const f of frames) {
        f.baseW = Math.max(...comps.map((c) => c[f.key].w))
        f.baseH = f.baseW * f.ratio
        f.travel.style.width = `${f.baseW}px`
        f.travel.style.height = `${f.baseH}px`
      }
      // A varredura do fundo fixo gira em volta do mesmo centro que a do palco (preso no topo): as bordas se emendam.
      const holder = backdropWipe?.parentElement
      if (holder) holder.style.top = `${vh / 2}px`
    }
    const frameVars = (f: (typeof frames)[number], r: FrameRect, on: boolean) => ({
      x: r.cx - f.baseW / 2,
      y: r.cy - f.baseH / 2,
      scaleX: r.w / f.baseW,
      scaleY: r.w / f.baseW,
      rotation: r.rot,
      opacity: on ? 1 : 0,
    })
    // Borda sempre de 1px na tela, qualquer que seja a escala.
    const syncRing = () => {
      for (const f of frames) {
        const s = Number(gsap.getProperty(f.travel, 'scaleX')) || 1
        f.travel.style.setProperty('--ring', `${1 / s}px`)
      }
    }
    const kids = (i: number) => Array.from(els.texts[i].children)

    /**
     * A timeline mestra: uma troca de STEP segundos entre cada par de projetos.
     * Etiqueta p0..p4 no fim de cada troca. Ir pra frente ou pra trás é só andar nela.
     */
    const build = () => {
      master?.kill()
      // Estado do projeto 0 aplicado na hora. Dentro da timeline (set no tempo 0) ele não apareceria:
      // ela nasce pausada no 0, e ir pro 0 não muda nada, então nada é desenhado até o primeiro passo.
      const c0 = comps[0]
      gsap.set(els.deskTravel, frameVars(frames[0], c0.desk, c0.deskOn))
      gsap.set(els.mobTravel, frameVars(frames[1], c0.mob, c0.mobOn))
      for (let j = 0; j < n; j++) {
        gsap.set([els.deskLayers[j], els.mobLayers[j]], { opacity: j === 0 ? 1 : 0 })
        gsap.set(els.names[j], { x: 0, opacity: j === 0 ? NAME_OPACITY : 0 })
        gsap.set(kids(j), { y: 0, opacity: j === 0 ? 1 : 0 })
      }
      gsap.set(els.stage, { backgroundColor: projects[0].background })
      if (backdrop) gsap.set(backdrop, { backgroundColor: projects[0].background })
      gsap.set(wipes, { xPercent: -100, backgroundColor: projects[0].background })
      gsap.set(els.glow, { '--glow': projects[0].accent })

      const tl = gsap.timeline({ paused: true, onUpdate: syncRing })
      tl.addLabel(label(0), 0)

      const move = { duration: STEP, ease: 'power3.inOut', immediateRender: false }
      for (let i = 0; i < n - 1; i++) {
        const t = i * STEP
        const a = comps[i]
        const b = comps[i + 1]
        // Frames viajam até a nova composição.
        tl.fromTo(els.deskTravel, frameVars(frames[0], a.desk, a.deskOn), { ...frameVars(frames[0], b.desk, b.deskOn), ...move }, t)
        tl.fromTo(els.mobTravel, frameVars(frames[1], a.mob, a.mobOn), { ...frameVars(frames[1], b.mob, b.mobOn), ...move }, t)
        // Imagem troca no meio da viagem.
        tl.fromTo([els.deskLayers[i], els.mobLayers[i]], { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'none', immediateRender: false }, t + 0.35)
        tl.fromTo([els.deskLayers[i + 1], els.mobLayers[i + 1]], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, t + 0.35)
        // Varredura diagonal: a cor do próximo cobre a tela; no fim vira o fundo e a camada volta pro lugar.
        tl.fromTo(
          wipes,
          { xPercent: -100, backgroundColor: projects[i + 1].background },
          { xPercent: 0, ...move },
          t,
        )
        tl.set(els.stage, { backgroundColor: projects[i + 1].background }, t + STEP)
        if (backdrop) tl.set(backdrop, { backgroundColor: projects[i + 1].background }, t + STEP)
        tl.set(wipes, { xPercent: -100 }, t + STEP)
        // Luz troca de cor apagando e acendendo.
        tl.fromTo(els.glow, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: 'power1.in', immediateRender: false }, t)
        tl.set(els.glow, { '--glow': projects[i + 1].accent }, t + 0.35)
        tl.fromTo(els.glow, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', immediateRender: false }, t + 0.45)
        // Nome em contorno: o atual sai por um lado, o próximo entra pelo outro.
        tl.fromTo(els.names[i], { x: 0, opacity: NAME_OPACITY }, { x: -vw * 0.5, opacity: 0, ...move, duration: 0.7 }, t)
        tl.fromTo(els.names[i + 1], { x: vw * 0.5, opacity: 0 }, { x: 0, opacity: NAME_OPACITY, ...move, duration: 0.8 }, t + 0.3)
        // Texto: o atual sai pra cima, o próximo entra de baixo, em stagger.
        tl.fromTo(
          kids(i),
          { y: 0, opacity: 1 },
          { y: -40, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', immediateRender: false },
          t,
        )
        tl.fromTo(
          kids(i + 1),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out', immediateRender: false },
          t + 0.5,
        )
        tl.addLabel(label(i + 1), t + STEP)
      }
      master = tl
    }

    const setCurrent = (i: number) => {
      current = i
      els.texts.forEach((el, j) => {
        el.style.pointerEvents = j === i ? 'auto' : 'none'
        el.inert = j !== i
      })
      cb.current.onCurrent(i)
      syncVideos()
    }

    /** Coloca o projeto i no lugar, sem animação. */
    const applyInstant = (i: number) => {
      moving?.kill()
      moving = null
      master?.seek(label(i), false)
      syncRing()
      setCurrent(i)
    }

    // --- Vídeos: só com mídia em vídeo; o atual e os vizinhos carregam, só o atual toca ---
    const loaded = new Array<boolean>(n).fill(false)
    const allowed = (i: number) => projects[i].media === 'video' && (!posterOnly || manual.current.has(i))
    const load = (i: number) => {
      const video = els.videos[i]
      if (!video || loaded[i]) return
      const v = projects[i].videos[comps[i]?.hero ?? 'desktop']
      const webm = v.webm && video.canPlayType('video/webm') !== '' && video.dataset.webmFailed !== '1'
      video.muted = true
      video.src = webm && v.webm ? v.webm : v.mp4
      video.load()
      loaded[i] = true
    }
    const unload = (i: number) => {
      const video = els.videos[i]
      if (!video || !loaded[i]) return
      video.pause()
      video.removeAttribute('src')
      video.load()
      loaded[i] = false
    }
    function syncVideos() {
      for (let i = 0; i < n; i++) {
        const video = els.videos[i]
        if (!video) continue
        if (stageNear && Math.abs(i - current) <= 1 && allowed(i)) load(i)
        else unload(i)
        if (stageVisible && i === current && loaded[i]) video.play().catch(() => undefined)
        else video.pause()
      }
    }
    // WebM que o navegador não abre: cai pro MP4.
    const onVideoError = (e: Event) => {
      const video = e.currentTarget as HTMLVideoElement
      const i = els.videos.indexOf(video)
      if (i < 0 || !loaded[i] || !video.currentSrc.endsWith('.webm')) return
      video.dataset.webmFailed = '1'
      loaded[i] = false
      syncVideos()
    }
    els.videos.forEach((v) => v?.addEventListener('error', onVideoError))
    const nearIO = new IntersectionObserver(
      ([e]) => {
        stageNear = e.isIntersecting
        if (stageNear && !ready) setup()
        syncVideos()
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    nearIO.observe(els.stage)
    api.current.playManually = (i: number) => {
      manual.current.add(i)
      syncVideos()
    }

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

    let drift = 0
    let boost = 0
    let focusAfter: 'first' | 'last' | null = null
    const focusables = (i: number) => Array.from(els.texts[i].querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))

    const goto = (next: number, dir: 1 | -1) => {
      setCurrent(next)
      boost = 700 * dir
      if (!master) return
      if (reduced) {
        const tl = gsap.timeline({ onComplete: done })
        tl.to(els.content, { opacity: 0, duration: 0.25 })
          .call(() => {
            master?.seek(label(next), false)
            syncRing()
          })
          .to(els.content, { opacity: 1, duration: 0.3 })
        moving = tl
        return
      }
      moving = master.tweenTo(label(next), { ease: 'none', onComplete: done })
    }
    function done() {
      moving = null
      cooldownUntil = performance.now() + cooldown
      syncRing()
      if (focusAfter) {
        const list = focusables(current)
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
    const stageTop = () => els.stage.getBoundingClientRect().top
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
    const section = els.stage.closest('section')
    const neighbors = touchStage
      ? [section?.previousElementSibling, section?.nextElementSibling].filter((el): el is HTMLElement => el instanceof HTMLElement)
      : []
    const holdVisuals = (on: boolean) => {
      if (!touchStage) return
      if (backdrop) backdrop.style.opacity = on ? '1' : '0'
      neighbors.forEach((el) => {
        el.style.visibility = on ? 'hidden' : ''
      })
      els.stage.style.touchAction = on ? 'none' : ''
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
      els.stage.dataset.engaged = 'true'
      cb.current.onEngaged(true)
    }

    const disengage = () => {
      if (!engaged) return
      engaged = false
      listen(false)
      holdVisuals(false)
      releaseScroll()
      delete els.stage.dataset.engaged
      cb.current.onEngaged(false)
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
      // Palco inteiro fora da tela: é a hora de deixar pronto o projeto pelo qual ele vai entrar
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

    // Tab no último foco da placa avança de projeto (Shift+Tab no primeiro volta); nas pontas solta o palco e deixa
    // o navegador seguir. Sem isso o foco pulava pra seção seguinte com a página rolando por baixo do palco.
    const onTab = (e: KeyboardEvent) => {
      if (!engaged || e.key !== 'Tab') return
      if (moving) {
        e.preventDefault()
        return
      }
      const list = focusables(current)
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
        if (target === els.stage && ready && current !== 0) applyInstant(0)
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

    // --- Vida contínua: nome deslizando, luz atrás do frame, flutuação e brilho ---
    const trackX = els.nameTracks.map((t) => gsap.quickSetter(t, 'x', 'px') as (v: number) => void)
    const glowX = gsap.quickSetter(els.glow, 'x', 'px') as (v: number) => void
    const glowY = gsap.quickSetter(els.glow, 'y', 'px') as (v: number) => void
    let pointer: { x: number; y: number } | null = null
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    let gx = 0
    let gy = 0

    const tick = (_t: number, deltaMs: number) => {
      if (!ready) return
      const dt = tickerDt(deltaMs)
      const velocity = Math.abs(getLenis()?.velocity ?? 0)
      if (!reduced) drift += (DRIFT + velocity * 40 + boost) * dt
      boost *= Math.exp(-2.5 * dt)
      els.nameTracks.forEach((t, j) => {
        const unit = (t.firstElementChild as HTMLElement | null)?.offsetWidth || vw
        trackX[j](-(((drift % unit) + unit) % unit))
      })
      // Luz: segue o mouse devagar no desktop; no mobile fica no frame principal.
      const c = comps[current]
      const main = c.deskOn ? c.desk : c.mob
      const rect = els.stage.getBoundingClientRect()
      const tx = desktop && pointer && !reduced ? pointer.x - rect.left : main.cx
      const ty = desktop && pointer && !reduced ? pointer.y - rect.top : main.cy
      const k = 1 - Math.exp(-1.6 * dt)
      gx += (tx - gx) * k
      gy += (ty - gy) * k
      glowX(gx)
      glowY(gy)
    }

    let loops: gsap.core.Animation[] = []
    if (!reduced) {
      loops = [
        gsap.to(els.deskFloat, { y: -2.5, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }),
        gsap.to(els.mobFloat, { y: -2.5, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5, paused: true }),
        ...els.glints.map((g, i) =>
          gsap.fromTo(
            g,
            { xPercent: -100 },
            { xPercent: 300, duration: 1.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 6.6, delay: 2 + i * 0.3, paused: true },
          ),
        ),
      ]
    }
    let running = false
    const vis = watchVisibility(els.stage, (v) => {
      stageVisible = v
      if (v && !running) gsap.ticker.add(tick)
      if (!v && running) gsap.ticker.remove(tick)
      running = v
      loops.forEach((l) => (v ? l.play() : l.pause()))
      syncVideos()
    })

    /**
     * Monta o palco (medidas, timeline mestra, estado do projeto atual). Pesado, então só roda quando o palco
     * chega a uma tela de distância, fora do carregamento da página. Até lá o conteúdo fica invisível.
     */
    function setup(reengage = true) {
      if (ready || stopped) return
      ready = true
      measure()
      build()
      // Celular: montado com a página abaixo do palco (flick rápido vindo de baixo), já nasce no último projeto.
      const start = touchStage && !engaged && stageTop() < 0 && !memory.current.engaged ? n - 1 : current
      gx = comps[start].desk.cx
      gy = comps[start].desk.cy
      applyInstant(start)
      els.content.style.visibility = ''
      // Estava preso antes de remontar: continua preso no mesmo projeto.
      if (reengage && memory.current.engaged && Math.abs(stageTop()) <= EDGE) engage(start)
      // As fontes mudam a altura do texto: se mudou mesmo, mede de novo.
      document.fonts.ready.then(() => {
        if (stopped) return
        const before = textHeights
        const now = els.texts.map((el) => Math.round(el.getBoundingClientRect().height)).join(',')
        if (now !== before) requestRebuild()
      })
    }

    function rebuild() {
      measure()
      build()
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
      if (els.stage.clientWidth !== vw || els.stage.clientHeight !== vh) requestRebuild()
      else if (engaged && !snapping && Math.abs(stageTop()) > 1) snapNow()
      scheduleRefresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      stopped = true
      memory.current = { current, engaged }
      moving?.kill()
      master?.kill()
      vis.kill()
      touchObserver.kill()
      offLock()
      offNav()
      disengage()
      nearIO.disconnect()
      loops.forEach((l) => l.kill())
      gsap.ticker.remove(tick)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchend', onTouchEnd)
      refreshCall?.kill()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', onTab)
      jumpTimer?.kill()
      snapFallback?.kill()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      els.videos.forEach((v, i) => {
        v?.removeEventListener('error', onVideoError)
        if (loaded[i]) unload(i)
      })
    }
  }, [getEls, projects, desktop, posterOnly])

  return api
}

import { useEffect, useRef } from 'react'
import { gsap, Observer } from './gsap'
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
}

interface Options {
  projects: Project[]
  desktop: boolean
  posterOnly: boolean
  onCurrent: (index: number) => void
  onEngaged: (engaged: boolean) => void
}

const STEP = 1.1 // duração de uma troca, em segundos
const GAP = 200 // ms sem wheel que separam um gesto do outro
const EDGE = 12 // px da fronteira do palco em que ele já prende
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
  const cb = useRef({ onCurrent, onEngaged })
  cb.current = { onCurrent, onEngaged }

  useEffect(() => {
    const found = getEls()
    if (!found) return
    const els: StageEls = found
    const n = projects.length
    const reduced = prefersReducedMotion()
    const cooldown = desktop ? 250 : 350

    let vw = 0
    let vh = 0
    let comps: Composition[] = []
    let current = 0
    let engaged = false
    let master: gsap.core.Timeline | null = null
    let moving: gsap.core.Animation | null = null
    let cooldownUntil = 0
    let stageVisible = false
    let stageNear = false

    // --- Frames: tamanho base (o maior que assumem), e daí só transform ---
    const frames = [
      { travel: els.deskTravel, key: 'desk' as const, baseW: 0, baseH: 0, ratio: 1000 / 1600 },
      { travel: els.mobTravel, key: 'mob' as const, baseW: 0, baseH: 0, ratio: 1039 / 480 },
    ]
    gsap.set([els.deskTravel, els.mobTravel], { transformOrigin: '50% 50%' })

    const measure = () => {
      vw = els.stage.clientWidth
      vh = els.stage.clientHeight
      comps = projects.map((p) => compose(p.id, vw, vh, desktop))
      for (const f of frames) {
        f.baseW = Math.max(...comps.map((c) => c[f.key].w))
        f.baseH = f.baseW * f.ratio
        f.travel.style.width = `${f.baseW}px`
        f.travel.style.height = `${f.baseH}px`
      }
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
     * A timeline mestra: estado do projeto 0 no começo, e uma troca de STEP segundos entre cada par.
     * Etiqueta p0..p4 no fim de cada troca. Ir pra frente ou pra trás é só andar nela.
     */
    const build = () => {
      master?.kill()
      const tl = gsap.timeline({ paused: true, onUpdate: syncRing })
      const c0 = comps[0]
      tl.set(els.deskTravel, frameVars(frames[0], c0.desk, c0.deskOn), 0)
      tl.set(els.mobTravel, frameVars(frames[1], c0.mob, c0.mobOn), 0)
      for (let j = 0; j < n; j++) {
        tl.set([els.deskLayers[j], els.mobLayers[j]], { opacity: j === 0 ? 1 : 0 }, 0)
        tl.set(els.names[j], { x: 0, opacity: j === 0 ? NAME_OPACITY : 0 }, 0)
        tl.set(kids(j), { y: 0, opacity: j === 0 ? 1 : 0 }, 0)
      }
      tl.set(els.stage, { backgroundColor: projects[0].background }, 0)
      tl.set(els.wipe, { xPercent: -100, backgroundColor: projects[0].background }, 0)
      tl.set(els.glow, { '--glow': projects[0].accent }, 0)
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
          els.wipe,
          { xPercent: -100, backgroundColor: projects[i + 1].background },
          { xPercent: 0, ...move },
          t,
        )
        tl.set(els.stage, { backgroundColor: projects[i + 1].background }, t + STEP)
        tl.set(els.wipe, { xPercent: -100 }, t + STEP)
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
        syncVideos()
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    nearIO.observe(els.stage)
    api.current.playManually = (i: number) => {
      manual.current.add(i)
      syncVideos()
    }

    // --- Gestos: um gesto vale um passo ---
    let gesture = 0 // aumenta a cada gesto novo
    let spent = -1 // último gesto já usado (ou descartado)
    let lastWheel = 0
    const onRawWheel = () => {
      const now = performance.now()
      if (now - lastWheel > GAP) gesture++
      lastWheel = now
    }
    const onPress = () => {
      gesture++
    }
    // Antes do Observer (captura), pra o gesto já estar contado quando ele avisar.
    window.addEventListener('wheel', onRawWheel, { capture: true, passive: true })
    window.addEventListener('touchstart', onPress, { capture: true, passive: true })
    window.addEventListener('pointerdown', onPress, { capture: true, passive: true })

    let drift = 0
    let boost = 0

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
    }

    function step(dir: 1 | -1) {
      if (!engaged) return
      // Mesmo gesto que já andou (inércia do trackpad, swipe longo): nada.
      if (gesture === spent) return
      spent = gesture
      // Gesto que chegou durante a troca ou no intervalo depois dela é descartado inteiro.
      if (moving || performance.now() < cooldownUntil) return
      const next = current + dir
      if (next < 0 || next >= n) release(dir)
      else goto(next, dir)
    }

    const wheelObserver = Observer.create({
      target: window,
      type: 'wheel',
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onUp: () => step(1),
      onDown: () => step(-1),
    })
    const touchObserver = Observer.create({
      target: window,
      type: 'touch',
      tolerance: 40,
      preventDefault: true,
      onUp: () => step(1),
      onDown: () => step(-1),
    })
    const observers = [wheelObserver, touchObserver]
    const listen = (on: boolean) => observers.forEach((o) => (on ? o.enable() : o.disable()))
    listen(false)

    // --- Prender e soltar ---
    const stageTop = () => els.stage.getBoundingClientRect().top
    // De que lado da fronteira a tela está: acima do palco, abaixo, ou acabou de soltar numa direção.
    let side: 'above' | 'below' | 'released-up' | 'released-down' = stageTop() > 0 ? 'above' : 'below'

    // Encosta o palco no topo. Scroll nativo primeiro: com o Lenis parado, a posição que ele guarda fica velha
    // e um scrollTo pra "onde ele acha que está" não faz nada.
    const snap = () => {
      const y = Math.round(stageTop() + window.scrollY)
      window.scrollTo(0, y)
      getLenis()?.scrollTo(y, { immediate: true, force: true })
    }

    const engage = (i: number) => {
      if (engaged || isNavigating() || isScrollLocked()) return
      engaged = true
      snap()
      holdScroll()
      if (i !== current) applyInstant(i)
      spent = gesture // o gesto que trouxe até aqui não conta como passo
      cooldownUntil = performance.now() + cooldown
      listen(true)
      els.stage.dataset.engaged = 'true'
      cb.current.onEngaged(true)
    }

    const disengage = () => {
      if (!engaged) return
      engaged = false
      listen(false)
      releaseScroll()
      delete els.stage.dataset.engaged
      cb.current.onEngaged(false)
    }

    // Solta o scroll e deixa a página seguir com o gesto do usuário.
    function release(dir: 1 | -1) {
      disengage()
      side = dir > 0 ? 'released-down' : 'released-up'
    }

    // A cada scroll: cruzou a fronteira do palco? Prende.
    const onScroll = () => {
      if (engaged || isNavigating() || isScrollLocked()) return
      const top = stageTop()
      // Perto o bastante da fronteira já prende: o scroll suave desacelera e pode parar a 1px sem cruzar.
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
      gesture++
      step(down ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)

    // Menu e ficha por cima: gestos param de ser lidos enquanto a camada está aberta.
    const offLock = onLockChange((locked) => {
      if (engaged) listen(!locked)
    })

    // Navegação pelo menu atravessa o palco sem prender; no fim, prende se parou nele.
    const offNav = onNavigate((phase) => {
      if (phase === 'start') {
        if (moving) applyInstant(current)
        disengage()
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
      const dt = tickerDt(deltaMs)
      const velocity = Math.abs(getLenis()?.velocity ?? 0)
      drift += (DRIFT + velocity * 40 + boost) * dt
      boost *= Math.exp(-2.5 * dt)
      els.nameTracks.forEach((t, j) => {
        const unit = (t.firstElementChild as HTMLElement | null)?.offsetWidth || vw
        trackX[j](-(((drift % unit) + unit) % unit))
      })
      // Luz: segue o mouse devagar no desktop; no mobile fica no frame principal.
      const c = comps[current]
      const main = c.deskOn ? c.desk : c.mob
      const rect = els.stage.getBoundingClientRect()
      const tx = desktop && pointer ? pointer.x - rect.left : main.cx
      const ty = desktop && pointer ? pointer.y - rect.top : main.cy
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

    measure()
    build()
    gx = comps[0].desk.cx
    gy = comps[0].desk.cy
    applyInstant(0)

    const onResize = () => {
      measure()
      build()
      applyInstant(current)
      if (engaged) snap()
    }
    window.addEventListener('resize', onResize)

    return () => {
      moving?.kill()
      master?.kill()
      vis.kill()
      observers.forEach((o) => o.kill())
      offLock()
      offNav()
      disengage()
      nearIO.disconnect()
      loops.forEach((l) => l.kill())
      gsap.ticker.remove(tick)
      window.removeEventListener('wheel', onRawWheel, { capture: true })
      window.removeEventListener('touchstart', onPress, { capture: true })
      window.removeEventListener('pointerdown', onPress, { capture: true })
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
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

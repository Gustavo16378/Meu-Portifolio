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
  /** Varredura diagonal: um preenchimento só, reiniciado a cada troca. */
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

const TRAVEL = 1.15
const COOLDOWN = 280 // ms depois de uma troca, pra inércia do trackpad não pular dois projetos
const NAME_OPACITY = 0.55
const DRIFT = 26 // px/s do nome em contorno, parado

/**
 * Palco da seção de projetos. Quando o topo do palco chega no topo da tela, o scroll trava e
 * cada gesto (wheel, toque, seta, page up/down, espaço) leva pro projeto seguinte ou anterior numa
 * timeline completa; gestos durante a troca são ignorados. No primeiro, gesto pra cima solta pra seção
 * anterior; no último, gesto pra baixo solta pra seguinte.
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
    const els = getEls()
    if (!els) return
    const n = projects.length
    const reduced = prefersReducedMotion()

    let vw = 0
    let vh = 0
    let comps: Composition[] = []
    let current = 0
    let engaged = false
    let releasing = false
    let busy: gsap.core.Timeline | null = null
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
    const setInteractive = () =>
      els.texts.forEach((el, j) => {
        el.style.pointerEvents = j === current ? 'auto' : 'none'
        el.inert = j !== current
      })
    const setGlowColor = (i: number) => els.glow.style.setProperty('--glow', projects[i].accent)

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
    const syncVideos = () => {
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

    /** Coloca o projeto i no lugar, sem animação. */
    const applyInstant = (i: number) => {
      busy?.progress(1)
      current = i
      const c = comps[i]
      gsap.set(els.deskTravel, frameVars(frames[0], c.desk, c.deskOn))
      gsap.set(els.mobTravel, frameVars(frames[1], c.mob, c.mobOn))
      syncRing()
      for (let j = 0; j < n; j++) {
        gsap.set([els.deskLayers[j], els.mobLayers[j]], { opacity: j === i ? 1 : 0 })
        gsap.set(els.names[j], { x: 0, opacity: j === i ? NAME_OPACITY : 0 })
        gsap.set(kids(j), { y: 0, opacity: j === i ? 1 : 0 })
      }
      gsap.set(els.stage, { backgroundColor: projects[i].background })
      gsap.set(els.wipe, { xPercent: -100 })
      setGlowColor(i)
      setInteractive()
      cb.current.onCurrent(i)
      syncVideos()
    }

    // --- Troca de projeto: uma timeline só ---
    let drift = 0
    let boost = 0

    const goto = (next: number, dir: 1 | -1) => {
      const from = current
      const b = comps[next]
      current = next
      setInteractive()
      cb.current.onCurrent(next)
      syncVideos()

      const tl = gsap.timeline({
        onComplete: () => {
          busy = null
          cooldownUntil = performance.now() + COOLDOWN
          syncRing()
        },
      })
      busy = tl

      if (reduced) {
        tl.to(els.content, { opacity: 0, duration: 0.25 })
          .call(() => {
            busy = null
            applyInstant(next)
            busy = tl
          })
          .to(els.content, { opacity: 1, duration: 0.3 })
        return
      }

      boost = 700 * dir
      // Frames viajam com mola até a nova composição.
      tl.to(els.deskTravel, { ...frameVars(frames[0], b.desk, b.deskOn), duration: TRAVEL, ease: 'back.out(1.25)', onUpdate: syncRing }, 0)
      tl.to(els.mobTravel, { ...frameVars(frames[1], b.mob, b.mobOn), duration: TRAVEL, ease: 'back.out(1.25)' }, 0.06)
      // Imagem troca no meio da viagem.
      tl.to([els.deskLayers[from], els.mobLayers[from]], { opacity: 0, duration: 0.3, ease: 'none' }, 0.3)
      tl.to([els.deskLayers[next], els.mobLayers[next]], { opacity: 1, duration: 0.3, ease: 'none' }, 0.3)
      // Varredura diagonal: a cor do próximo cobre a tela vindo do lado do gesto; no fim vira o fundo e a varredura some.
      tl.set(els.wipe, { backgroundColor: projects[next].background, xPercent: dir > 0 ? -100 : 100 }, 0)
      tl.to(els.wipe, { xPercent: 0, duration: 0.85, ease: 'power3.inOut' }, 0)
      tl.set(els.stage, { backgroundColor: projects[next].background }, 0.85)
      tl.set(els.wipe, { xPercent: -100 }, 0.85)
      // Luz troca de cor apagando e acendendo.
      tl.to(els.glow, { opacity: 0, duration: 0.3 }, 0)
      tl.call(() => setGlowColor(next), undefined, 0.3)
      tl.to(els.glow, { opacity: 1, duration: 0.6 }, 0.4)
      // Nome em contorno: o atual sai por um lado, o próximo entra pelo outro.
      tl.to(els.names[from], { x: -dir * vw * 0.5, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      tl.fromTo(els.names[next], { x: dir * vw * 0.5, opacity: 0 }, { x: 0, opacity: NAME_OPACITY, duration: 0.8, ease: 'power3.out' }, 0.35)
      // Texto: o atual sai pra cima, o próximo entra de baixo, em stagger.
      tl.to(kids(from), { y: -40, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.in' }, 0)
      tl.fromTo(kids(next), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' }, 0.5)
    }

    // --- Prender e soltar ---
    const stageY = () => els.stage.getBoundingClientRect().top + window.scrollY

    function step(dir: 1 | -1) {
      if (!engaged || busy || performance.now() < cooldownUntil) return
      const next = current + dir
      if (next < 0 || next >= n) release(dir)
      else goto(next, dir)
    }

    const observer = Observer.create({
      target: window,
      type: 'wheel,touch',
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onUp: () => step(1),
      onDown: () => step(-1),
    })
    observer.disable()

    const engage = (i: number) => {
      if (engaged || releasing || isNavigating() || isScrollLocked()) return
      engaged = true
      const y = stageY()
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
      holdScroll()
      if (i !== current) applyInstant(i)
      observer.enable()
      cooldownUntil = performance.now() + COOLDOWN
      cb.current.onEngaged(true)
    }

    const disengage = () => {
      if (!engaged) return
      engaged = false
      observer.disable()
      releaseScroll()
      cb.current.onEngaged(false)
    }

    function release(dir: 1 | -1) {
      disengage()
      releasing = true
      const target = stageY() + dir * vh * 0.75
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { duration: 1, force: true })
      else window.scrollTo({ top: target, behavior: 'smooth' })
      gsap.delayedCall(1.1, () => {
        releasing = false
      })
    }

    const onKey = (e: KeyboardEvent) => {
      if (!engaged || e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, [role=dialog]')) return
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key)
      const up = ['ArrowUp', 'PageUp'].includes(e.key)
      if (!down && !up) return
      e.preventDefault()
      step(down ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)

    // Chegou de cima: primeiro projeto. Chegou de baixo: último.
    const pin = ScrollTrigger.create({
      trigger: els.stage,
      start: 'top top',
      onEnter: () => engage(0),
      onLeaveBack: () => engage(n - 1),
    })

    // Menu e ficha por cima: gestos param de ser lidos enquanto a camada está aberta.
    const offLock = onLockChange((locked) => {
      if (!engaged) return
      if (locked) observer.disable()
      else observer.enable()
    })

    // Navegação pelo menu atravessa o palco sem prender; no fim, prende se parou nele.
    const offNav = onNavigate((phase) => {
      if (phase === 'start') {
        busy?.progress(1)
        disengage()
        return
      }
      const r = els.stage.getBoundingClientRect()
      if (Math.abs(r.top) < 4) engage(0)
      else if (r.top > 0) applyInstant(0)
      else applyInstant(n - 1)
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
    gx = comps[0].desk.cx
    gy = comps[0].desk.cy
    applyInstant(0)

    const onResize = () => {
      measure()
      applyInstant(current)
      if (engaged) getLenis()?.scrollTo(stageY(), { immediate: true, force: true })
    }
    window.addEventListener('resize', onResize)

    return () => {
      busy?.kill()
      pin.kill()
      vis.kill()
      observer.kill()
      offLock()
      offNav()
      disengage()
      nearIO.disconnect()
      loops.forEach((l) => l.kill())
      gsap.ticker.remove(tick)
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

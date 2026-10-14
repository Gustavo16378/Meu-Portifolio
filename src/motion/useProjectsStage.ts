import { useEffect, useRef } from 'react'
import { gsap } from './gsap'
import { getLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { tickerDt, watchVisibility } from './spring'
import { createSteppedStage, STEP, stepLabel as label, type StageMemory } from './steppedStage'
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

const NAME_OPACITY = 0.55
const DRIFT = 26 // px/s do nome em contorno, parado

/**
 * Palco da seção de projetos. A mecânica de prender, soltar e andar em passos é a do createSteppedStage; aqui
 * fica o conteúdo: as composições, a timeline das trocas (frames viajando, varredura, nome em contorno, luz,
 * texto), os vídeos e a vida contínua (nome deslizando, luz, flutuação e brilho).
 */
export function useProjectsStage(
  getEls: () => StageEls | null,
  { projects, desktop, posterOnly, onCurrent, onEngaged }: Options,
) {
  const manual = useRef<Set<number>>(new Set())
  const api = useRef<{ playManually: (i: number) => void }>({ playManually: () => undefined })
  // Sobrevive a remontagens (tela mudando entre mobile e desktop): projeto atual e se estava preso.
  const memory = useRef<StageMemory>({ current: 0, engaged: false })
  const cb = useRef({ onCurrent, onEngaged })
  cb.current = { onCurrent, onEngaged }

  useEffect(() => {
    const found = getEls()
    if (!found) return
    const els: StageEls = found
    const n = projects.length
    const reduced = prefersReducedMotion()
    const touchStage = !desktop
    const backdrop = touchStage ? (els.backdrop ?? null) : null
    const backdropWipe = touchStage ? (els.backdropWipe ?? null) : null
    const wipes = backdropWipe ? [els.wipe, backdropWipe] : els.wipe

    let vw = 0
    let comps: Composition[] = []
    let current = Math.min(memory.current.current, n - 1)
    let stageVisible = false
    let stageNear = false

    // --- Frames: tamanho base (o maior que assumem), e daí só transform ---
    const frames = [
      { travel: els.deskTravel, key: 'desk' as const, baseW: 0, baseH: 0, ratio: 1000 / 1600 },
      { travel: els.mobTravel, key: 'mob' as const, baseW: 0, baseH: 0, ratio: 1039 / 480 },
    ]
    gsap.set([els.deskTravel, els.mobTravel], { transformOrigin: '50% 50%' })

    const measure = (w: number, vh: number) => {
      vw = w
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
    const textHeights = () => els.texts.map((el) => Math.round(el.getBoundingClientRect().height)).join(',')

    /**
     * A timeline mestra: uma troca de STEP segundos entre cada par de projetos.
     * Etiqueta p0..p4 no fim de cada troca. Ir pra frente ou pra trás é só andar nela.
     */
    const build = () => {
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
      return tl
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
    // Antes do observador do palco: quando ele monta, os vídeos já sabem que o palco está perto.
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

    // --- Vida contínua: nome deslizando, luz atrás do frame, flutuação e brilho ---
    let drift = 0
    let boost = 0
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

    // Largura de uma repetição do nome em contorno, por faixa. Medida pelo ResizeObserver (depois do layout, e de novo
    // quando a fonte carrega ou a tela muda): ler offsetWidth a cada quadro, logo depois da troca escrever --ring,
    // forçava layout em todo quadro e derrubava a troca pra uns 30 quadros por segundo em celular lento.
    const units = els.nameTracks.map(() => 0)
    const unitObserver = new ResizeObserver((entries) => {
      for (const e of entries) {
        const j = els.nameTracks.findIndex((t) => t.firstElementChild === e.target)
        if (j < 0) continue
        // Aqui o layout já está pronto: ler offsetWidth não força nada (e dá o mesmo valor inteiro de antes).
        units[j] = (e.target as HTMLElement).offsetWidth
      }
    })
    els.nameTracks.forEach((t) => {
      if (t.firstElementChild) unitObserver.observe(t.firstElementChild)
    })

    const tick = (_t: number, deltaMs: number) => {
      if (!comps.length) return
      const dt = tickerDt(deltaMs)
      const velocity = Math.abs(getLenis()?.velocity ?? 0)
      if (!reduced) drift += (DRIFT + velocity * 40 + boost) * dt
      boost *= Math.exp(-2.5 * dt)
      els.nameTracks.forEach((_t2, j) => {
        const unit = units[j] || vw
        trackX[j](-(((drift % unit) + unit) % unit))
      })
      // Luz: segue o mouse devagar no desktop; no mobile fica no frame principal. A posição do palco só é lida quando
      // o mouse manda (no celular ela nunca é usada, e ler a cada quadro também forçava layout).
      const c = comps[current]
      const main = c.deskOn ? c.desk : c.mob
      const followPointer = desktop && pointer && !reduced
      const rect = followPointer ? els.stage.getBoundingClientRect() : null
      const tx = followPointer && pointer && rect ? pointer.x - rect.left : main.cx
      const ty = followPointer && pointer && rect ? pointer.y - rect.top : main.cy
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

    // --- Mecânica do palco: prender, soltar, um gesto por passo ---
    const stage = createSteppedStage({
      stage: els.stage,
      backdrop,
      count: n,
      desktop,
      reduced,
      memory,
      build: ({ vw: w, vh }) => {
        measure(w, vh)
        return build()
      },
      afterSeek: syncRing,
      fontKey: textHeights,
      onCurrent: (i) => {
        current = i
        els.texts.forEach((el, j) => {
          el.style.pointerEvents = j === i ? 'auto' : 'none'
          el.inert = j !== i
        })
        cb.current.onCurrent(i)
        syncVideos()
      },
      onStep: (dir) => {
        boost = 700 * dir
      },
      // Reduced-motion: o conteúdo some, o projeto troca no lugar e volta.
      reducedSwap: (seek, done) =>
        gsap
          .timeline({ onComplete: done })
          .to(els.content, { opacity: 0, duration: 0.25 })
          .call(seek)
          .to(els.content, { opacity: 1, duration: 0.3 }),
      focusables: (i) => Array.from(els.texts[i].querySelectorAll<HTMLElement>('a[href], button:not([disabled])')),
      onEngaged: (engaged) => cb.current.onEngaged(engaged),
      onSetup: (start) => {
        gx = comps[start].desk.cx
        gy = comps[start].desk.cy
        // Invisível até o palco ser montado (quando chega a uma tela de distância).
        els.content.style.visibility = ''
      },
    })

    return () => {
      vis.kill()
      stage.destroy()
      nearIO.disconnect()
      loops.forEach((l) => l.kill())
      gsap.ticker.remove(tick)
      unitObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      els.videos.forEach((v, i) => {
        v?.removeEventListener('error', onVideoError)
        if (loaded[i]) unload(i)
      })
    }
  }, [getEls, projects, desktop, posterOnly])

  return api
}

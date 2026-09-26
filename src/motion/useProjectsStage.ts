import { useEffect, useRef } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, createSpring, stepSpring, tickerDt, watchVisibility, type Spring } from './spring'
import { compose, SEGMENTS, type Composition, type FrameRect } from '../components/projectLayout'
import type { Project } from '../data/projects'

export interface StageEls {
  section: HTMLElement
  stage: HTMLElement
  /** Frames que viajam (desktop e mobile) e as caixas com a borda. */
  deskTravel: HTMLElement
  mobTravel: HTMLElement
  deskBox: HTMLElement
  mobBox: HTMLElement
  /** Uma camada por projeto dentro de cada frame (vídeo ou poster). */
  deskLayers: HTMLElement[]
  mobLayers: HTMLElement[]
  /** Nome em contorno de cada projeto (com cópias repetidas dentro). */
  names: HTMLElement[]
  /** Varreduras de cor: uma por troca de projeto e a última de volta pro preto. */
  wipers: HTMLElement[]
  /** Bloco de texto de cada projeto; os filhos entram e saem em stagger. */
  texts: HTMLElement[]
  /** Marcadores no fluxo, um por projeto, pra saber o que está a uma tela de distância. */
  markers: HTMLElement[]
  /** O vídeo que toca em cada projeto (o outro frame mostra poster). */
  videos: (HTMLVideoElement | null)[]
}

interface Options {
  projects: Project[]
  desktop: boolean
  posterOnly: boolean
  onCurrent: (index: number) => void
}

const FOLLOW = { stiffness: 95, damping: 12.5 }
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpRect = (a: FrameRect, b: FrameRect, t: number): FrameRect => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  w: lerp(a.w, b.w, t),
  rot: lerp(a.rot, b.rot, t),
})

interface FrameMotion {
  el: HTMLElement
  box: HTMLElement
  baseW: number
  baseH: number
  springs: { cx: Spring; cy: Spring; w: Spring; rot: Spring }
  set: { x: (v: number) => void; y: (v: number) => void; sx: (v: number) => void; sy: (v: number) => void; r: (v: number) => void }
  lastRing: number
}

/**
 * Controla o palco da seção de projetos, preso durante a seção inteira. A cada quadro lê onde o scroll
 * está (projeto atual e progresso da viagem até o próximo) e move tudo a partir disso, de forma reversível.
 * Devolve `playManually(i)`, usado pelo botão "ver em movimento" quando o aparelho só mostra poster.
 */
export function useProjectsStage(getEls: () => StageEls | null, { projects, desktop, posterOnly, onCurrent }: Options) {
  const manual = useRef<Set<number>>(new Set())
  const api = useRef<{ playManually: (i: number) => void }>({ playManually: () => undefined })

  useEffect(() => {
    const els = getEls()
    if (!els) return
    const n = projects.length
    const reduced = prefersReducedMotion()
    const seg = desktop ? SEGMENTS.desktop : SEGMENTS.mobile

    let vw = 0
    let vh = 0
    let comps: Composition[] = []
    let nameUnits: number[] = []

    const makeFrame = (el: HTMLElement, box: HTMLElement): FrameMotion => ({
      el,
      box,
      baseW: 0,
      baseH: 0,
      springs: { cx: createSpring(), cy: createSpring(), w: createSpring(), rot: createSpring() },
      set: {
        x: gsap.quickSetter(el, 'x', 'px') as (v: number) => void,
        y: gsap.quickSetter(el, 'y', 'px') as (v: number) => void,
        // quickSetter não aceita o atalho 'scale': os dois eixos separados.
        sx: gsap.quickSetter(el, 'scaleX') as (v: number) => void,
        sy: gsap.quickSetter(el, 'scaleY') as (v: number) => void,
        r: gsap.quickSetter(el, 'rotation', 'deg') as (v: number) => void,
      },
      lastRing: 0,
    })
    const desk = makeFrame(els.deskTravel, els.deskBox)
    const mob = makeFrame(els.mobTravel, els.mobBox)
    gsap.set([els.deskTravel, els.mobTravel], { transformOrigin: '50% 50%' })

    // Tamanho base de cada frame: o maior que ele assume, pra só reduzir com scale (vídeo nunca esticado).
    const measure = () => {
      vw = els.stage.clientWidth
      vh = els.stage.clientHeight
      comps = projects.map((p) => compose(p.id, vw, vh, desktop))
      desk.baseW = Math.max(...comps.map((c) => c.desk.w))
      desk.baseH = (desk.baseW * 800) / 1280
      mob.baseW = Math.max(...comps.map((c) => c.mob.w))
      mob.baseH = (mob.baseW * 844) / 390
      for (const f of [desk, mob]) {
        f.el.style.width = `${f.baseW}px`
        f.el.style.height = `${f.baseH}px`
      }
      nameUnits = els.names.map((l) => (l.firstElementChild as HTMLElement | null)?.offsetWidth ?? vw)
    }
    measure()
    // Primeiro quadro já no lugar, sem viagem.
    for (const [f, r] of [
      [desk, comps[0].desk],
      [mob, comps[0].mob],
    ] as const) {
      f.springs.cx.value = f.springs.cx.target = r.cx
      f.springs.cy.value = f.springs.cy.target = r.cy
      f.springs.w.value = f.springs.w.target = r.w
      f.springs.rot.value = f.springs.rot.target = r.rot
    }

    // --- Vídeos: carregar perto, descarregar longe, tocar só o atual ---
    const near = new Array<boolean>(n).fill(false)
    const loaded = new Array<boolean>(n).fill(false)
    let visible = false
    let current = -1

    const srcFor = (i: number, video: HTMLVideoElement) => {
      const hero = comps[i]?.hero ?? 'desktop'
      const v = projects[i].videos[hero]
      const webm = v.webm && video.canPlayType('video/webm') !== '' && video.dataset.webmFailed !== '1'
      return webm && v.webm ? v.webm : v.mp4
    }
    const load = (i: number) => {
      const video = els.videos[i]
      if (!video || loaded[i]) return
      video.muted = true
      video.src = srcFor(i, video)
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
    const allowed = (i: number) => !posterOnly || manual.current.has(i)
    const syncLoading = () => {
      for (let i = 0; i < n; i++) {
        if (near[i] && allowed(i)) load(i)
        else if (!near[i]) unload(i)
      }
    }
    const syncPlayback = () => {
      els.videos.forEach((video, i) => {
        if (!video) return
        if (visible && i === current && loaded[i]) video.play().catch(() => undefined)
        else video.pause()
      })
    }
    // WebM que o navegador não abre: cai pro MP4.
    const onError = (e: Event) => {
      const video = e.currentTarget as HTMLVideoElement
      const i = els.videos.indexOf(video)
      if (i < 0 || !loaded[i] || !video.currentSrc.endsWith('.webm')) return
      video.dataset.webmFailed = '1'
      loaded[i] = false
      load(i)
      syncPlayback()
    }
    els.videos.forEach((v) => v?.addEventListener('error', onError))

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) near[els.markers.indexOf(e.target as HTMLElement)] = e.isIntersecting
        syncLoading()
        syncPlayback()
      },
      // A uma tela de distância já começa a carregar.
      { rootMargin: '100% 0px 100% 0px' },
    )
    els.markers.forEach((m) => io.observe(m))

    api.current.playManually = (i: number) => {
      manual.current.add(i)
      near[i] = true
      load(i)
      syncPlayback()
    }

    // --- Setters dos textos, nomes, varreduras e camadas ---
    const textKids = els.texts.map((t) => Array.from(t.children) as HTMLElement[])
    const textSet = textKids.map((kids) =>
      kids.map((k) => ({
        y: gsap.quickSetter(k, 'y', 'px') as (v: number) => void,
        o: gsap.quickSetter(k, 'opacity') as (v: number) => void,
      })),
    )
    const nameSet = els.names.map((el) => ({
      x: gsap.quickSetter(el, 'x', 'px') as (v: number) => void,
      o: gsap.quickSetter(el, 'opacity') as (v: number) => void,
    }))
    // Começa fora da tela; só o GSAP mexe no transform (um translate fixo no estilo somaria com o xPercent).
    gsap.set(els.wipers, { xPercent: -100 })
    const wipeSet = els.wipers.map((el) => gsap.quickSetter(el, 'xPercent') as (v: number) => void)
    const deskLayerO = els.deskLayers.map((el) => gsap.quickSetter(el, 'opacity') as (v: number) => void)
    const mobLayerO = els.mobLayers.map((el) => gsap.quickSetter(el, 'opacity') as (v: number) => void)
    const travelO = [gsap.quickSetter(els.deskTravel, 'opacity'), gsap.quickSetter(els.mobTravel, 'opacity')] as ((v: number) => void)[]

    const place = (f: FrameMotion, target: FrameRect, dt: number) => {
      const s = f.springs
      s.cx.target = target.cx
      s.cy.target = target.cy
      s.w.target = target.w
      s.rot.target = target.rot
      for (const sp of [s.cx, s.cy, s.w, s.rot]) {
        if (reduced) sp.value = sp.target
        else stepSpring(sp, dt, FOLLOW)
      }
      const scale = s.w.value / f.baseW
      f.set.x(s.cx.value - f.baseW / 2)
      f.set.y(s.cy.value - f.baseH / 2)
      f.set.sx(scale)
      f.set.sy(scale)
      f.set.r(s.rot.value)
      // Borda sempre de 1px na tela, qualquer que seja a escala.
      const ring = 1 / Math.max(scale, 0.05)
      if (Math.abs(ring - f.lastRing) > 0.02) {
        f.box.style.setProperty('--ring', `${ring}px`)
        f.lastRing = ring
      }
    }

    const tick = (time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      const top = els.section.getBoundingClientRect().top
      const s = -top // quanto da seção já passou
      const hold = seg.hold * vh
      const trans = seg.trans * vh
      const step = hold + trans

      // Onde estamos: projeto i, viagem t (0 parado, 1 chegou no próximo), fim de volta ao preto.
      const i = clamp(Math.floor(Math.max(s, 0) / step), 0, n - 1)
      const local = Math.max(s, 0) - i * step
      let t = 0
      let end = 0
      if (i === n - 1) {
        end = clamp((local - hold) / (seg.end * vh), 0, 1)
      } else if (local > hold) {
        t = clamp((local - hold) / trans, 0, 1)
      }
      const te = easeInOut(t)
      const next = Math.min(i + 1, n - 1)

      // Entrada da seção: os frames sobem com mola enquanto o palco chega.
      const arrive = clamp(1 + s / (vh * 0.7), 0, 1)

      const a = comps[i]
      const b = comps[next]
      const lift = (1 - arrive) * vh * 0.3
      place(desk, { ...lerpRect(a.desk, b.desk, te), cy: lerp(a.desk.cy, b.desk.cy, te) + lift }, dt)
      place(mob, { ...lerpRect(a.mob, b.mob, te), cy: lerp(a.mob.cy, b.mob.cy, te) + lift * 1.2 }, dt)
      travelO[0](arrive)
      travelO[1](arrive)

      // Vídeo troca no meio da viagem.
      const cross = clamp((te - 0.35) / 0.3, 0, 1)
      for (let j = 0; j < n; j++) {
        const o = j === i ? (i === next ? 1 : 1 - cross) : j === next ? cross : 0
        deskLayerO[j](o)
        mobLayerO[j](o)
      }

      // Nome em contorno: desliza com o scroll (Lenis) e um pouco com o tempo; na troca, sai por um lado e o próximo entra pelo outro.
      for (let j = 0; j < n; j++) {
        const unit = nameUnits[j] || vw
        const drift = reduced ? 0 : -(((s * 0.25 + time * 14) % unit) + unit) % unit
        let slide = 0
        let o = 0
        if (j === i) {
          o = i === next ? 1 : reduced ? 1 - te : 1
          slide = reduced ? 0 : -te * vw
        } else if (j === next) {
          o = reduced ? te : te > 0 ? 1 : 0
          slide = reduced ? 0 : (1 - te) * vw
        }
        // Contorno discreto: é fundo, não compete com o texto.
        nameSet[j].o(o * 0.55)
        if (o > 0) nameSet[j].x(drift + slide)
      }

      // Varredura diagonal de cor: cada troca empurra a cor do próximo por cima.
      for (let k = 0; k < els.wipers.length; k++) {
        const p = k < n - 1 ? (k < i ? 1 : k === i ? te : 0) : end
        wipeSet[k](-100 + p * 100)
      }

      // Texto: o atual sai pra cima, o próximo entra de baixo, em stagger.
      for (let j = 0; j < n; j++) {
        const kids = textSet[j]
        kids.forEach((k, c) => {
          let y = 0
          let o = 0
          if (j === i) {
            const p = i === next ? 0 : clamp((te - c * 0.06) / 0.45, 0, 1)
            y = reduced ? 0 : -40 * p
            o = 1 - p
          } else if (j === next) {
            const p = clamp((te - 0.45 - c * 0.06) / 0.45, 0, 1)
            y = reduced ? 0 : 40 * (1 - p)
            o = p
          }
          k.y(y)
          k.o(o)
        })
      }

      // Projeto que está mais na tela: o único que toca e o único clicável.
      const now = t >= 0.5 ? next : i
      if (now !== current) {
        current = now
        els.texts.forEach((el, j) => {
          el.style.pointerEvents = j === current ? 'auto' : 'none'
          el.inert = j !== current
        })
        onCurrent(current)
        syncPlayback()
      }
    }

    let running = false
    const trigger = watchVisibility(els.section, (v) => {
      visible = v
      if (v && !running) gsap.ticker.add(tick)
      if (!v && running) gsap.ticker.remove(tick)
      running = v
      syncPlayback()
    })
    tick(gsap.ticker.time, 16)

    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
      io.disconnect()
      els.videos.forEach((v, i) => {
        v?.removeEventListener('error', onError)
        if (loaded[i]) unload(i)
      })
    }
  }, [getEls, projects, desktop, posterOnly, onCurrent])

  return api
}

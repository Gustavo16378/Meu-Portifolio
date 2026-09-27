import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { projects, projectById, type Project, type ProjectId } from '../data/projects'
import { compose, TEXT_LAYOUT, type Composition, type FrameRect } from './projectLayout'
import { ProjectLayer, frameBox, type AccentStyle } from './ProjectLayer'
import { Plaque } from './Plaque'
import { ProjectRail } from './ProjectRail'
import { TechSheet } from './TechSheet'
import { SectionChrome } from './SectionChrome'
import { GridBackdrop } from './GridBackdrop'
import { useOverlayState } from './useDialog'
import { useVideoPolicy } from './useVideoPolicy'

type BlockStyle = AccentStyle & Record<'--glow', string>

const NAME_OPACITY = 0.55
const DESK_RATIO = 1000 / 1600 // altura / largura do print desktop
const MOB_RATIO = 1039 / 480

interface BlockProps {
  project: Project
  index: number
  /** Composição desktop (tela a partir de 768px) ou mobile. */
  desktopLayout: boolean
  onSheet: () => void
  onActive: (index: number) => void
}

/**
 * Um projeto: bloco de uma tela com a composição (print, luz, nome em contorno e placa).
 * Entra pelo scroll: frame sobe com mola, texto em stagger; ao voltar pra cima, desfaz.
 */
function ProjectBlock({ project, index, desktopLayout, onSheet, onActive }: BlockProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const mobRef = useRef<HTMLDivElement>(null)
  const deskEnterRef = useRef<HTMLDivElement>(null)
  const mobEnterRef = useRef<HTMLDivElement>(null)
  const deskSkewRef = useRef<HTMLDivElement>(null)
  const mobSkewRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const active = useRef(onActive)
  active.current = onActive

  // Skew leve pela velocidade do scroll, só no frame.
  useScrollSkew(deskSkewRef, { factor: 0.08, max: 2.5, stiffness: 120, damping: 11 })
  useScrollSkew(mobSkewRef, { factor: 0.08, max: 2.5, stiffness: 120, damping: 11 })

  useLayoutEffect(() => {
    const root = rootRef.current
    const glow = glowRef.current
    const name = nameRef.current
    const track = trackRef.current
    const desk = deskRef.current
    const mob = mobRef.current
    const deskEnter = deskEnterRef.current
    const mobEnter = mobEnterRef.current
    const text = textRef.current
    if (!root || !glow || !name || !track || !desk || !mob || !deskEnter || !mobEnter || !text) return
    const reduced = prefersReducedMotion()
    let vw = 0
    let vh = 0
    let textHeight = 0
    let ctx: gsap.Context | null = null

    const place = (el: HTMLElement, r: FrameRect, ratio: number, on: boolean) => {
      const h = r.w * ratio
      el.style.width = `${Math.round(r.w)}px`
      el.style.height = `${Math.round(h)}px`
      el.style.visibility = on ? '' : 'hidden'
      gsap.set(el, { x: r.cx - r.w / 2, y: r.cy - h / 2, rotation: r.rot })
    }

    // Mede o texto na posição do CSS e monta a composição no bloco (uma tela, ou mais se o texto não couber).
    const measure = (): Composition => {
      root.style.height = ''
      text.style.top = ''
      text.style.bottom = ''
      vw = root.clientWidth
      vh = root.clientHeight
      const rootTop = root.getBoundingClientRect().top
      const r = text.getBoundingClientRect()
      const box = { top: r.top - rootTop, bottom: r.bottom - rootTop }
      textHeight = Math.round(box.bottom - box.top)
      let comp = compose(project.id, vw, vh, desktopLayout, box)
      // Tela muito baixa: em vez de encolher o print demais, o bloco cresce.
      const main = comp.deskOn ? comp.desk : comp.mob
      const minW = comp.deskOn ? vw * 0.6 : vw * 0.42
      if (main.w < minW) {
        vh += Math.ceil((minW - main.w) * (comp.deskOn ? DESK_RATIO : MOB_RATIO))
        root.style.height = `${vh}px`
        comp = compose(project.id, vw, vh, desktopLayout, box)
      }
      if (comp.textTop !== undefined) {
        text.style.top = `${Math.round(comp.textTop)}px`
        text.style.bottom = 'auto'
      }
      place(desk, comp.desk, DESK_RATIO, comp.deskOn)
      place(mob, comp.mob, MOB_RATIO, comp.mobOn)
      const focus = comp.deskOn ? comp.desk : comp.mob
      gsap.set(glow, { x: focus.cx, y: focus.cy })
      return comp
    }

    const build = () => {
      ctx?.revert()
      ctx = gsap.context(() => {
        const comp = measure()
        const frames = [comp.deskOn ? deskEnter : null, comp.mobOn ? mobEnter : null].filter((el): el is HTMLDivElement => !!el)
        const kids = Array.from(text.children)
        const enter = gsap.timeline({ paused: true })
        if (reduced) {
          enter.from([...frames, name], { opacity: 0, duration: 0.5 }, 0).from(kids, { opacity: 0, duration: 0.5, stagger: 0.05 }, 0.1)
        } else {
          enter
            .from(frames, { y: 72, opacity: 0, duration: 1, ease: 'back.out(1.6)', stagger: 0.1 }, 0)
            .from(name, { x: vw * 0.2, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0)
            .from(kids, { y: 32, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.06 }, 0.2)
        }
        ScrollTrigger.create({
          trigger: root,
          start: 'top 72%',
          onEnter: () => enter.play(),
          onLeaveBack: () => enter.reverse(),
        })
        // Trilho: este é o projeto atual enquanto cruza o meio da tela.
        ScrollTrigger.create({
          trigger: root,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) active.current(index)
          },
        })
        // Nome em contorno: parallax leve enquanto o bloco atravessa a tela.
        if (!reduced) {
          gsap.fromTo(
            track,
            { x: 0 },
            { x: -vw * 0.3, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.4 } },
          )
        }
      }, root)
    }
    build()

    // As fontes mudam a altura do texto: se mudou mesmo, monta de novo.
    let stopped = false
    document.fonts.ready.then(() => {
      if (stopped) return
      if (Math.round(text.getBoundingClientRect().height) !== textHeight) {
        build()
        ScrollTrigger.refresh()
      }
    })
    // Só a largura importa (a barra do navegador muda a altura da janela, não o svh do bloco).
    const onResize = () => {
      if (root.clientWidth !== vw) {
        build()
        ScrollTrigger.refresh()
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      stopped = true
      window.removeEventListener('resize', onResize)
      ctx?.revert()
    }
  }, [project, index, desktopLayout])

  const layout = TEXT_LAYOUT[project.id]
  const device = desktopLayout ? 'desktop' : 'mobile'
  const style: BlockStyle = { '--accent': project.accent, '--glow': project.accent }

  const frame = (kind: 'desktop' | 'mobile') => {
    const desk = kind === 'desktop'
    const radius = desk ? 'rounded-[6px]' : 'rounded-[14px] md:rounded-[16px]'
    return (
      <div ref={desk ? deskRef : mobRef} className="absolute top-0 left-0" style={{ visibility: 'hidden' }}>
        <div ref={desk ? deskEnterRef : mobEnterRef} className="size-full will-change-transform">
          <div ref={desk ? deskSkewRef : mobSkewRef} className="relative size-full will-change-transform">
            <div className={`${frameBox} ${radius}`}>
              <ProjectLayer project={project} kind={kind} playable={false} visible />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      data-project-block
      data-projects-stage={index === 0 ? '' : undefined}
      className="relative z-10 min-h-svh overflow-hidden"
      style={style}
    >
      {/* Luz na cor de acento atrás do frame principal */}
      <div ref={glowRef} aria-hidden className="pointer-events-none absolute top-0 left-0 will-change-transform">
        <div
          className="size-[90vmax] -translate-x-1/2 -translate-y-1/2 md:size-[70vmax]"
          style={{ backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--glow) 24%, transparent), transparent 62%)' }}
        />
      </div>

      {/* Nome em contorno, gigante, atrás do frame */}
      <div
        ref={nameRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 w-full -translate-y-1/2 ${layout.name}`}
        style={{ opacity: NAME_OPACITY }}
      >
        <div
          ref={trackRef}
          className="flex w-max font-display text-[22svh] leading-none whitespace-nowrap uppercase will-change-transform md:text-[30svh]"
          style={{ color: 'transparent', WebkitTextStroke: `1px ${project.accent}` }}
        >
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="pr-[0.3em]">
              {project.name}
            </span>
          ))}
        </div>
      </div>

      {frame('desktop')}
      {frame('mobile')}

      <Plaque
        project={project}
        onSheet={onSheet}
        overlay={layout.overlay[device]}
        shadow={layout.shadow[device]}
        center={layout.center}
        blockRef={textRef}
        className={`absolute z-10 ${layout.className}`}
      />
    </div>
  )
}

/**
 * Seção 03 em scroll normal (toque ou tela estreita): cinco blocos empilhados, um por tela,
 * cada um com a composição do projeto. A cor de fundo troca na fronteira entre dois blocos,
 * por um pano preso atrás deles cuja camada seguinte acende com scrub curto. Nada trava o scroll.
 */
export function ProjectsStack() {
  const listRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<(HTMLDivElement | null)[]>([])
  const policy = useVideoPolicy()
  const [current, setCurrent] = useState(0)
  const [inside, setInside] = useState(false)
  const sheet = useOverlayState()
  const [sheetId, setSheetId] = useState<ProjectId | null>(null)

  const { show } = sheet
  const openers = useMemo(
    () =>
      Object.fromEntries(
        projects.map((p) => [
          p.id,
          () => {
            setSheetId(p.id)
            show()
          },
        ]),
      ) as Record<ProjectId, () => void>,
    [show],
  )
  const onActive = useCallback((i: number) => setCurrent(i), [])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const blocks = Array.from(list.querySelectorAll<HTMLElement>('[data-project-block]'))
    const ctx = gsap.context(() => {
      blocks.forEach((block, i) => {
        const layer = layersRef.current[i]
        if (i === 0 || !layer) return
        // A cor do projeto seguinte cobre a anterior enquanto o topo dele sobe pelo meio da tela.
        gsap.fromTo(
          layer,
          { opacity: 0 },
          { opacity: 1, ease: 'none', scrollTrigger: { trigger: block, start: 'top 85%', end: 'top 15%', scrub: 0.3 } },
        )
      })
      ScrollTrigger.create({
        trigger: list,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => setInside(self.isActive),
      })
    }, list)
    return () => ctx.revert()
  }, [])

  const first = projects[0].background
  const last = projects[projects.length - 1].background

  return (
    <section id="projetos" data-section className="relative isolate overflow-x-clip">
      <h2 className="sr-only">Projetos</h2>
      <SectionChrome id="projetos" side="left" />
      <ProjectRail current={current} total={projects.length} visible={inside} />

      {/* Faixa de cor entrando no primeiro projeto */}
      <div aria-hidden className="relative -z-20 h-[30svh]" style={{ backgroundImage: `linear-gradient(to bottom, var(--c-bg), ${first})` }} />

      <div ref={listRef} className="relative">
        {/* Pano de fundo preso atrás dos blocos: uma camada por projeto, a atual acesa. */}
        <div data-sticky aria-hidden className="pointer-events-none sticky top-0 z-0 h-svh -mb-[100svh]">
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                layersRef.current[i] = el
              }}
              className="absolute inset-0"
              style={{ backgroundColor: p.background, opacity: i === 0 ? 1 : 0 } as CSSProperties}
            />
          ))}
          <GridBackdrop />
        </div>

        {projects.map((p, i) => (
          <ProjectBlock key={p.id} project={p} index={i} desktopLayout={policy.desktop} onSheet={openers[p.id]} onActive={onActive} />
        ))}
      </div>

      {/* Faixa de cor saindo do último projeto */}
      <div aria-hidden className="relative -z-20 h-[30svh]" style={{ backgroundImage: `linear-gradient(to bottom, ${last}, var(--c-bg))` }} />

      <TechSheet project={sheetId ? projectById(sheetId) : null} open={sheet.open} onClose={sheet.hide} />
    </section>
  )
}

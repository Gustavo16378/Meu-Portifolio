import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { projects, projectById, type Project, type ProjectId } from '../data/projects'
import { useProjectsStage, type StageEls } from '../motion/useProjectsStage'
import { useTilt } from '../motion/useTilt'
import { useScrollSkew } from '../motion/useScrollSkew'
import { heroOf, TEXT_LAYOUT } from './projectLayout'
import { useOverlayState } from './useDialog'
import { useVideoPolicy } from './useVideoPolicy'
import { ProjectRail } from './ProjectRail'
import { Plaque } from './Plaque'
import { TechSheet } from './TechSheet'
import { SectionChrome } from './SectionChrome'
import { GridBackdrop } from './GridBackdrop'

type AccentStyle = CSSProperties & Record<'--accent', string>

// Borda de 1px na cor de acento (compensada pela escala via --ring) e sombra suave.
const frameBox =
  'relative size-full overflow-hidden bg-surface [box-shadow:0_0_0_var(--ring,1px)_var(--frame-edge),var(--shadow-frame)]'

// Anel do tamanho da borda, onde passa o brilho.
const ringMask: CSSProperties = {
  inset: 'calc(var(--ring, 1px) * -1)',
  padding: 'var(--ring, 1px)',
  mask: 'linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)',
  WebkitMask: 'linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)',
  WebkitMaskComposite: 'xor',
}

interface LayerProps {
  project: Project
  kind: 'desktop' | 'mobile'
  playable: boolean
  layerRef: (el: HTMLDivElement | null) => void
  videoRef: (el: HTMLVideoElement | null) => void
}

/** Uma camada do frame: o print, ou o vídeo quando a mídia do projeto é vídeo e este frame é o que toca. */
function Layer({ project, kind, playable, layerRef, videoRef }: LayerProps) {
  const label = `${project.name} no ${kind === 'desktop' ? 'desktop' : 'celular'}`
  const print = project.prints[kind]
  const video = project.videos[kind]
  return (
    <div ref={layerRef} className="absolute inset-0 opacity-0">
      {project.media === 'video' && playable ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-label={label}
          className="block size-full object-cover object-top"
        />
      ) : project.media === 'video' ? (
        <img
          src={video.poster}
          alt={label}
          width={video.width}
          height={video.height}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-top"
        />
      ) : (
        <picture>
          <source
            srcSet={`${print.webpSmall} ${print.smallWidth}w, ${print.webp} ${print.width}w`}
            sizes={kind === 'desktop' ? '(min-width: 768px) 68vw, 96vw' : '(min-width: 768px) 20vw, 60vw'}
            type="image/webp"
          />
          <img
            src={print.png}
            alt={label}
            width={print.width}
            height={print.height}
            loading="lazy"
            decoding="async"
            className="block size-full object-cover object-top"
          />
        </picture>
      )}
    </div>
  )
}

type ListKey = 'deskLayers' | 'mobLayers' | 'names' | 'nameTracks' | 'texts' | 'glints'

/**
 * Seção 03. Um palco da altura da tela entre duas faixas de cor. Quando ele chega no topo, o scroll
 * trava e cada gesto troca de projeto (ver useProjectsStage). Cada projeto tem sua composição; os frames
 * viajam entre elas, o nome em contorno desliza atrás, a cor troca numa varredura diagonal.
 */
export function Projects() {
  const stageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const deskTravelRef = useRef<HTMLDivElement>(null)
  const mobTravelRef = useRef<HTMLDivElement>(null)
  const deskFloatRef = useRef<HTMLDivElement>(null)
  const mobFloatRef = useRef<HTMLDivElement>(null)
  const deskTiltRef = useRef<HTMLDivElement>(null)
  const mobTiltRef = useRef<HTMLDivElement>(null)
  const deskSkewRef = useRef<HTMLDivElement>(null)
  const mobSkewRef = useRef<HTMLDivElement>(null)
  const lists = useRef<Record<ListKey, (HTMLElement | null)[]>>({
    deskLayers: [],
    mobLayers: [],
    names: [],
    nameTracks: [],
    texts: [],
    glints: [],
  })
  const videos = useRef<(HTMLVideoElement | null)[]>([])

  const policy = useVideoPolicy()
  const [current, setCurrent] = useState(0)
  const [engaged, setEngaged] = useState(false)
  const sheet = useOverlayState()
  const [sheetId, setSheetId] = useState<ProjectId | null>(null)

  // Física só no frame: inclina 2 a 3 graus seguindo o mouse, skew leve pelo scroll. Nunca no <video>.
  useTilt(deskTiltRef, { maxX: 2, maxY: 3, perspective: 1600, stiffness: 60, damping: 9 })
  useTilt(mobTiltRef, { maxX: 2, maxY: 3, perspective: 1200, stiffness: 60, damping: 9 })
  useScrollSkew(deskSkewRef, { factor: 0.08, max: 2.5, stiffness: 120, damping: 11 })
  useScrollSkew(mobSkewRef, { factor: 0.08, max: 2.5, stiffness: 120, damping: 11 })

  // Lido pelo controlador depois do commit, quando os refs já existem.
  const getEls = useCallback((): StageEls | null => {
    const l = lists.current
    const all = (a: (HTMLElement | null)[], len = projects.length) =>
      a.length === len && a.every(Boolean) ? (a as HTMLElement[]) : null
    const [stage, content, wipe, glow] = [stageRef.current, contentRef.current, wipeRef.current, glowRef.current]
    const [deskTravel, mobTravel, deskFloat, mobFloat] = [
      deskTravelRef.current,
      mobTravelRef.current,
      deskFloatRef.current,
      mobFloatRef.current,
    ]
    const deskLayers = all(l.deskLayers)
    const mobLayers = all(l.mobLayers)
    const names = all(l.names)
    const nameTracks = all(l.nameTracks)
    const texts = all(l.texts)
    const glints = all(l.glints, 2)
    if (!stage || !content || !wipe || !glow || !deskTravel || !mobTravel || !deskFloat || !mobFloat) return null
    if (!deskLayers || !mobLayers || !names || !nameTracks || !texts || !glints) return null
    return {
      stage,
      content,
      wipe,
      glow,
      deskTravel,
      mobTravel,
      deskFloat,
      mobFloat,
      glints,
      deskLayers,
      mobLayers,
      names,
      nameTracks,
      texts,
      videos: videos.current,
    }
  }, [])

  const stageApi = useProjectsStage(getEls, {
    projects,
    desktop: policy.desktop,
    posterOnly: policy.posterOnly,
    onCurrent: setCurrent,
    onEngaged: setEngaged,
  })

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

  const setAt = (key: ListKey, i: number) => (el: HTMLElement | null) => {
    lists.current[key][i] = el
  }
  const plays = (p: Project, kind: 'desktop' | 'mobile') => heroOf(p.id, policy.desktop) === kind
  const setVideo = (p: Project, i: number, kind: 'desktop' | 'mobile') => (el: HTMLVideoElement | null) => {
    if (plays(p, kind)) videos.current[i] = el
  }

  const frameAccent: AccentStyle = { '--accent': projects[current].accent }
  const first = projects[0].background
  const last = projects[projects.length - 1].background

  const frame = (kind: 'desktop' | 'mobile') => {
    const desk = kind === 'desktop'
    const radius = desk ? 'rounded-[6px]' : 'rounded-[14px] md:rounded-[16px]'
    return (
      <div ref={desk ? deskTravelRef : mobTravelRef} className="absolute top-0 left-0 will-change-transform" style={frameAccent}>
        <div ref={desk ? deskFloatRef : mobFloatRef} className="size-full will-change-transform">
          <div ref={desk ? deskTiltRef : mobTiltRef} className="size-full will-change-transform">
            <div ref={desk ? deskSkewRef : mobSkewRef} className="relative size-full will-change-transform">
              <div className={`${frameBox} ${radius}`}>
                {projects.map((p, i) => (
                  <Layer
                    key={p.id}
                    project={p}
                    kind={kind}
                    playable={plays(p, kind)}
                    layerRef={setAt(desk ? 'deskLayers' : 'mobLayers', i)}
                    videoRef={setVideo(p, i, kind)}
                  />
                ))}
              </div>
              <div aria-hidden className={`pointer-events-none absolute overflow-hidden ${radius}`} style={ringMask}>
                <div
                  ref={setAt('glints', desk ? 0 : 1)}
                  className="absolute inset-y-0 left-0 w-1/3 will-change-transform"
                  style={{ backgroundImage: 'var(--glint)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section id="projetos" data-section className="relative isolate overflow-x-clip">
      <SectionChrome id="projetos" side="left" />
      <ProjectRail current={current} total={projects.length} visible={engaged} />

      {/* Faixa de cor entrando no primeiro projeto */}
      <div aria-hidden className="h-[30svh]" style={{ backgroundImage: `linear-gradient(to bottom, var(--c-bg), ${first})` }} />

      <div ref={stageRef} data-projects-stage className="relative h-svh overflow-hidden" style={{ backgroundColor: first }}>
        {/* Varredura diagonal: a cor do próximo projeto cobre a tela. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-[300vmax] -translate-x-1/2 -translate-y-1/2 rotate-[35deg]"
        >
          <div ref={wipeRef} className="size-full will-change-transform" />
        </div>

        {/* Invisível até o palco ser montado (quando chega a uma tela de distância). */}
        <div ref={contentRef} className="absolute inset-0" style={{ visibility: 'hidden' }}>
          <GridBackdrop />
          {/* Luz na cor de acento atrás do frame */}
          <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 will-change-transform"
          >
            <div
              className="size-[90vmax] -translate-x-1/2 -translate-y-1/2 md:size-[70vmax]"
              style={{ backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--glow) 24%, transparent), transparent 62%)' }}
            />
          </div>

          {/* Nome em contorno, gigante, atrás do frame: desliza sozinho e acelera com o scroll */}
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={setAt('names', i)}
              aria-hidden
              className={`pointer-events-none absolute left-0 w-full -translate-y-1/2 opacity-0 ${TEXT_LAYOUT[p.id].name}`}
            >
              <div
                ref={setAt('nameTracks', i)}
                className="flex w-max font-display text-[22svh] leading-none whitespace-nowrap uppercase will-change-transform md:text-[30svh]"
                style={{ color: 'transparent', WebkitTextStroke: `1px ${p.accent}` }}
              >
                {[0, 1, 2, 3].map((k) => (
                  <span key={k} className="pr-[0.3em]">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {frame('desktop')}
          {frame('mobile')}

          {projects.map((p, i) => {
            const layout = TEXT_LAYOUT[p.id]
            const style: AccentStyle = { '--accent': p.accent }
            const device = policy.desktop ? 'desktop' : 'mobile'
            return (
              <div key={p.id} style={style}>
                <Plaque
                  project={p}
                  onSheet={openers[p.id]}
                  overlay={layout.overlay[device]}
                  shadow={layout.shadow[device]}
                  center={layout.center}
                  onMotion={p.media === 'video' && policy.posterOnly ? () => stageApi.current.playManually(i) : undefined}
                  blockRef={setAt('texts', i)}
                  className={`absolute z-10 ${layout.className}`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Faixa de cor saindo do último projeto */}
      <div aria-hidden className="h-[30svh]" style={{ backgroundImage: `linear-gradient(to bottom, ${last}, var(--c-bg))` }} />

      <TechSheet project={sheetId ? projectById(sheetId) : null} open={sheet.open} onClose={sheet.hide} />
    </section>
  )
}

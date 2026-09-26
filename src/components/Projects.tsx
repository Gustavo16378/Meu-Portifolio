import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { projects, projectById, type Project, type ProjectId } from '../data/projects'
import { useProjectsStage, type StageEls } from '../motion/useProjectsStage'
import { useTilt } from '../motion/useTilt'
import { useScrollSkew } from '../motion/useScrollSkew'
import { heroOf, TEXT_PLACEMENT } from './projectLayout'
import { useOverlayState } from './useDialog'
import { useVideoPolicy } from './useVideoPolicy'
import { ProjectRail } from './ProjectRail'
import { Plaque } from './Plaque'
import { TechSheet } from './TechSheet'

type AccentStyle = CSSProperties & Record<'--accent', string>

const frameBox =
  'relative size-full overflow-hidden bg-surface [box-shadow:0_0_0_var(--ring,1px)_var(--frame-edge),var(--shadow-frame)]'

interface LayerProps {
  project: Project
  kind: 'desktop' | 'mobile'
  playable: boolean
  layerRef: (el: HTMLDivElement | null) => void
  videoRef: (el: HTMLVideoElement | null) => void
}

/** Uma camada do frame: o vídeo, se este frame é o que toca neste projeto, ou só o poster. */
function Layer({ project, kind, playable, layerRef, videoRef }: LayerProps) {
  const v = project.videos[kind]
  const label = `${project.name} rodando no ${kind === 'desktop' ? 'desktop' : 'celular'}`
  return (
    <div ref={layerRef} className="absolute inset-0 opacity-0">
      {playable ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={v.poster}
          width={v.width}
          height={v.height}
          aria-label={label}
          className="block size-full object-cover object-top"
        />
      ) : (
        <img
          src={v.poster}
          alt={label}
          width={v.width}
          height={v.height}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-top"
        />
      )}
    </div>
  )
}

type ListKey = 'deskLayers' | 'mobLayers' | 'names' | 'wipers' | 'texts' | 'markers'

/**
 * Seção 03. Um palco só, preso durante a seção inteira: cada projeto tem sua composição, e os frames
 * viajam entre elas com mola enquanto o vídeo troca. Atrás, o nome em contorno desliza com o scroll;
 * a cor de fundo troca numa varredura diagonal; o texto sai pra cima e o próximo entra de baixo.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const deskTravelRef = useRef<HTMLDivElement>(null)
  const mobTravelRef = useRef<HTMLDivElement>(null)
  const deskTiltRef = useRef<HTMLDivElement>(null)
  const mobTiltRef = useRef<HTMLDivElement>(null)
  const deskSkewRef = useRef<HTMLDivElement>(null)
  const mobSkewRef = useRef<HTMLDivElement>(null)
  const deskBoxRef = useRef<HTMLDivElement>(null)
  const mobBoxRef = useRef<HTMLDivElement>(null)
  const lists = useRef<Record<ListKey, (HTMLElement | null)[]>>({
    deskLayers: [],
    mobLayers: [],
    names: [],
    wipers: [],
    texts: [],
    markers: [],
  })
  const videos = useRef<(HTMLVideoElement | null)[]>([])

  const policy = useVideoPolicy()
  const [current, setCurrent] = useState(0)
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
    const all = (a: (HTMLElement | null)[]) => (a.length === projects.length && a.every(Boolean) ? (a as HTMLElement[]) : null)
    const section = sectionRef.current
    const stage = stageRef.current
    const deskTravel = deskTravelRef.current
    const mobTravel = mobTravelRef.current
    const deskBox = deskBoxRef.current
    const mobBox = mobBoxRef.current
    const deskLayers = all(l.deskLayers)
    const mobLayers = all(l.mobLayers)
    const names = all(l.names)
    const texts = all(l.texts)
    const markers = all(l.markers)
    const wipers = l.wipers.every(Boolean) ? (l.wipers as HTMLElement[]) : null
    if (!section || !stage || !deskTravel || !mobTravel || !deskBox || !mobBox) return null
    if (!deskLayers || !mobLayers || !names || !wipers || !texts || !markers) return null
    return { section, stage, deskTravel, mobTravel, deskBox, mobBox, deskLayers, mobLayers, names, wipers, texts, markers, videos: videos.current }
  }, [])

  const onCurrent = useCallback((i: number) => setCurrent(i), [])
  const stageApi = useProjectsStage(getEls, { projects, desktop: policy.desktop, posterOnly: policy.posterOnly, onCurrent })

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
  // O vídeo desktop só existe no desktop; no mobile o frame desktop mostra o poster.
  const plays = (p: Project, kind: 'desktop' | 'mobile') => heroOf(p.id, policy.desktop) === kind
  const setVideo = (p: Project, i: number, kind: 'desktop' | 'mobile') => (el: HTMLVideoElement | null) => {
    if (plays(p, kind)) videos.current[i] = el
  }

  const frameAccent: AccentStyle = { '--accent': projects[current].accent }

  return (
    <section
      id="projetos"
      data-section
      ref={sectionRef}
      className="relative h-[590svh] [--shift:25svh] [--step:100svh] md:h-[1030svh] md:[--shift:15svh] md:[--step:190svh]"
    >
      <ProjectRail sectionRef={sectionRef} total={projects.length} />

      {/* Um marcador por projeto no fluxo: diz ao trilho qual é o atual e ao vídeo quando está perto. */}
      {projects.map((p, i) => (
        <div
          key={p.id}
          ref={setAt('markers', i)}
          data-project-index={i}
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{ top: `calc(var(--step) * ${i} + var(--shift))`, height: 'var(--step)' }}
        />
      ))}

      <div
        ref={stageRef}
        data-sticky
        className="sticky top-0 h-svh overflow-hidden"
        style={{ backgroundColor: projects[0].background }}
      >
        {/* Varreduras diagonais: a cor de cada projeto entra por cima da anterior; a última volta pro preto. */}
        {[...projects.slice(1).map((p) => p.background), 'var(--c-bg)'].map((color, k) => (
          <div
            key={`${color}-${k}`}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[300vmax] -translate-x-1/2 -translate-y-1/2 rotate-[35deg]"
          >
            <div
              ref={setAt('wipers', k)}
              className="size-full will-change-transform"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}

        {/* Nome em contorno, gigante, atrás do frame */}
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={setAt('names', i)}
            aria-hidden
            className="pointer-events-none absolute top-[62%] left-0 flex -translate-y-1/2 font-display text-[22svh] leading-none whitespace-nowrap uppercase opacity-0 will-change-transform md:top-[74%] md:text-[36svh]"
            style={{ color: 'transparent', WebkitTextStroke: `1px ${p.accent}` }}
          >
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className="pr-[0.3em]">
                {p.name}
              </span>
            ))}
          </div>
        ))}

        {/* Frame desktop: viaja (transform) > inclina > skew > caixa com borda e as camadas */}
        <div ref={deskTravelRef} className="absolute top-0 left-0 opacity-0 will-change-transform" style={frameAccent}>
          <div ref={deskTiltRef} className="size-full will-change-transform">
            <div ref={deskSkewRef} className="size-full will-change-transform">
              <div ref={deskBoxRef} className={`${frameBox} rounded-[6px]`}>
                {projects.map((p, i) => (
                  <Layer
                    key={p.id}
                    project={p}
                    kind="desktop"
                    playable={plays(p, 'desktop')}
                    layerRef={setAt('deskLayers', i)}
                    videoRef={setVideo(p, i, 'desktop')}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div ref={mobTravelRef} className="absolute top-0 left-0 opacity-0 will-change-transform" style={frameAccent}>
          <div ref={mobTiltRef} className="size-full will-change-transform">
            <div ref={mobSkewRef} className="size-full will-change-transform">
              <div ref={mobBoxRef} className={`${frameBox} rounded-[14px] md:rounded-[16px]`}>
                {projects.map((p, i) => (
                  <Layer
                    key={p.id}
                    project={p}
                    kind="mobile"
                    playable={plays(p, 'mobile')}
                    layerRef={setAt('mobLayers', i)}
                    videoRef={setVideo(p, i, 'mobile')}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Textos: um por projeto, cada um na posição da sua composição */}
        {projects.map((p, i) => {
          const style: AccentStyle = { '--accent': p.accent }
          return (
            <div key={p.id} style={style}>
              <Plaque
                project={p}
                onSheet={openers[p.id]}
                variant={p.id === 'monte-vinhedo' && policy.desktop ? 'overlay' : 'full'}
                center={p.id === 'torra'}
                onMotion={policy.posterOnly ? () => stageApi.current.playManually(i) : undefined}
                blockRef={setAt('texts', i)}
                className={`absolute inset-x-0 bottom-[6svh] z-10 px-4 pl-12 ${TEXT_PLACEMENT[p.id]}`}
              />
            </div>
          )
        })}
      </div>

      <TechSheet project={sheetId ? projectById(sheetId) : null} open={sheet.open} onClose={sheet.hide} />
    </section>
  )
}

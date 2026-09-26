import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { gsap } from '../motion/gsap'
import { useScenePin } from '../motion/useScenePin'
import type { Project, ScenePhoto } from '../data/projects'
import { Plaque } from './Plaque'
import { PrintFrame } from './PrintFrame'
import { SceneObject } from './SceneObject'

type SceneStyle = CSSProperties & Record<'--accent', string>

export interface ProjectSceneProps {
  project: Project
  index: number
  onSheet: () => void
}

interface SceneShellProps extends ProjectSceneProps {
  sceneRef: RefObject<HTMLElement>
  stageRef: RefObject<HTMLDivElement>
  /** Altura total do artigo: 100svh do palco + o trecho preso (mobile primeiro). */
  heightClass: string
  /** Onde a luz ambiente do projeto se concentra (posição do radial-gradient). */
  lightAt?: string
  /** Cena sem quique (Cleane). */
  calm?: boolean
  phone?: 'left' | 'right'
  /** Presas ao print (lâmpadas). */
  printDecor?: ReactNode
  /** Timeline da montagem, depois do que a casca já faz (print entrando, luz subindo). */
  build?: (tl: gsap.core.Timeline) => void
  reduced?: () => void
  /** Objetos da cena além das fotos dos dados. */
  children?: ReactNode
}

/** Objeto de cena vindo de uma foto recortada (public/objetos/<projeto>/). */
export function PhotoObject({ photo }: { photo: ScenePhoto }) {
  return (
    <SceneObject
      className={`absolute ${photo.behind ? 'z-0' : 'z-20'} ${photo.className}`}
      depth={photo.depth ?? (photo.behind ? 0.2 : 0.6)}
      enterAt={photo.enterAt ?? 0.4}
      fallRotation={photo.fallRotation ?? 0}
      exit={photo.exit ?? { x: 0, rotation: 0 }}
    >
      <picture>
        <source srcSet={photo.webp} type="image/webp" />
        <img
          src={photo.png}
          alt=""
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none"
          style={{ filter: photo.behind ? 'blur(1.5px) var(--shadow-object)' : 'var(--shadow-object)' }}
        />
      </picture>
    </SceneObject>
  )
}

/**
 * Casca comum dos cinco projetos. O palco fica preso enquanto a cena se monta
 * (print entra, luz sobe, objetos caem) e só solta com a cena pronta. A placa fica parada ao lado.
 * Objetos atrás do print ficam embaixo dele e desfocados; os da frente, nítidos por cima.
 */
export function ProjectScene({
  project,
  index,
  onSheet,
  sceneRef,
  stageRef,
  heightClass,
  lightAt = '64% 46%',
  calm = false,
  phone = 'left',
  printDecor,
  build,
  reduced,
  children,
}: SceneShellProps) {
  const dimRef = useRef<HTMLDivElement>(null)

  useScenePin(sceneRef, stageRef, {
    calm,
    build: (tl) => {
      // O print acende conforme entra; a cena pode somar mais coisas por cima.
      tl.fromTo(dimRef.current, { opacity: 0.8 }, { opacity: 0, duration: 0.4, ease: 'none' }, 0.12)
      build?.(tl)
    },
    reduced: () => {
      gsap.set(dimRef.current, { opacity: 0 })
      reduced?.()
    },
  })

  const style: SceneStyle = { '--accent': project.accent, backgroundColor: project.background }
  const ambient = `radial-gradient(ellipse 60% 70% at ${lightAt}, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)`
  const behind = project.photos.filter((p) => p.behind)
  const front = project.photos.filter((p) => !p.behind)

  return (
    <article
      ref={sceneRef}
      data-project-index={index}
      aria-label={project.name}
      className={`relative ${heightClass}`}
      style={style}
    >
      <div ref={stageRef} data-sticky className="sticky top-0 h-svh overflow-hidden">
        <div data-ambient aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: ambient }} />

        {behind.map((p) => (
          <PhotoObject key={p.webp} photo={p} />
        ))}

        <SceneObject
          className="absolute top-[11svh] left-[12vw] z-10 w-[80vw] md:top-1/2 md:right-[10vw] md:left-auto md:w-[min(56vw,104svh)] md:-translate-y-1/2"
          depth={0.15}
          enterAt={0}
          fallRotation={calm ? 0 : -4}
          exit={{ x: 6, rotation: 8 }}
        >
          <PrintFrame project={project} phone={phone} dimRef={dimRef} calm={calm}>
            {printDecor}
          </PrintFrame>
        </SceneObject>

        {front.map((p) => (
          <PhotoObject key={p.webp} photo={p} />
        ))}
        {children}

        <Plaque
          project={project}
          onSheet={onSheet}
          calm={calm}
          className="absolute inset-x-0 bottom-[6svh] z-30 px-4 pl-12 md:top-1/2 md:right-auto md:bottom-auto md:w-[31vw] md:-translate-y-1/2 md:pr-0 md:pl-24"
        />
      </div>
    </article>
  )
}

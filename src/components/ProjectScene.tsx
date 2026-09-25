import type { CSSProperties, ReactNode, RefObject } from 'react'
import { useSceneTransition } from '../motion/useSceneTransition'
import type { Project } from '../data/projects'
import { Plaque } from './Plaque'

type SceneStyle = CSSProperties & Record<'--accent', string>

interface ProjectSceneProps {
  project: Project
  index: number
  onSheet: () => void
  sceneRef: RefObject<HTMLElement>
  stageRef: RefObject<HTMLDivElement>
  /** Onde a luz ambiente do projeto se concentra (posição do radial-gradient). */
  lightAt?: string
  /** Cena sem quique (Cleane). */
  calm?: boolean
  /** Altura do palco no mobile e variáveis de layout da cena. */
  stageClassName?: string
  children: ReactNode
}

/**
 * Casca comum dos cinco projetos: artigo alto com o palco preso no desktop,
 * luz ambiente na cor do projeto, transição física de entrada e saída, e a placa passando ao lado.
 */
export function ProjectScene({
  project,
  index,
  onSheet,
  sceneRef,
  stageRef,
  lightAt = '68% 48%',
  calm = false,
  stageClassName = 'h-[60svh]',
  children,
}: ProjectSceneProps) {
  useSceneTransition(sceneRef, stageRef, { calm })

  const style: SceneStyle = { '--accent': project.accent, backgroundColor: project.background }
  const ambient = `radial-gradient(ellipse 60% 70% at ${lightAt}, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)`

  return (
    <article
      ref={sceneRef}
      data-project-index={index}
      aria-label={project.name}
      className="relative overflow-x-clip md:h-[260svh]"
      style={style}
    >
      <div ref={stageRef} data-sticky className={`relative overflow-hidden md:sticky md:top-0 md:h-svh ${stageClassName}`}>
        <div data-ambient aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: ambient }} />
        {children}
      </div>

      <Plaque
        project={project}
        onSheet={onSheet}
        calm={calm}
        className="relative px-4 pt-6 pb-28 pl-12 md:absolute md:top-[64svh] md:left-0 md:w-[40vw] md:pt-0 md:pr-0 md:pb-0 md:pl-24"
      />
    </article>
  )
}

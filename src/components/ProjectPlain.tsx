import { useRef } from 'react'
import type { ProjectId } from '../data/projects'
import { ProjectScene, type ProjectSceneProps } from './ProjectScene'

// Onde a luz ambiente de cada projeto se concentra.
const LIGHT: Partial<Record<ProjectId, string>> = {
  autoria: '66% 34%',
  'monte-vinhedo': '62% 42%',
  torra: '44% 32%',
  cleane: '66% 44%',
}

/**
 * Projeto sem cena própria: fundo do ambiente, print grande e placa.
 * As fotos recortadas entram pelos dados (project.photos, arquivos em public/objetos/<projeto>/);
 * sem fotos, o trecho preso é mais curto, porque só o print entra.
 */
export function ProjectPlain({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const withPhotos = project.photos.length > 0

  return (
    <ProjectScene
      project={project}
      index={index}
      onSheet={onSheet}
      sceneRef={sceneRef}
      stageRef={stageRef}
      heightClass={withPhotos ? 'h-[190svh] md:h-[250svh]' : 'h-[160svh] md:h-[200svh]'}
      lightAt={LIGHT[project.id]}
      calm={project.id === 'cleane'}
      phone={index % 2 ? 'right' : 'left'}
    />
  )
}

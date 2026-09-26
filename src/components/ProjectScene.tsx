import { useRef, type CSSProperties } from 'react'
import { useScenePin } from '../motion/useScenePin'
import { useTilt } from '../motion/useTilt'
import { useScrollSkew } from '../motion/useScrollSkew'
import type { Project } from '../data/projects'
import { Plaque } from './Plaque'
import { SiteVideo } from './SiteVideo'

type SceneStyle = CSSProperties & Record<'--accent', string>

interface ProjectSceneProps {
  project: Project
  index: number
  onSheet: () => void
}

const frameStyle: CSSProperties = { border: '1px solid var(--frame-edge)', boxShadow: 'var(--shadow-frame)' }

/**
 * Um projeto é o site vivo: frame grande com o vídeo do site rodando, o mobile menor no canto,
 * e a placa ao lado. O palco fica preso um trecho pra dar tempo de olhar.
 * Física só no frame: entra com mola, inclina um pouco seguindo o mouse, skew leve pela velocidade do scroll.
 */
export function ProjectScene({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const skewRef = useRef<HTMLDivElement>(null)
  const calm = project.id === 'cleane'

  useScenePin(sceneRef, stageRef, { calm })
  useTilt(tiltRef, { maxX: 2, maxY: 3, perspective: 1600, stiffness: 60, damping: calm ? 16 : 9 })
  useScrollSkew(skewRef, calm ? { factor: 0.06, max: 2, stiffness: 60, damping: 16 } : { factor: 0.08, max: 2.5, stiffness: 120, damping: 11 })

  const style: SceneStyle = { '--accent': project.accent, backgroundColor: project.background }
  const { desktop, mobile } = project.videos

  return (
    <article
      ref={sceneRef}
      data-project-index={index}
      aria-label={project.name}
      className="relative h-[135svh] md:h-[220svh]"
      style={style}
    >
      <div
        ref={stageRef}
        data-sticky
        className="sticky top-0 flex h-svh flex-col justify-center gap-6 overflow-hidden px-4 pl-12 md:block md:p-0"
      >
        <div
          data-enter
          data-enter-at="0"
          className="relative w-full will-change-transform md:absolute md:top-1/2 md:right-[4vw] md:w-[min(65vw,128svh)] md:-translate-y-1/2"
        >
          <div ref={tiltRef} className="will-change-transform">
            <div ref={skewRef} className="will-change-transform">
              <div className="aspect-[16/10] overflow-hidden rounded-[6px] bg-surface" style={frameStyle}>
                <SiteVideo video={desktop} label={`${project.name} rodando no desktop`} />
              </div>

              <div
                data-enter
                data-enter-at="0.18"
                className="relative mx-auto mt-4 w-[26vw] will-change-transform md:absolute md:right-[-3%] md:bottom-[-10%] md:mx-0 md:mt-0 md:w-[17%]"
              >
                <div className="aspect-[390/844] overflow-hidden rounded-[14px] bg-surface md:rounded-[16px]" style={frameStyle}>
                  <SiteVideo video={mobile} label={`${project.name} rodando no celular`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Plaque
          project={project}
          onSheet={onSheet}
          className="relative md:absolute md:top-1/2 md:left-0 md:w-[27vw] md:-translate-y-1/2 md:pl-24"
        />
      </div>
    </article>
  )
}

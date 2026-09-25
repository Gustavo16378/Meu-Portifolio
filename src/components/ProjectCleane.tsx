import { useRef } from 'react'
import { gsap } from '../motion/gsap'
import { useSceneScrub } from '../motion/useSceneScrub'
import { useLoop } from '../motion/useLoop'
import { useWind } from '../motion/useWind'
import { SceneObject } from './SceneObject'
import { ProjectScene } from './ProjectScene'
import { PrintFrame } from './PrintFrame'
import type { ProjectSceneProps } from './ProjectStewer'

// Folhas da planta: ponto da base no caule e pra onde apontam (graus).
const LEAVES = [
  { x: 100, y: 200, angle: -20 },
  { x: 99, y: 176, angle: -160 },
  { x: 98, y: 148, angle: -35 },
  { x: 98, y: 122, angle: -150 },
  { x: 99, y: 96, angle: -50 },
  { x: 100, y: 74, angle: -135 },
  { x: 101, y: 60, angle: -85 },
]

export function ProjectCleane({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const breathRef = useRef<HTMLDivElement>(null)
  const plantRef = useRef<SVGSVGElement>(null)
  const leavesRef = useRef<(SVGGElement | null)[]>([])

  useWind(plantRef, leavesRef, 5)

  // Respiração: expande em 4 s, solta em 6 s, sem pausa brusca.
  useLoop(breathRef, (tl) => {
    tl.fromTo(breathRef.current, { scale: 0.93 }, { scale: 1.07, duration: 4, ease: 'sine.inOut' }).to(breathRef.current, {
      scale: 0.93,
      duration: 6,
      ease: 'sine.inOut',
    })
  })

  useSceneScrub(
    sceneRef,
    stageRef,
    (tl) => {
      tl.fromTo(dimRef.current, { opacity: 0.8 }, { opacity: 0, duration: 1, ease: 'sine.inOut' }, 0)
    },
    () => gsap.set(dimRef.current, { opacity: 0 }),
  )

  return (
    <ProjectScene
      project={project}
      index={index}
      onSheet={onSheet}
      sceneRef={sceneRef}
      stageRef={stageRef}
      lightAt="70% 42%"
      calm
      stageClassName="h-[64svh]"
    >
      {/* Círculo que respira */}
      <SceneObject
        className="absolute top-[2svh] left-[8vw] size-[84vw] md:top-[5svh] md:right-[11vw] md:left-auto md:size-[min(78svh,52vw)]"
        depth={0.1}
        exit={{ x: 0, rotation: 0 }}
      >
        <div ref={breathRef} className="size-full will-change-transform">
          <svg viewBox="0 0 100 100" aria-hidden className="line-art size-full">
            <circle cx="50" cy="50" r="48" />
            <circle cx="50" cy="50" r="36" className="opacity-50" />
          </svg>
        </div>
      </SceneObject>

      <SceneObject
        className="absolute top-[13svh] right-[12vw] w-[76vw] md:top-[22svh] md:right-[14vw] md:w-[min(34vw,62svh)]"
        depth={0.3}
        exit={{ x: 6, rotation: 8 }}
      >
        <PrintFrame project={project} phone="left" dimRef={dimRef} calm />
      </SceneObject>

      {/* Poltrona */}
      <SceneObject
        className="absolute bottom-[4svh] left-[12vw] w-[36vw] md:right-[51vw] md:bottom-[10svh] md:left-auto md:w-[min(17vw,32svh)]"
        depth={0.5}
        exit={{ x: -8, rotation: -8 }}
      >
        <svg viewBox="0 0 260 240" aria-hidden className="line-art block h-auto w-full">
          <path d="M50 20 Q130 0 210 20 L205 130 H55 Z" />
          <path d="M40 130 H220 Q232 130 232 142 V165 H28 V142 Q28 130 40 130 Z" />
          <path d="M28 100 Q14 100 14 115 V170 H40 V130" />
          <path d="M232 100 Q246 100 246 115 V170 H220 V130" />
          <path d="M40 165 L34 225 M220 165 L226 225 M70 165 L68 200 M190 165 L192 200" />
        </svg>
      </SceneObject>

      {/* Planta com folhas no vento */}
      <SceneObject
        className="absolute right-[4vw] bottom-[3svh] h-[28svh] md:right-[4vw] md:bottom-[6svh] md:h-[50svh]"
        depth={0.7}
        exit={{ x: 8, rotation: 10 }}
      >
        <svg ref={plantRef} viewBox="0 0 200 320" aria-hidden className="line-art block h-full w-auto overflow-visible">
          <path d="M60 240 L70 315 H130 L140 240 Z" />
          <path d="M52 240 H148 V228 H52 Z" />
          <path d="M100 228 C100 180 95 140 101 58" />
          {LEAVES.map((l, i) => (
            <g key={`${l.x}-${l.y}`} transform={`translate(${l.x} ${l.y}) rotate(${l.angle})`}>
              <g
                ref={(el) => {
                  leavesRef.current[i] = el
                }}
              >
                <path d="M0 0 C18 -12 46 -14 64 -2 C46 9 18 9 0 0 Z" />
                <path d="M0 0 L60 -2" />
              </g>
            </g>
          ))}
        </svg>
      </SceneObject>
    </ProjectScene>
  )
}

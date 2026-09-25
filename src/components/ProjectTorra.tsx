import { useRef } from 'react'
import { gsap } from '../motion/gsap'
import { useSceneScrub } from '../motion/useSceneScrub'
import { useBeans } from '../motion/useBeans'
import { useLoop } from '../motion/useLoop'
import { SceneObject } from './SceneObject'
import { ProjectScene } from './ProjectScene'
import { PrintFrame } from './PrintFrame'
import type { ProjectSceneProps } from './ProjectStewer'

const BEANS = 8
// Grãos caem nas abas do pires, dos dois lados da xícara (frações da largura), e pousam na altura do pires.
const LANES: [number, number][] = [
  [0.06, 0.22],
  [0.76, 0.92],
]
const SAUCER = 0.81

const light =
  'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent) 6%, transparent) 45%, transparent 70%)'

export function ProjectTorra({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const cupRef = useRef<HTMLDivElement>(null)
  const steamRef = useRef<SVGSVGElement>(null)
  const beansRef = useRef<(HTMLSpanElement | null)[]>([])

  useBeans(cupRef, beansRef, { lanes: LANES, floor: SAUCER })

  // Vapor: três fios sobem, abrem e somem, um atrás do outro.
  useLoop(steamRef, (tl) => {
    const wisps = steamRef.current ? Array.from(steamRef.current.children) : []
    wisps.forEach((w, i) => {
      tl.fromTo(
        w,
        { y: 12, opacity: 0, scaleX: 0.8, transformOrigin: '50% 100%' },
        { keyframes: { y: [12, -12, -40], opacity: [0, 0.9, 0], scaleX: [0.8, 1.1, 1.3] }, duration: 2.6, ease: 'sine.inOut' },
        i * 0.85,
      )
    })
  })

  useSceneScrub(
    sceneRef,
    stageRef,
    (tl) => {
      tl.fromTo(dimRef.current, { opacity: 0.8 }, { opacity: 0, duration: 1, ease: 'none' }, 0)
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
      lightAt="40% 30%"
      stageClassName="h-[64svh]"
    >
      {/* Círculo grande de luz lateral */}
      <SceneObject
        className="absolute top-[-6svh] left-[-24vw] size-[90vw] md:top-[3svh] md:left-[33vw] md:size-[min(64svh,42vw)]"
        depth={0.12}
        exit={{ x: -6, rotation: 0 }}
      >
        <div className="relative size-full">
          <div aria-hidden className="absolute inset-0 rounded-full" style={{ backgroundImage: light }} />
          <svg viewBox="0 0 100 100" aria-hidden className="line-art absolute inset-0 size-full opacity-60">
            <circle cx="50" cy="50" r="49" />
          </svg>
        </div>
      </SceneObject>

      <SceneObject
        className="absolute top-[7svh] right-[7vw] w-[86vw] md:top-[11svh] md:right-[6vw] md:w-[min(40vw,72svh)]"
        depth={0.3}
        fallRotation={6}
        exit={{ x: 10, rotation: 12 }}
      >
        <PrintFrame project={project} phone="right" dimRef={dimRef} />
      </SceneObject>

      {/* Xícara no pires, vapor e grãos */}
      <SceneObject
        className="absolute bottom-[4svh] left-[16vw] w-[64vw] md:right-[33vw] md:bottom-[7svh] md:left-auto md:w-[min(26vw,46svh)]"
        depth={0.6}
        fallRotation={-7}
        exit={{ x: -12, rotation: -16 }}
      >
        <div ref={cupRef} className="relative aspect-[3/2]">
          <svg
            ref={steamRef}
            viewBox="0 0 90 70"
            aria-hidden
            className="line-art absolute bottom-[70%] left-[35%] w-[30%] overflow-visible"
          >
            <path d="M25 70 C15 52 35 40 25 20" />
            <path d="M45 70 C35 50 55 36 45 12" />
            <path d="M65 70 C55 52 75 40 65 20" />
          </svg>

          <svg viewBox="0 0 300 200" aria-hidden className="line-art absolute inset-0 size-full overflow-visible">
            <ellipse cx="150" cy="170" rx="140" ry="22" />
            <ellipse cx="150" cy="166" rx="88" ry="12" />
            <path d="M80 60 L92 150 Q150 172 208 150 L220 60" />
            <ellipse cx="150" cy="60" rx="70" ry="12" />
            <ellipse cx="150" cy="66" rx="58" ry="8" />
            <path d="M218 82 C262 80 264 132 210 130" />
          </svg>

          {Array.from({ length: BEANS }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                beansRef.current[i] = el
              }}
              aria-hidden
              className="absolute top-0 left-0 block w-[6%] opacity-0 will-change-transform"
            >
              <svg viewBox="0 0 20 14" className="line-art block w-full overflow-visible">
                <ellipse cx="10" cy="7" rx="9" ry="6" />
                <path d="M3 8 C7 4 13 10 17 6" />
              </svg>
            </span>
          ))}
        </div>
      </SceneObject>
    </ProjectScene>
  )
}

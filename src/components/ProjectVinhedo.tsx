import { useId, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { useSceneScrub } from '../motion/useSceneScrub'
import { useSlosh } from '../motion/useSlosh'
import { SceneObject } from './SceneObject'
import { ProjectScene } from './ProjectScene'
import { PrintFrame } from './PrintFrame'
import type { ProjectSceneProps } from './ProjectStewer'

// Taça num viewBox 200×400: bojo aberto em cima (y 30) até o fundo (y 190), haste e base.
const BOWL = 'M40 30 C38 110 60 180 100 190 C140 180 162 110 160 30'
const EMPTY = 192
const FULL = 96

// Linhas de contorno de montanha, uma atrás da outra.
const RIDGES = [
  'M0 150 L90 110 L170 135 L260 60 L360 120 L450 80 L560 140 L650 70 L760 125 L860 90 L1000 130',
  'M0 190 L120 150 L210 175 L320 115 L420 165 L520 120 L620 175 L720 130 L840 170 L1000 140',
  'M0 230 L100 205 L220 225 L330 180 L440 215 L560 185 L680 225 L800 195 L1000 220',
  'M0 270 L140 250 L260 265 L380 240 L500 262 L640 245 L780 268 L1000 255',
]

function Bottle() {
  return (
    <svg viewBox="0 0 60 240" aria-hidden className="line-art block h-full w-auto">
      <path d="M22 4 H38 V60 C38 80 54 90 54 120 V232 Q54 238 48 238 H12 Q6 238 6 232 V120 C6 90 22 80 22 60 Z" />
      <path d="M22 24 H38" />
      <path d="M10 150 H50 M10 196 H50" />
    </svg>
  )
}

const bottles = [
  { className: 'left-[13vw] h-[22svh] md:left-auto md:right-[50vw] md:h-[44svh]', depth: 0.2, fall: -6 },
  { className: 'left-[22vw] h-[17svh] md:left-auto md:right-[46.5vw] md:h-[34svh]', depth: 0.45, fall: 8 },
  { className: 'left-[30vw] h-[13svh] md:left-auto md:right-[53vw] md:h-[26svh]', depth: 0.75, fall: -10 },
]

export function ProjectVinhedo({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const levelRef = useRef<SVGGElement>(null)
  const surfaceRef = useRef<SVGGElement>(null)
  const clipId = `glass-${useId().replace(/:/g, '')}`

  useSlosh(surfaceRef)

  // A taça enche com o scroll enquanto o print aparece.
  useSceneScrub(
    sceneRef,
    stageRef,
    (tl) => {
      tl.fromTo(levelRef.current, { y: EMPTY }, { y: FULL, duration: 1, ease: 'power1.out' }, 0).fromTo(
        dimRef.current,
        { opacity: 0.8 },
        { opacity: 0, duration: 0.8, ease: 'none' },
        0,
      )
    },
    () => {
      gsap.set(levelRef.current, { y: FULL })
      gsap.set(dimRef.current, { opacity: 0 })
    },
  )

  return (
    <ProjectScene
      project={project}
      index={index}
      onSheet={onSheet}
      sceneRef={sceneRef}
      stageRef={stageRef}
      lightAt="66% 40%"
      stageClassName="h-[62svh]"
    >
      <SceneObject className="absolute inset-x-0 bottom-0 h-[30svh] md:h-[46svh]" depth={0.12} exit={{ x: 0, rotation: 0 }}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden className="line-art h-full w-full opacity-45">
          {RIDGES.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </SceneObject>

      <SceneObject
        className="absolute top-[7svh] right-[7vw] w-[86vw] md:top-[13svh] md:right-[7vw] md:w-[min(38vw,70svh)]"
        depth={0.3}
        fallRotation={-5}
        exit={{ x: 10, rotation: 14 }}
      >
        <PrintFrame project={project} phone="left" dimRef={dimRef} />
      </SceneObject>

      {bottles.map((b) => (
        <SceneObject
          key={b.className}
          className={`absolute bottom-[5svh] md:bottom-[10svh] ${b.className}`}
          depth={b.depth}
          fallRotation={b.fall}
          exit={{ x: -10, rotation: -18 }}
        >
          <Bottle />
        </SceneObject>
      ))}

      {/* Taça: o líquido é hachura, sem preenchimento, recortada pelo bojo */}
      <SceneObject
        className="absolute right-[9vw] bottom-[5svh] h-[24svh] md:right-[11vw] md:bottom-[8svh] md:h-[40svh]"
        depth={0.6}
        fallRotation={9}
        exit={{ x: 12, rotation: 20 }}
      >
        <svg viewBox="0 0 200 400" aria-hidden className="line-art block h-full w-auto overflow-visible">
          <defs>
            <clipPath id={clipId}>
              <path d={`${BOWL} Z`} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <g ref={levelRef} transform={`translate(0 ${EMPTY})`}>
              <g ref={surfaceRef}>
                <path d="M-40 0 H240" />
                <path
                  d={Array.from({ length: 22 }, (_, i) => `M-40 ${(i + 1) * 9} H240`).join(' ')}
                  className="opacity-50"
                />
              </g>
            </g>
          </g>
          <ellipse cx="100" cy="30" rx="60" ry="8" />
          <path d={BOWL} />
          <path d="M100 190 V352" />
          <ellipse cx="100" cy="358" rx="56" ry="9" />
        </svg>
      </SceneObject>
    </ProjectScene>
  )
}

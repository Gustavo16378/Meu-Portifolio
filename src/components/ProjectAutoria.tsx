import { useRef } from 'react'
import { gsap } from '../motion/gsap'
import { useSceneScrub } from '../motion/useSceneScrub'
import { useSpotlight } from '../motion/useSpotlight'
import { useSuspension } from '../motion/useSuspension'
import { SceneObject } from './SceneObject'
import { ProjectScene } from './ProjectScene'
import { PrintFrame } from './PrintFrame'
import type { ProjectSceneProps } from './ProjectStewer'

// Carro de frente, num viewBox 600×300. Carroceria e rodas separadas: só a carroceria anda na suspensão.
function CarBody() {
  return (
    <>
      <path d="M190 60 L410 60 L450 130 L150 130 Z" />
      <path d="M200 70 L400 70 L436 124 L164 124 Z" />
      <path d="M150 130 L90 150 L70 190 L70 240 L530 240 L530 190 L510 150 L450 130" />
      <path d="M110 150 H490" />
      <path d="M85 170 L175 165 L180 190 L90 195 Z" />
      <path d="M515 170 L425 165 L420 190 L510 195 Z" />
      <path d="M220 175 H380 L370 215 H230 Z" />
      <path d="M240 185 H360 M236 195 H364 M233 205 H367" />
      <path d="M80 225 H520" />
      <path d="M150 118 L120 116 L118 130 L150 132" />
      <path d="M450 118 L480 116 L482 130 L450 132" />
      <rect x="265" y="222" width="70" height="14" rx="2" />
    </>
  )
}

function CarWheels() {
  return (
    <>
      <path d="M95 240 V285 Q95 292 105 292 H150 Q160 292 160 285 V240" />
      <path d="M440 240 V285 Q440 292 450 292 H495 Q505 292 505 285 V240" />
    </>
  )
}

const cone =
  'linear-gradient(to right, color-mix(in srgb, var(--accent) 55%, transparent), color-mix(in srgb, var(--accent) 14%, transparent) 55%, transparent 92%)'
const lamp = 'radial-gradient(circle, color-mix(in srgb, var(--c-bone) 90%, var(--accent)), color-mix(in srgb, var(--accent) 50%, transparent) 35%, transparent 70%)'
const fade = 'linear-gradient(to top, black, transparent 65%)'

export function ProjectAutoria({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const coneRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<HTMLSpanElement>(null)
  const lampRef = useRef<HTMLSpanElement>(null)

  useSuspension(bodyRef, mirrorRef)
  useSpotlight(coneRef, originRef, { rest: -38 })

  // O farol acende (tremendo, como lâmpada fria) e a parede com o print clareia junto.
  useSceneScrub(
    sceneRef,
    stageRef,
    (tl) => {
      tl.fromTo([coneRef.current, lampRef.current], { opacity: 0 }, { keyframes: { opacity: [0, 0.9, 0.15, 0.7, 1] }, duration: 0.6 }, 0)
        .fromTo(dimRef.current, { opacity: 0.8 }, { opacity: 0, duration: 1.4, ease: 'none' }, 0.2)
    },
    () => {
      gsap.set([coneRef.current, lampRef.current], { opacity: 1 })
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
      lightAt="72% 34%"
      stageClassName="h-[66svh]"
    >
      {/* Parede com o print */}
      <SceneObject
        className="absolute top-[7svh] right-[7vw] w-[86vw] md:top-[9svh] md:right-[5vw] md:w-[min(40vw,72svh)]"
        depth={0.3}
        fallRotation={5}
        exit={{ x: 8, rotation: 12 }}
      >
        <PrintFrame project={project} phone="left" dimRef={dimRef} />
      </SceneObject>

      {/* Carro com farol, piso e reflexo */}
      <SceneObject
        className="absolute right-[18vw] bottom-[9svh] w-[60vw] md:right-[22vw] md:bottom-[12svh] md:w-[min(34vw,62svh)]"
        depth={0.6}
        fallRotation={-4}
        exit={{ x: -12, rotation: -10 }}
      >
        <div className="relative aspect-[2/1]">
          <span
            aria-hidden
            className="absolute top-[97.5%] -right-[40%] -left-[40%] block h-[1.25px]"
            style={{ backgroundColor: 'var(--accent)' }}
          />

          <div className="absolute inset-x-0 top-[97.5%] aspect-[2/1] -scale-y-100 opacity-20" style={{ maskImage: fade, WebkitMaskImage: fade }}>
            <div ref={mirrorRef} className="absolute inset-0 will-change-transform">
              <svg viewBox="0 0 600 300" aria-hidden className="line-art absolute inset-0 h-full w-full">
                <CarBody />
              </svg>
            </div>
            <svg viewBox="0 0 600 300" aria-hidden className="line-art absolute inset-0 h-full w-full">
              <CarWheels />
            </svg>
          </div>

          <svg viewBox="0 0 600 300" aria-hidden className="line-art absolute inset-0 h-full w-full">
            <CarWheels />
          </svg>

          <div ref={bodyRef} className="absolute inset-0 origin-bottom will-change-transform">
            <div
              ref={coneRef}
              aria-hidden
              className="pointer-events-none absolute top-[60%] left-[22%] h-[150%] w-[300%] -translate-y-1/2 opacity-0"
              style={{ backgroundImage: cone, clipPath: 'polygon(0 47%, 100% 0, 100% 100%, 0 53%)' }}
            />
            <span
              ref={lampRef}
              aria-hidden
              className="absolute top-[60%] left-[22%] block aspect-square w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{ backgroundImage: lamp }}
            />
            <span ref={originRef} aria-hidden className="absolute top-[60%] left-[22%] block size-0" />
            <svg viewBox="0 0 600 300" aria-hidden className="line-art absolute inset-0 h-full w-full overflow-visible">
              <CarBody />
            </svg>
          </div>
        </div>
      </SceneObject>
    </ProjectScene>
  )
}

import { useRef } from 'react'
import { gsap } from '../motion/gsap'
import { usePendulum } from '../motion/usePendulum'
import { useSlide } from '../motion/useSlide'
import { SceneObject } from './SceneObject'
import { ProjectScene, type ProjectSceneProps } from './ProjectScene'

// Lâmpadas de camarim em volta do print, em frações da largura/altura dele.
// Ordem de acender: sobe pela esquerda, atravessa o topo, desce pela direita.
const SIDE = [0.84, 0.64, 0.44, 0.24, 0.06]
const TOP = Array.from({ length: 9 }, (_, i) => 0.06 + (i * 0.88) / 8)
const LAMPS: { x: number; y: number }[] = [
  ...SIDE.map((y) => ({ x: -0.035, y })),
  ...TOP.map((x) => ({ x, y: -0.055 })),
  ...[...SIDE].reverse().map((y) => ({ x: 1.035, y })),
]

const warm = 'color-mix(in srgb, var(--c-bone) 78%, var(--accent))'
const lampGlow = `radial-gradient(circle, ${warm} 0%, color-mix(in srgb, var(--accent) 55%, transparent) 28%, transparent 70%)`
const edgeGlow = `inset 0 0 60px 6px color-mix(in srgb, ${warm} 22%, transparent)`

// Fotos recortadas: navalha pendurada pela ponta do cabo, pente deitado.
const RAZOR = { webp: '/objetos/stewer/navalha.webp', png: '/objetos/stewer/navalha.png', width: 720, height: 476 }
const COMB = { webp: '/objetos/stewer/pente.webp', png: '/objetos/stewer/pente.png', width: 720, height: 420 }
// Rebite na ponta do cabo (em % da foto) e a rotação que deixa o peso da navalha embaixo dele.
const RAZOR_PIVOT = { x: 8.3, y: 90.7, hang: 121 }
// O pente vem inclinado na foto; esta rotação deixa ele deitado, dentes pra baixo.
const COMB_LEVEL = 28

export function ProjectStewer({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const lampsRef = useRef<HTMLDivElement>(null)
  const edgeRef = useRef<HTMLDivElement>(null)
  const razorRef = useRef<HTMLDivElement>(null)
  const razorImgRef = useRef<HTMLImageElement>(null)
  const combRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  usePendulum(razorRef, razorImgRef, { period: 2, damping: 0.3, reach: 60, push: 0.005, kick: 0.6 })
  useSlide(combRef, trackRef, { scrollPush: 30, friction: 2.4 })

  const litParts = () => (lampsRef.current ? Array.from(lampsRef.current.querySelectorAll('[data-lit]')) : [])

  return (
    <ProjectScene
      project={project}
      index={index}
      onSheet={onSheet}
      sceneRef={sceneRef}
      stageRef={stageRef}
      heightClass="h-[190svh] md:h-[250svh]"
      lightAt="62% 44%"
      phone="left"
      build={(tl) => {
        const lamps = lampsRef.current ? Array.from(lampsRef.current.children) : []
        // Lâmpadas acendem uma a uma, tremendo como filamento esquentando.
        lamps.forEach((l, i) => {
          tl.fromTo(
            l.querySelectorAll('[data-lit]'),
            { opacity: 0 },
            { keyframes: { opacity: [0, 0.85, 0.2, 1] }, duration: 0.07, ease: 'none' },
            0.14 + i * 0.024,
          )
        })
        tl.fromTo(edgeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'none' }, 0.14)
      }}
      reduced={() => gsap.set([...litParts(), edgeRef.current], { opacity: 1 })}
      printDecor={
        <>
          <div
            ref={edgeRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 aspect-[16/10] rounded-[4px] opacity-0"
            style={{ boxShadow: edgeGlow }}
          />
          <div ref={lampsRef} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-[16/10]">
            {LAMPS.map((l) => (
              <span
                key={`${l.x}-${l.y}`}
                className="absolute block aspect-square w-[2.1%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }}
              >
                <span
                  data-lit
                  className="absolute top-1/2 left-1/2 block aspect-square w-[520%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                  style={{ backgroundImage: lampGlow }}
                />
                <span
                  className="absolute inset-0 block rounded-full"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--c-bone) 22%, transparent)',
                    backgroundColor: 'var(--c-surface)',
                  }}
                />
                <span data-lit className="absolute inset-[14%] block rounded-full opacity-0" style={{ backgroundColor: warm }} />
              </span>
            ))}
          </div>
        </>
      }
    >
      {/* Navalha: pendurada por um fio na lateral, atrás do print, desfocada */}
      <SceneObject className="absolute top-0 right-[9vw] z-0 md:right-[7.5vw]" depth={0.25} enterAt={0.42} exit={{ x: 10, rotation: 20 }}>
        <div ref={razorRef} className="relative will-change-transform">
          <span
            aria-hidden
            className="block h-[9svh] w-px md:h-[16svh]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--c-bone) 35%, transparent)' }}
          />
          <picture>
            <source srcSet={RAZOR.webp} type="image/webp" />
            <img
              ref={razorImgRef}
              src={RAZOR.png}
              alt=""
              width={RAZOR.width}
              height={RAZOR.height}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute top-full left-0 block w-[22vw] max-w-none select-none md:w-[10vw]"
              style={{
                translate: `-${RAZOR_PIVOT.x}% -${RAZOR_PIVOT.y}%`,
                transformOrigin: `${RAZOR_PIVOT.x}% ${RAZOR_PIVOT.y}%`,
                rotate: `${RAZOR_PIVOT.hang}deg`,
                filter: 'blur(1.4px) var(--shadow-object)',
              }}
            />
          </picture>
        </div>
      </SceneObject>

      {/* Pente: apoiado embaixo do print, na frente, desliza com o scroll e freia no atrito */}
      <SceneObject
        className="absolute top-[calc(11svh+80vw*0.625+1svh)] right-[8vw] z-20 w-[56vw] md:top-[calc(50svh+min(56vw,104svh)*0.3125+0.4vw)] md:right-[11vw] md:w-[min(34vw,64svh)]"
        depth={0.5}
        enterAt={0.55}
        fallRotation={10}
        exit={{ x: -8, rotation: -16 }}
      >
        <div ref={trackRef} className="relative h-[9vw] md:h-[4.5vw]">
          <div ref={combRef} className="absolute bottom-0 left-0 w-[28vw] will-change-transform md:w-[13vw]">
            <picture>
              <source srcSet={COMB.webp} type="image/webp" />
              <img
                src={COMB.png}
                alt=""
                width={COMB.width}
                height={COMB.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block w-full select-none"
                style={{ rotate: `${COMB_LEVEL}deg`, filter: 'var(--shadow-object)' }}
              />
            </picture>
          </div>
        </div>
      </SceneObject>
    </ProjectScene>
  )
}

import { useRef } from 'react'
import { gsap } from '../motion/gsap'
import { usePendulum } from '../motion/usePendulum'
import { useSlide } from '../motion/useSlide'
import { useScrollSkew } from '../motion/useScrollSkew'
import { useSceneScrub } from '../motion/useSceneScrub'
import type { Project } from '../data/projects'
import { SceneObject } from './SceneObject'
import { ProjectScene } from './ProjectScene'
import { Phone } from './PrintFrame'

export interface ProjectSceneProps {
  project: Project
  index: number
  onSheet: () => void
}

// Espelho desenhado num viewBox 1450×1000; lâmpadas na moldura, vidro por dentro.
const MIRROR_W = 1450
const MIRROR_H = 1000
const GLASS = { x: 90, y: 90, w: 1270, h: 820 }

// Ordem de acender: sobe pela esquerda, atravessa o topo, desce pela direita.
const BULBS: { x: number; y: number }[] = [
  ...[830, 670, 510, 350, 190].map((y) => ({ x: 55, y })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 150 + (i * 1150) / 7, y: 55 })),
  ...[190, 350, 510, 670, 830].map((y) => ({ x: 1395, y })),
]

const pct = (v: number, total: number) => `${(v / total) * 100}%`

const glow =
  'radial-gradient(circle, color-mix(in srgb, var(--c-bone) 85%, var(--accent)) 0%, color-mix(in srgb, var(--accent) 55%, transparent) 22%, transparent 68%)'
const reflection =
  'linear-gradient(115deg, transparent 35%, color-mix(in srgb, var(--c-bone) 10%, transparent) 45%, transparent 56%)'

export function ProjectStewer({ project, index, onSheet }: ProjectSceneProps) {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const glowsRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const pictureRef = useRef<HTMLPictureElement>(null)
  const razorRef = useRef<HTMLDivElement>(null)
  const bladeRef = useRef<SVGGElement>(null)
  const combRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)

  usePendulum(razorRef, bladeRef, { period: 1.8, damping: 0.35 })
  useSlide(combRef, counterRef, { scrollPush: 30, friction: 2.4 })
  useScrollSkew(printRef, { factor: 0.16, max: 6, stiffness: 140, damping: 10 })

  // Lâmpadas acendem uma a uma com o scroll, e o print aparece no espelho conforme a luz chega.
  useSceneScrub(
    sceneRef,
    stageRef,
    (tl) => {
      const lamps = glowsRef.current ? Array.from(glowsRef.current.children) : []
      const span = lamps.length * 0.1
      // Cada lâmpada treme antes de firmar, como filamento esquentando.
      tl.fromTo(lamps, { opacity: 0 }, { keyframes: { opacity: [0, 0.8, 0.25, 1] }, duration: 0.3, stagger: 0.1 }, 0)
        .fromTo(dimRef.current, { opacity: 0.85 }, { opacity: 0, duration: span, ease: 'none' }, 0)
        .fromTo(pictureRef.current, { yPercent: 6, scale: 1.06 }, { yPercent: 0, scale: 1, duration: span, ease: 'none' }, 0)
    },
    () => {
      if (glowsRef.current) gsap.set(glowsRef.current.children, { opacity: 1 })
      gsap.set(dimRef.current, { opacity: 0 })
    },
  )

  const { desktop } = project.prints

  return (
    <ProjectScene
      project={project}
      index={index}
      onSheet={onSheet}
      sceneRef={sceneRef}
      stageRef={stageRef}
      stageClassName="h-[54svh] [--mr:5vw] [--mt:11svh] [--mw:82vw] [--rr:60vw] md:[--mr:7vw] md:[--mt:calc(46svh-var(--mw)/2.9)] md:[--mw:min(46vw,88svh)] md:[--rr:calc(var(--mr)+var(--mw)+1.5vw)]"
    >

        {/* Espelho com o print dentro */}
        <SceneObject
          className="absolute"
          style={{ right: 'var(--mr)', top: 'var(--mt)', width: 'var(--mw)' }}
          depth={0.35}
          fallRotation={-7}
          exit={{ x: -6, rotation: -12 }}
        >
          <div className="relative w-full" style={{ aspectRatio: `${MIRROR_W} / ${MIRROR_H}` }}>
            <div
              className="absolute overflow-hidden rounded-[0.4%] bg-surface"
              style={{
                left: pct(GLASS.x, MIRROR_W),
                top: pct(GLASS.y, MIRROR_H),
                width: pct(GLASS.w, MIRROR_W),
                height: pct(GLASS.h, MIRROR_H),
              }}
            >
              <div ref={printRef} className="h-full w-full will-change-transform">
                <picture ref={pictureRef} className="block h-full w-full will-change-transform">
                  <source srcSet={desktop.webp} type="image/webp" />
                  <img
                    src={desktop.png}
                    alt={`Print do site ${project.name} no desktop`}
                    width={desktop.width}
                    height={desktop.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-cover object-top"
                  />
                </picture>
              </div>
              <div ref={dimRef} aria-hidden className="absolute inset-0 bg-bg" style={{ opacity: 0.85 }} />
              <div aria-hidden className="absolute inset-0 mix-blend-screen" style={{ backgroundImage: reflection }} />
            </div>

            <svg
              viewBox={`0 0 ${MIRROR_W} ${MIRROR_H}`}
              aria-hidden
              className="line-art pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            >
              <rect x="20" y="20" width="1410" height="960" rx="28" />
              <rect x={GLASS.x} y={GLASS.y} width={GLASS.w} height={GLASS.h} rx="8" />
              {BULBS.map((b) => (
                <g key={`${b.x}-${b.y}`}>
                  <circle cx={b.x} cy={b.y} r="17" />
                  <circle cx={b.x} cy={b.y} r="6" />
                </g>
              ))}
            </svg>

            <div ref={glowsRef} aria-hidden className="pointer-events-none absolute inset-0">
              {BULBS.map((b) => (
                <span
                  key={`${b.x}-${b.y}`}
                  className="absolute block aspect-square w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                  style={{ left: pct(b.x, MIRROR_W), top: pct(b.y, MIRROR_H), backgroundImage: glow }}
                />
              ))}
            </div>
          </div>
        </SceneObject>

        {/* Balcão com o pente solto e o celular encostado no espelho */}
        <SceneObject
          className="absolute"
          style={{
            right: 'calc(var(--mr) - 4vw)',
            top: 'calc(var(--mt) + var(--mw) / 1.45)',
            width: 'calc(var(--mw) + 8vw)',
          }}
          depth={0.5}
          fallRotation={5}
          exit={{ x: 12, rotation: 10 }}
        >
          <div ref={counterRef} className="relative h-8 md:h-10">
            <svg viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden className="line-art absolute inset-0 h-full w-full">
              <path d="M40 1 H960 M0 16 H1000 M40 1 L0 16 M960 1 L1000 16 M0 39 H1000 M0 16 V39 M1000 16 V39" />
            </svg>

            <div ref={combRef} className="absolute bottom-[70%] left-[14%] w-[22vw] will-change-transform md:w-[9vw]">
              <svg viewBox="0 0 200 44" aria-hidden className="line-art block h-auto w-full">
                <path d="M6 4 H194 Q198 4 198 8 V14 H2 V8 Q2 4 6 4 Z" />
                <path
                  d={Array.from({ length: 31 }, (_, i) => {
                    const x = 8 + i * 6.1
                    return `M${x.toFixed(1)} 14 V${i < 12 ? 42 : 36}`
                  }).join(' ')}
                />
              </svg>
            </div>

            <Phone project={project} className="absolute right-[7%] bottom-[55%] w-[calc(var(--mw)*0.2)] origin-bottom -rotate-[5deg]" />
          </div>
        </SceneObject>

        {/* Navalha pendurada: pêndulo que sente a mão passando */}
        <SceneObject className="absolute top-0" style={{ right: 'var(--rr)' }} depth={0.9} exit={{ x: -16, rotation: -35 }}>
          <div ref={razorRef} className="h-[30svh] will-change-transform md:h-[56svh]">
            {/* Cordão preso no alto, cabo da navalha pendurado pela ponta, lâmina aberta pro lado. */}
            <svg viewBox="0 0 220 520" aria-hidden className="line-art block h-full w-auto overflow-visible">
              <path d="M44 1 H76" />
              <path d="M60 1 V286" />
              <circle cx="60" cy="294" r="8" />
              <path d="M50 304 C50 300 70 300 70 304 L74 440 C74 456 46 456 46 440 Z" />
              <circle cx="60" cy="316" r="3" />
              <circle cx="60" cy="436" r="3" />
              <g ref={bladeRef}>
                <path d="M62 428 L84 420 H196 C206 420 212 428 210 438 L204 462 C160 470 116 470 88 462 L66 448 Z" />
                <path d="M88 428 H198" />
                <path d="M96 456 C130 462 166 462 200 455" />
              </g>
            </svg>
          </div>
        </SceneObject>
    </ProjectScene>
  )
}

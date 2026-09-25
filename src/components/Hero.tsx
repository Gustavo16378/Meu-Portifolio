import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { usePhotoCards, type PhotoCardConfig, type PhotoCardEls } from '../motion/usePhotoCards'
import { GridBackdrop } from './GridBackdrop'
import { PhotoCard, type Photo } from './PhotoCard'

const photos: Photo[] = [
  {
    webp: '/foto/gustavo-sem-fundo.webp',
    png: '/foto/gustavo-sem-fundo.png',
    width: 760,
    height: 779,
    alt: 'Gustavo Barbosa Lima, de óculos e moletom preto',
    caption: '01 / 02',
  },
  {
    webp: '/foto/foto2.webp',
    png: '/foto/foto2.png',
    width: 760,
    height: 739,
    alt: 'Gustavo de capuz, com a mão no queixo',
    caption: '02 / 02',
  },
]

const cardConfigs: PhotoCardConfig[] = [
  { rotation: -7, scatter: { x: 18, y: -115, rotation: -42 } },
  { rotation: 5, scatter: { x: 62, y: -70, rotation: 51 } },
]

const cardPlacement = [
  'left-[3%] top-[2%] md:left-[4%] md:top-[6%]',
  'left-[44%] top-[20%] md:left-[40%] md:top-[28%]',
]

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const line1 = useRef<HTMLSpanElement>(null)
  const line2 = useRef<HTMLSpanElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(PhotoCardEls | null)[]>([])

  // Cada linha com uma mola diferente: a de baixo atrasa e balança mais, como se fosse mais pesada.
  useScrollSkew(line1, { stiffness: 140, damping: 10 })
  useScrollSkew(line2, { stiffness: 90, damping: 7, factor: 0.28 })

  // Uma função estável por cartão, pra o PhotoCard entregar as camadas dele.
  const registers = useRef(
    photos.map((_, i) => (els: PhotoCardEls | null) => {
      cardsRef.current[i] = els
    }),
  )

  usePhotoCards(heroRef, cardsRef, cardConfigs)

  // Entrada do título e do texto, e o indicador sumindo quando a página rola.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const lines = [line1.current, line2.current]
      const copy = copyRef.current ? Array.from(copyRef.current.children) : []
      if (reduced) {
        gsap.from([...lines, ...copy, indicatorRef.current], { opacity: 0, duration: 0.8, stagger: 0.1 })
        return
      }
      gsap.from(lines, {
        yPercent: 70,
        rotation: 4,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'back.out(1.6)',
        transformOrigin: '0% 100%',
      })
      gsap.from(copy, { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, delay: 0.35, ease: 'back.out(1.4)' })
      gsap.from(indicatorRef.current, { opacity: 0, duration: 0.8, delay: 1.2 })
      gsap.to(indicatorRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '15% top', scrub: true },
      })
    }, hero)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="abertura"
      data-section
      ref={heroRef}
      className="relative min-h-svh overflow-x-clip"
    >
      <GridBackdrop />

      <div className="relative grid min-h-svh grid-cols-1 content-center gap-10 px-4 pt-24 pb-28 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-6 md:px-12 md:py-24">
        <div className="relative">
          <h1 className="font-display text-[26vw] leading-[0.8] tracking-[-0.01em] uppercase md:text-[13.5vw]">
            <span ref={line1} className="block origin-left text-bone will-change-transform">
              Gustavo
            </span>
            <span ref={line2} className="block origin-left text-acid will-change-transform">
              Dev
            </span>
          </h1>
          <div ref={copyRef}>
            <p className="mt-6 max-w-[26rem] text-base leading-snug text-bone md:mt-8 md:text-lg">
              Sites, sistemas e APIs. Front e back, do design ao deploy.
            </p>
            <p className="mt-3 font-mono text-[11px] text-muted md:text-xs">
              react · typescript · java · spring · quarkus · postgresql
            </p>
          </div>
        </div>

        <div className="pointer-events-none relative z-10 h-[108vw] md:h-[72svh]">
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.webp}
              photo={photo}
              className={`w-[50vw] md:w-[clamp(220px,22vw,340px)] ${cardPlacement[i]}`}
              zIndex={i + 1}
              register={registers.current[i]}
            />
          ))}
        </div>
      </div>

      <div
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] text-muted md:bottom-6 md:text-[11px]"
      >
        <span>scroll</span>
        <span className="block h-10 w-px overflow-hidden">
          <span className="scroll-line block h-full w-full bg-acid" />
        </span>
      </div>
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { onIntroDone } from '../motion/intro'
import { useScrollSkew } from '../motion/useScrollSkew'
import { usePhotoCards, type PhotoCardConfig, type PhotoCardEls } from '../motion/usePhotoCards'
import { GridBackdrop } from './GridBackdrop'
import { PhotoCard, type Photo } from './PhotoCard'
import { Personagem } from './Personagem'
import { SectionChrome } from './SectionChrome'

const photos: Photo[] = [
  {
    webp: '/foto/gustavo-sem-fundo.webp',
    webpSmall: '/foto/gustavo-sem-fundo-420.webp',
    png: '/foto/gustavo-sem-fundo.png',
    width: 760,
    height: 779,
    alt: 'Gustavo Barbosa Lima, de óculos e moletom preto',
    caption: '01 / 02',
  },
  {
    webp: '/foto/foto2.webp',
    webpSmall: '/foto/foto2-420.webp',
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
  const titleRef = useRef<HTMLHeadingElement>(null)
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

  // Ele espia de trás do primeiro cartão depois que os cartões assentam, e some na primeira vez que alguém arrasta um.
  const [peek, setPeek] = useState(false)
  const grabbed = useRef(false)
  useEffect(() => onIntroDone(() => setPeek(true)), [])
  const onGrab = useCallback(() => {
    if (grabbed.current) return
    grabbed.current = true
    setPeek(false)
  }, [])

  usePhotoCards(heroRef, titleRef, cardsRef, cardConfigs, onGrab)

  // Entrada do título e do texto (depois do preloader), e o indicador sumindo quando a página rola.
  useEffect(() => {
    const hero = heroRef.current
    const indicator = indicatorRef.current
    if (!hero || !indicator) return
    const reduced = prefersReducedMotion()
    let intro: gsap.core.Timeline | undefined
    const ctx = gsap.context(() => {
      intro = gsap.timeline({ paused: true })
      const lines = [line1.current, line2.current]
      const copy = copyRef.current ? Array.from(copyRef.current.children) : []
      const marks = Array.from(indicator.children)
      if (reduced) {
        intro.from([...lines, ...copy, ...marks], { opacity: 0, duration: 0.8, stagger: 0.1 })
      } else {
        intro
          .from(lines, {
            yPercent: 70,
            rotation: 4,
            opacity: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'back.out(1.6)',
            transformOrigin: '0% 100%',
          })
          .from(copy, { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(1.4)' }, 0.35)
          .from(marks, { opacity: 0, duration: 0.8, stagger: 0.1 }, 1.2)
      }
      gsap.to(indicator, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '15% top', scrub: true },
      })
    }, hero)
    const cancel = onIntroDone(() => intro?.play())
    return () => {
      cancel()
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="abertura"
      data-section
      ref={heroRef}
      className="relative isolate min-h-svh overflow-x-clip"
    >
      <GridBackdrop />
      <SectionChrome id="abertura" grid={false} divider={false} />

      <div className="relative grid min-h-svh grid-cols-1 content-center gap-8 px-4 pt-24 pb-20 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-6 md:px-12 md:pt-28 md:pb-20">
        <div className="relative">
          <h1 ref={titleRef} className="font-display text-[26vw] leading-[0.8] tracking-[-0.01em] uppercase md:text-[13.5vw]">
            <span ref={line1} className="block origin-left text-bone will-change-transform">
              Gustavo
            </span>
            <span ref={line2} className="block origin-left text-acid will-change-transform">
              Dev
            </span>
          </h1>
          <div ref={copyRef}>
            <p className="mt-6 max-w-[34rem] text-lg leading-snug text-pretty text-bone md:mt-9 md:max-w-none md:text-[clamp(1.125rem,1.45vw,1.75rem)]">
              Sites, sistemas e APIs. Front e back, do design ao deploy.
            </p>
            <p className="mt-3 font-mono text-[11px] text-muted md:mt-4 md:text-[clamp(0.75rem,0.8vw,0.95rem)]">
              react · typescript · java · spring · quarkus · postgresql
            </p>
          </div>
        </div>

        <div className="pointer-events-none relative z-10 h-[92vw] md:h-[72svh]">
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.webp}
              photo={photo}
              className={`w-[50vw] md:w-[clamp(220px,22vw,340px)] ${cardPlacement[i]}`}
              zIndex={i + 1}
              register={registers.current[i]}
              attached={
                i === 0 ? (
                  // A faixa escura da imagem é a parede: encosta na borda direita do cartão.
                  <Personagem
                    pose="espiando"
                    size="sm"
                    show={peek}
                    delay={1.7}
                    className="absolute top-[4%] left-full -ml-px"
                  />
                ) : undefined
              }
            />
          ))}
        </div>
      </div>

      <div
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute bottom-[72px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] text-muted md:text-[11px]"
      >
        <span>scroll</span>
        <span className="block h-10 w-px overflow-hidden">
          <span className="scroll-line block h-full w-full bg-acid" />
        </span>
      </div>
    </section>
  )
}

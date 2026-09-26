import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { useTilt } from '../motion/useTilt'
import { timeline } from '../data/timeline'
import { Personagem } from './Personagem'

const paragraphs = [
  'Sou de Palmas, no Tocantins, e programo desde os 16 anos. Comecei montando sites por curiosidade e fui descendo pro back-end, pra API e pro banco de dados.',
  'Desde 2024 trabalho como freelancer, fazendo sites e sistemas pra clientes daqui e de fora. Hoje procuro projetos em que eu cuide do produto inteiro, e também uma equipe em que eu continue aprendendo.',
]

/** Seção 06. Foto natural do capuz como cartão que inclina com o mouse, texto, linha do tempo e o personagem com café. */
export function Story() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useScrollSkew(titleRef, { stiffness: 120, damping: 10 })
  useTilt(cardRef, { maxX: 10, maxY: 14, glareRef })

  useEffect(() => {
    const body = bodyRef.current
    const card = cardRef.current
    if (!body || !card) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.from(card.parentElement, {
        y: reduced ? 0 : 60,
        rotation: reduced ? 0 : -6,
        opacity: 0,
        duration: reduced ? 0.6 : 1.1,
        ease: reduced ? 'power1.out' : 'back.out(1.6)',
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
      gsap.from(body.children, {
        y: reduced ? 0 : 24,
        opacity: 0,
        duration: reduced ? 0.5 : 0.8,
        stagger: 0.1,
        ease: reduced ? 'power1.out' : 'back.out(1.5)',
        scrollTrigger: { trigger: body, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="historia" data-section className="relative px-4 py-24 pl-6 md:px-12 md:py-36">
      <h2
        ref={titleRef}
        className="origin-left font-display text-[17vw] leading-[0.84] uppercase will-change-transform md:text-[8vw]"
      >
        Desde os 16
      </h2>

      <div className="mt-12 grid gap-12 md:mt-20 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-20">
        <div className="w-[70vw] max-w-[380px] -rotate-2 md:w-full">
          <div
            ref={cardRef}
            className="relative overflow-hidden bg-surface p-[6px] will-change-transform md:p-2"
            style={{ border: '1px solid var(--card-edge)', boxShadow: 'var(--shadow-card)' }}
          >
            <picture>
              <source
                srcSet="/foto/foto2-420.webp 420w, /foto/foto2.webp 760w"
                sizes="(min-width: 768px) 380px, 70vw"
                type="image/webp"
              />
              <img
                src="/foto/foto2.png"
                alt="Gustavo de capuz, com a mão no queixo"
                width={760}
                height={739}
                loading="lazy"
                decoding="async"
                className="block aspect-[4/5] w-full object-cover object-[50%_30%]"
              />
            </picture>
            <div
              className="flex justify-between pt-2 pb-px font-mono text-[10px] leading-none"
              style={{ color: 'var(--c-muted-hi)' }}
            >
              <span>desde os 16</span>
              <span>palmas, to</span>
            </div>
            <div
              ref={glareRef}
              aria-hidden
              className="pointer-events-none absolute -inset-x-1/2 inset-y-0 opacity-0 mix-blend-screen"
              style={{ backgroundImage: 'var(--glare)' }}
            />
          </div>
        </div>

        <div ref={bodyRef} className="flex flex-col gap-6">
          {paragraphs.map((p) => (
            <p key={p} className="max-w-[36rem] text-lg leading-snug text-bone md:text-[clamp(1.125rem,1.4vw,1.5rem)]">
              {p}
            </p>
          ))}
          <div className="mt-4 flex flex-wrap items-end gap-8 md:mt-8">
            <ol className="flex flex-col gap-3 font-mono text-xs md:text-sm" style={{ borderLeft: '1px solid var(--c-border)' }}>
              {timeline.map((t) => (
                <li key={t.when} className="pl-4">
                  <span className="text-acid">{t.when}</span> <span className="text-muted">·</span>{' '}
                  <span className="text-bone">{t.what}</span>
                </li>
              ))}
            </ol>
            <Personagem pose="cafe" size="sm" />
          </div>
        </div>
      </div>
    </section>
  )
}

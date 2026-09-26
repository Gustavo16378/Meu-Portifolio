import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../motion/gsap'
import { addGlitchIn } from '../motion/glitch'
import { useScrollSkew } from '../motion/useScrollSkew'
import { Personagem } from './Personagem'

const paragraphs = [
  'Eu desenho e construo cada site do zero. Não uso template: layout, animação e código saem pensados pra aquele projeto.',
  'O trabalho não para na tela. Faço o back-end, a API e o banco de dados, e cuido do deploy e da hospedagem.',
  'Cada projeto tem identidade própria. Uma vinícola e uma cafeteria não precisam do mesmo site, então cada um sai com a sua cara.',
]

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useScrollSkew(titleRef, { stiffness: 110, damping: 8 })

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const text = textRef.current
    if (!section || !title || !text) return

    const mm = gsap.matchMedia()
    mm.add(
      { reduced: '(prefers-reduced-motion: reduce)', full: '(prefers-reduced-motion: no-preference)' },
      (ctx) => {
        const reduced = Boolean(ctx.conditions?.reduced)
        let alive = true

        gsap.from(title, {
          yPercent: reduced ? 0 : 40,
          rotation: reduced ? 0 : 3,
          opacity: 0,
          duration: reduced ? 0.6 : 1.1,
          ease: reduced ? 'power1.out' : 'back.out(1.7)',
          transformOrigin: '0% 100%',
          scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none reverse' },
        })

        // Linhas cortadas depois das fontes; se a largura mudar, o SplitText corta de novo e refaz a animação.
        document.fonts.ready.then(() => {
          if (!alive) return
          ctx.add(() => {
            Array.from(text.children).forEach((p) => {
              SplitText.create(p, {
                type: 'lines',
                linesClass: 'block will-change-transform',
                autoSplit: true,
                onSplit: (self) => {
                  gsap.set(self.lines, { opacity: 0 })
                  const tl = gsap.timeline({
                    scrollTrigger: { trigger: p, start: 'top 82%', toggleActions: 'play none none reset' },
                  })
                  if (reduced) return tl.to(self.lines, { opacity: 1, duration: 0.5, stagger: 0.08 })
                  return addGlitchIn(tl, self.lines, 0, { amp: 14, stagger: 0.09 })
                },
              })
            })
          })
        })

        return () => {
          alive = false
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section id="faco" data-section ref={sectionRef} className="relative px-4 py-28 md:px-12 md:py-44">
      <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
        <div className="flex flex-col gap-6 md:gap-10">
          <h2
            ref={titleRef}
            className="origin-left font-display text-[19vw] leading-[0.84] uppercase will-change-transform md:text-[8.5vw]"
          >
            Não é só
            <br />a tela
          </h2>
          {/* Ele aponta pro texto do lado */}
          <Personagem pose="apontando" size="md" className="self-start md:self-end md:mr-[8%]" />
        </div>
        <div ref={textRef} className="flex max-w-[34rem] flex-col gap-6 md:gap-8 md:pt-4">
          {paragraphs.map((p) => (
            <p key={p} className="text-lg leading-snug text-bone md:text-[clamp(1.125rem,1.4vw,1.5rem)]">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

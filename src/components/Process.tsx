import { useEffect, useRef, type MouseEvent } from 'react'
import { gsap } from '../motion/gsap'
import { addGlitchIn } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { useMagnetic } from '../motion/useMagnetic'
import { navigateTo } from '../motion/navigate'
import { PROCESS_POSES } from '../data/personagem'
import { pad2 } from '../data/sections'
import { Personagem } from './Personagem'
import { SectionChrome } from './SectionChrome'

const steps = [
  {
    title: 'Conversa',
    text: 'Você conta o que precisa e eu entendo o negócio, o público e o prazo. Daí sai um escopo por escrito, com o que entra e o que fica de fora.',
  },
  {
    title: 'Identidade e design',
    text: 'Defino cores, tipografia e layout. Você aprova as telas antes de qualquer linha de código.',
  },
  {
    title: 'Construção',
    text: 'Front, back, API e banco. Você acompanha tudo por um link de teste que atualiza a cada entrega.',
  },
  {
    title: 'Deploy e acompanhamento',
    text: 'Publico com domínio, HTTPS e SEO configurados, e acompanho os primeiros ajustes depois que está no ar.',
  },
]

/** Seção 05. Quatro passos em linha, cada um com a pose do personagem; os blocos entram um a um com glitch curto. */
export function Process() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)

  useScrollSkew(titleRef, { stiffness: 120, damping: 10 })
  useMagnetic(linkRef)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const blocks = Array.from(list.querySelectorAll('[data-step-text]'))
    const reduced = prefersReducedMotion()
    const mm = gsap.matchMedia(list)
    // As duas condições: com a sintaxe de objeto o matchMedia só roda a função quando alguma delas vale.
    mm.add({ desktop: '(min-width: 768px)', mobile: 'not all and (min-width: 768px)' }, (ctx) => {
      gsap.set(blocks, { opacity: 0 })
      // Desktop: os quatro lado a lado entram um a um quando a fileira aparece. Celular: empilhados, cada bloco
      // tem o próprio gatilho (com um só pra lista, do 2 ao 4 o glitch rodava fora da tela).
      const desktop = Boolean(ctx.conditions?.desktop)
      const groups = desktop ? [{ trigger: list, start: 'top 75%', targets: blocks }] : blocks.map((b) => ({ trigger: b, start: 'top 88%', targets: [b] }))
      for (const g of groups) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: g.trigger, start: g.start, toggleActions: 'play none none reset' },
        })
        if (reduced) tl.to(g.targets, { opacity: 1, duration: 0.5, stagger: 0.12 })
        else addGlitchIn(tl, g.targets, 0, { amp: 12, stagger: 0.18 })
      }
    })
    return () => mm.revert()
  }, [])

  const goContact = (e: MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('contato')
    if (target) navigateTo(target)
  }

  return (
    <section id="processo" data-section className="relative isolate overflow-x-clip px-4 pt-24 pb-32 pl-6 md:px-12 md:py-36">
      <SectionChrome id="processo" side="left" />
      <h2
        ref={titleRef}
        className="origin-left font-display text-[17vw] leading-[0.84] uppercase will-change-transform md:text-[8vw]"
      >
        Como funciona
      </h2>

      <ol ref={listRef} className="mt-12 grid gap-12 md:mt-20 md:grid-cols-4 md:gap-8">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col">
            {/* Aparece assim que entra no pé da tela; o atraso curto só escalona os quatro lado a lado no desktop. */}
            <Personagem pose={PROCESS_POSES[i]} size="sm" enter="hop" start="top 96%" delay={i * 0.06} className="mb-5 self-start" />
            <div data-step-text className="will-change-transform" style={{ borderTop: '1px solid var(--c-border)' }}>
              <p className="pt-4 font-mono text-[11px] text-acid md:text-xs">{pad2(i + 1)}</p>
              <h3 className="mt-2 font-display text-3xl leading-[0.9] uppercase md:text-4xl">{s.title}</h3>
              <p className="mt-3 max-w-[22rem] text-base leading-snug text-bone md:text-[17px]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex flex-col items-start gap-4 md:mt-24 md:flex-row md:items-center md:gap-10">
        <p className="max-w-[40rem] text-lg leading-snug text-bone md:text-xl">
          Cada projeto tem escopo e orçamento próprios. O primeiro passo é uma conversa.
        </p>
        <a
          ref={linkRef}
          href="#contato"
          onClick={goContact}
          className="inline-flex min-h-11 items-center rounded-[3px] border border-acid px-5 font-mono text-xs text-acid md:text-sm"
        >
          ir para o contato
        </a>
      </div>
    </section>
  )
}

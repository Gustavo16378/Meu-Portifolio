import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useMagnetic } from '../motion/useMagnetic'
import { contact, social } from '../data/contact'
import { fullStack } from '../data/stack'
import { GridBackdrop } from './GridBackdrop'
import { ContactBuddy } from './ContactBuddy'

const FIRST = 'Vamos'
const SECOND = 'conversar?'
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Seção 07. O título é digitado quando a seção chega (mesmo ritmo do preloader), a última palavra em lima.
 * E-mail e WhatsApp grandes, botão lima pro WhatsApp com o personagem acenando, e o rodapé.
 */
export function Contact() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const firstRef = useRef<HTMLSpanElement>(null)
  const secondRef = useRef<HTMLSpanElement>(null)
  const caret1Ref = useRef<HTMLSpanElement>(null)
  const caret2Ref = useRef<HTMLSpanElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useMagnetic(buttonRef)

  // Digita quando a seção entra na tela; em reduced-motion o título já aparece pronto.
  useEffect(() => {
    const title = titleRef.current
    const first = firstRef.current
    const second = secondRef.current
    const caret1 = caret1Ref.current
    const caret2 = caret2Ref.current
    if (!title || !first || !second || !caret1 || !caret2) return
    if (prefersReducedMotion()) {
      first.textContent = FIRST
      second.textContent = SECOND
      return
    }
    // Um cursor por linha: aparece o da linha que está sendo digitada.
    const at = (line: 1 | 2) => {
      caret1.hidden = line !== 1
      caret2.hidden = line !== 2
    }
    const typing = (on: boolean) => [caret1, caret2].forEach((c) => c.classList.toggle('is-typing', on))
    let tl: gsap.core.Timeline | undefined
    const st = ScrollTrigger.create({
      trigger: title,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        tl = gsap.timeline()
        let t = 0.1
        tl.call(() => at(1), undefined, 0)
        tl.call(typing, [true], t)
        const type = (el: HTMLElement, text: string) => {
          for (let i = 0; i < text.length; i++) {
            t += rand(0.04, 0.09) + (i === 0 ? 0.08 : 0)
            const value = text.slice(0, i + 1)
            tl?.call(() => {
              el.textContent = value
            }, undefined, t)
          }
        }
        type(first, FIRST)
        t += 0.12
        tl.call(() => at(2), undefined, t)
        type(second, SECOND)
        tl.call(typing, [false], t + 0.05)
      },
    })
    return () => {
      st.kill()
      tl?.kill()
    }
  }, [])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.from(body.children, {
        y: reduced ? 0 : 24,
        opacity: 0,
        duration: reduced ? 0.5 : 0.8,
        stagger: 0.1,
        ease: reduced ? 'power1.out' : 'back.out(1.5)',
        scrollTrigger: { trigger: body, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    }, body)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contato" data-section className="relative flex min-h-svh flex-col">
      <GridBackdrop />

      <div className="relative flex flex-1 flex-col justify-center px-4 pt-28 pb-16 pl-6 md:px-12 md:pt-32">
        {/* Espaço reservado com o texto invisível: nada pula enquanto digita. */}
        <h2
          ref={titleRef}
          aria-label={`${FIRST} ${SECOND}`}
          className="relative font-display text-[19vw] leading-[0.84] uppercase md:text-[12vw]"
        >
          <span aria-hidden className="invisible block">
            {FIRST}
            <br />
            {SECOND}
          </span>
          <span aria-hidden className="absolute inset-0">
            <span className="block min-h-[0.84em]">
              <span ref={firstRef} className="text-bone" />
              <span ref={caret1Ref} hidden className="caret ml-[0.04em] inline-block h-[0.72em] w-[3px] bg-acid md:w-1" />
            </span>
            <span className="block">
              <span ref={secondRef} className="text-acid" />
              <span ref={caret2Ref} hidden className="caret ml-[0.04em] inline-block h-[0.72em] w-[3px] bg-acid md:w-1" />
            </span>
          </span>
        </h2>

        <div ref={bodyRef} className="mt-10 flex flex-col gap-6 md:mt-14">
          <a
            href={`mailto:${contact.email}`}
            className="w-fit font-sans text-[7vw] leading-none text-bone transition-[color] duration-200 hover:text-acid md:text-[3.2vw]"
          >
            {contact.email}
          </a>
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-sans text-[7vw] leading-none text-bone transition-[color] duration-200 hover:text-acid md:text-[3.2vw]"
          >
            {contact.whatsappDisplay}
          </a>
          <div className="mt-4 flex items-end gap-6">
            <a
              ref={buttonRef}
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-[3px] bg-acid px-6 font-mono text-sm font-bold text-bg md:min-h-14 md:px-8 md:text-base"
            >
              chamar no WhatsApp <span aria-hidden>↗</span>
            </a>
            <ContactBuddy />
          </div>
        </div>
      </div>

      <footer
        className="relative flex flex-col gap-4 px-4 pt-8 pb-24 pl-6 font-mono text-[11px] text-muted md:gap-3 md:px-12 md:pb-20 md:text-xs"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {social.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="-m-2 inline-block p-2 text-bone transition-[color] duration-200 hover:text-acid"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="-m-2 inline-block p-2 text-bone transition-[color] duration-200 hover:text-acid"
            >
              {contact.email}
            </a>
          </li>
        </ul>
        <p>{fullStack.join(' · ')}</p>
        <p>gustavodev.dev · palmas, to · feito do zero</p>
      </footer>
    </section>
  )
}

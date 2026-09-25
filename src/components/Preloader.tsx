import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { lockScroll, unlockScroll } from '../motion/scrollLock'
import { finishIntro, markPreloaderSeen, shouldShowPreloader } from '../motion/intro'

const FIRST = 'Gustavo '
const WRONG = 'Lima'
const RIGHT = 'Dev'

// Ritmo em segundos. Cada tecla sorteia um intervalo em volta da média, como gente digitando.
const START_DELAY = 0.04
const TYPE_MIN = 0.03
const TYPE_MAX = 0.075
const WORD_START_EXTRA = 0.05 // hesitação antes de começar uma palavra
const BACKSPACE_MIN = 0.03
const BACKSPACE_MAX = 0.05
const PAUSE_BEFORE_ERASE = 0.2
const PAUSE_BEFORE_RIGHT = 0.08
const HOLD = 0.5
const CURTAIN = 0.45
const FONT_TIMEOUT = 700

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Primeira visita da sessão: digita "Gustavo Lima", apaga "Lima", digita "Dev" em lima,
 * segura meio segundo e a cortina sobe revelando o hero.
 */
export function Preloader() {
  const [show, setShow] = useState(shouldShowPreloader)
  const rootRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLSpanElement>(null)
  const secondRef = useRef<HTMLSpanElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!show) {
      finishIntro()
      return
    }
    const root = rootRef.current
    const first = firstRef.current
    const second = secondRef.current
    const caret = caretRef.current
    if (!root || !first || !second || !caret) return

    const reduced = prefersReducedMotion()
    let cancelled = false
    let tl: gsap.core.Timeline | undefined

    lockScroll()
    window.scrollTo(0, 0)

    const finish = () => {
      markPreloaderSeen()
      unlockScroll()
      setShow(false)
    }

    // Enquanto digita o cursor fica aceso; parado, pisca.
    const typing = (on: boolean) => caret.classList.toggle('is-typing', on)

    const build = () => {
      tl = gsap.timeline({ onComplete: finish })
      let t = START_DELAY
      tl.call(typing, [true], t)

      // Digita `text` depois de `base`, uma tecla por vez.
      const type = (el: HTMLElement, base: string, text: string) => {
        for (let i = 0; i < text.length; i++) {
          const atWordStart = (i === 0 && base !== '') || text[i - 1] === ' '
          t += rand(TYPE_MIN, TYPE_MAX) + (atWordStart ? WORD_START_EXTRA : 0)
          const value = base + text.slice(0, i + 1)
          tl?.call(() => {
            el.textContent = value
          }, undefined, t)
        }
      }

      type(first, '', FIRST)
      type(first, FIRST, WRONG)

      // Para, pisca, e percebe o erro.
      tl.call(typing, [false], t + 0.02)
      t += PAUSE_BEFORE_ERASE
      tl.call(typing, [true], t)
      for (let i = WRONG.length - 1; i >= 0; i--) {
        t += rand(BACKSPACE_MIN, BACKSPACE_MAX)
        const value = FIRST + WRONG.slice(0, i)
        tl.call(() => {
          first.textContent = value
        }, undefined, t)
      }

      t += PAUSE_BEFORE_RIGHT
      type(second, '', RIGHT)
      tl.call(typing, [false], t + 0.02)

      t += HOLD
      tl.call(finishIntro, undefined, t)
      if (reduced) tl.to(root, { opacity: 0, duration: 0.3, ease: 'power1.out' }, t)
      else tl.to(root, { yPercent: -100, duration: CURTAIN, ease: 'power4.inOut' }, t)
    }

    // Só começa com a Tanker pronta, pra não digitar na fonte reserva.
    const fontReady = document.fonts.load('1em Tanker').catch(() => undefined)
    const timeout = new Promise<void>((resolve) => gsap.delayedCall(FONT_TIMEOUT / 1000, resolve))
    Promise.race([fontReady, timeout]).then(() => {
      if (!cancelled) build()
    })

    return () => {
      cancelled = true
      tl?.kill()
      gsap.set(root, { clearProps: 'transform,opacity' })
      first.textContent = ''
      second.textContent = ''
      typing(false)
      unlockScroll()
    }
  }, [show])

  if (!show) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 flex items-center justify-center bg-bg will-change-transform"
      style={{ zIndex: 'var(--z-preloader)' }}
    >
      {/* Caixa com a largura da frase mais longa: o texto cresce da esquerda sem ficar recentrando. */}
      <div className="relative font-display text-[min(15vw,26svh)] leading-none whitespace-pre uppercase">
        <span className="invisible">
          {FIRST}
          {WRONG}
        </span>
        <span className="absolute inset-0 flex items-center">
          <span ref={firstRef} className="text-bone" />
          <span ref={secondRef} className="text-acid" />
          <span
            ref={caretRef}
            className="caret ml-[0.04em] inline-block h-[0.78em] w-[3px] bg-acid md:w-1"
          />
        </span>
      </div>
    </div>
  )
}

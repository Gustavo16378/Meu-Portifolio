import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { lockScroll, unlockScroll } from '../motion/scrollLock'
import { finishIntro } from '../motion/intro'
import { Personagem } from './Personagem'

const FIRST = 'Gustavo '
const WRONG = 'Lima'
const RIGHT = 'Dev'

// Ritmo em segundos. Cada tecla sorteia um intervalo em volta da média, como gente digitando.
// Com a rede rápida, tudo (digitar, pausar, apagar, segurar e a cortina) dá uns 1,5s. A cortina só sobe com o
// essencial do hero carregado (ESSENTIAL_FONTS e as fotos); com a rede lenta o cursor fica piscando até lá.
const START_DELAY = 0.04
const TYPE_MIN = 0.02
const TYPE_MAX = 0.04
const WORD_START_EXTRA = 0.05 // hesitação antes de começar uma palavra
const BACKSPACE_MIN = 0.025
const BACKSPACE_MAX = 0.035
const PAUSE_BEFORE_ERASE = 0.15
const PAUSE_BEFORE_RIGHT = 0.06
const HOLD = 0.3
const CURTAIN = 0.38
const FONT_TIMEOUT = 200
// Teto da espera pelo essencial: se algo nunca chegar, a página abre mesmo assim.
const MAX_WAIT = 10

// Fontes que o hero usa na primeira tela.
const ESSENTIAL_FONTS = ['1em Tanker', '1em Synonym', '1em "Commit Mono"']

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Fontes do hero e as fotos dos cartões carregadas e decodificadas (imagem com erro conta como pronta). */
function heroEssentials(): Promise<unknown> {
  const fonts = ESSENTIAL_FONTS.map((f) => document.fonts.load(f).catch(() => undefined))
  // Os cartões de foto; o personagem espiando é lazy e entra depois, não segura a abertura.
  const photos = Array.from(document.querySelectorAll<HTMLImageElement>('#abertura img'))
    .filter((img) => img.loading !== 'lazy')
    .map((img) => img.decode().catch(() => undefined))
  return Promise.all([...fonts, ...photos])
}

/**
 * Todo carregamento: digita "Gustavo Lima", apaga "Lima", digita "Dev" em lima,
 * segura 300ms e a cortina sobe revelando o hero, que já estava pronto por trás.
 */
export function Preloader() {
  const [show, setShow] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLSpanElement>(null)
  const secondRef = useRef<HTMLSpanElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)

  // Assume o lugar do preloader estático do index.html no mesmo quadro (antes da pintura), sem piscar.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
  }, [])

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
    let out: gsap.core.Timeline | undefined
    let typed = false
    let loaded = false

    lockScroll()
    window.scrollTo(0, 0)

    const finish = () => {
      unlockScroll()
      setShow(false)
    }

    // Enquanto digita o cursor fica aceso; parado, pisca.
    const typing = (on: boolean) => caret.classList.toggle('is-typing', on)

    // A cortina sobe quando o nome terminou (com a pausa) e o essencial do hero chegou, o que vier por último.
    const reveal = () => {
      if (cancelled || out || !typed || !loaded) return
      out = gsap.timeline({ onComplete: finish })
      out.call(finishIntro, undefined, 0)
      if (reduced) out.to(root, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0)
      else out.to(root, { yPercent: -100, duration: CURTAIN, ease: 'power4.inOut' }, 0)
    }
    const ready = () => {
      if (loaded) return
      loaded = true
      cap.kill()
      reveal()
    }
    const cap = gsap.delayedCall(MAX_WAIT, ready)
    heroEssentials().then(ready)

    const build = () => {
      tl = gsap.timeline({
        onComplete: () => {
          typed = true
          reveal()
        },
      })
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

      // Segura o nome pronto; a timeline acaba aqui e a cortina fica com reveal().
      t += HOLD
      tl.set({}, {}, t)
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
      out?.kill()
      cap.kill()
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
      {/* Ele digitando no canto, junto com o nome; sai com a cortina. */}
      <Personagem
        pose="digitando"
        size="sm"
        show
        delay={0.05}
        className="absolute"
        style={{ left: 'calc(env(safe-area-inset-left) + 16px)', bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      />
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

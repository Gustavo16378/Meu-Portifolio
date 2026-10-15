import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { lockScroll, unlockScroll } from '../motion/scrollLock'
import { finishIntro } from '../motion/intro'
import { poseSrc } from '../data/personagem'
import { Personagem } from './Personagem'

const FIRST = 'Gustavo'
const SECOND = 'Dev'

// Ritmo em segundos. Com a rede rápida: letras caindo, DEV enchendo, viagem até o título, uns 2s no total.
// Com a rede lenta o nome fica montado e DEV vai enchendo conforme fontes e fotos chegam.
const START_DELAY = 0.05
const STAGGER = 0.045
const WORD_GAP = 0.06 // respiro antes de DEV
const DROP = 0.7
const FILL_OPEN = 0.2 // depois que a última letra de DEV começa a cair, o lima pode começar a subir
const SETTLE = 0.4 // a mola ainda balança um resto, mas a viagem já pode sair
const FILL = 0.35
const HOLD = 0.22 // DEV cheio: ele comemora um instante antes das letras saírem
const TRAVEL = 0.7
const FONT_TIMEOUT = 2
// Teto da espera pelo essencial: se algo nunca chegar, a página abre mesmo assim.
const MAX_WAIT = 10

// Fontes que o hero usa na primeira tela.
const ESSENTIAL_FONTS = ['1em Tanker', '1em Synonym', '1em "Commit Mono"']

/** Retângulo do texto (não da caixa) do primeiro nó de texto dentro de `el`. */
function textRect(el: HTMLElement): DOMRect {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const node = walker.nextNode()
  const range = document.createRange()
  if (node) range.selectNodeContents(node)
  else range.selectNodeContents(el)
  return range.getBoundingClientRect()
}

/** Retângulo de cada letra do título, na ordem. */
function charRects(root: HTMLElement): DOMRect[] {
  const rects: DOMRect[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i])) continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      rects.push(range.getBoundingClientRect())
    }
  }
  return rects
}

/**
 * Todo carregamento: GUSTAVO cai letra por letra com mola, DEV cai só no contorno e enche de lima conforme
 * fontes e fotos do hero chegam, com o personagem do lado apontando. Pronto, as letras viajam e encaixam no
 * título do hero, e o fundo some por baixo: não tem cortina, o preloader vira a abertura.
 */
export function Preloader({ pageReady = true }: { pageReady?: boolean }) {
  const [show, setShow] = useState(true)
  // Ele fica em pé ao lado do DEV apontando enquanto enche, comemora quando enche e sai quando as letras viajam.
  const [guy, setGuy] = useState<'off' | 'apontando' | 'comemorando' | 'saindo'>('off')
  const rootRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const fontsRef = useRef<HTMLSpanElement>(null)
  const photosRef = useRef<HTMLSpanElement>(null)
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const masks = useRef<(HTMLSpanElement | null)[]>([])
  const inners = useRef<(HTMLSpanElement | null)[]>([])
  // As seções abaixo do hero montam aos poucos por trás: a abertura também espera por elas.
  const pageReadyRef = useRef(pageReady)
  pageReadyRef.current = pageReady
  const progressRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    if (pageReady) progressRef.current()
  }, [pageReady])

  // Assume o lugar do preloader estático do index.html no mesmo quadro (antes da pintura), sem piscar.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
    const photos = document.querySelectorAll('#abertura img:not([loading="lazy"])').length
    if (fontsRef.current) fontsRef.current.textContent = `fontes 0/${ESSENTIAL_FONTS.length}`
    if (photosRef.current) photosRef.current.textContent = `fotos 0/${photos}`
  }, [])

  useEffect(() => {
    if (!show) {
      finishIntro()
      return
    }
    const root = rootRef.current
    const bg = bgRef.current
    const status = statusRef.current
    const fontsEl = fontsRef.current
    const photosEl = photosRef.current
    const letterEls = letters.current.filter((el): el is HTMLSpanElement => el !== null)
    const maskEls = masks.current.filter((el): el is HTMLSpanElement => el !== null)
    const innerEls = inners.current.filter((el): el is HTMLSpanElement => el !== null)
    if (!root || !bg || !status || !fontsEl || !photosEl) return

    const reduced = prefersReducedMotion()
    let cancelled = false
    let drop: gsap.core.Timeline | undefined
    let out: gsap.core.Timeline | undefined
    let fillTween: gsap.core.Tween | undefined
    let entered = false
    let fillOpen = false
    let loaded = false
    let locked = true

    lockScroll()
    window.scrollTo(0, 0)

    // Durante a viagem a página continua parada: roda, toque e teclas de rolagem são barrados na captura, antes de
    // chegar no Lenis. Parar o Lenis não serve: o overflow: clip dele tira a barra de rolagem e muda a largura medida.
    const SCROLL_KEYS = new Set([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'])
    const stop = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const stopKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) stop(e)
    }
    const block = (on: boolean) => {
      const opts = { capture: true, passive: false }
      if (on) {
        window.addEventListener('wheel', stop, opts)
        window.addEventListener('touchmove', stop, opts)
        window.addEventListener('keydown', stopKey, opts)
      } else {
        window.removeEventListener('wheel', stop, opts)
        window.removeEventListener('touchmove', stop, opts)
        window.removeEventListener('keydown', stopKey, opts)
      }
    }

    // Progresso real: cada fonte e cada foto do hero conta, e as seções montadas contam como mais uma.
    const photos = Array.from(document.querySelectorAll<HTMLImageElement>('#abertura img')).filter(
      (img) => img.loading !== 'lazy',
    )
    let fontsDone = 0
    let photosDone = 0
    const total = ESSENTIAL_FONTS.length + photos.length + 1
    const progress = () =>
      loaded ? 1 : (fontsDone + photosDone + (pageReadyRef.current ? 1 : 0)) / total

    const renderStatus = () => {
      fontsEl.textContent = `fontes ${fontsDone}/${ESSENTIAL_FONTS.length}`
      photosEl.textContent = `fotos ${photosDone}/${photos.length}`
      fontsEl.classList.toggle('text-acid', fontsDone === ESSENTIAL_FONTS.length)
      photosEl.classList.toggle('text-acid', photosDone === photos.length)
    }
    renderStatus()

    // O lima sobe de baixo: a máscara desce e o texto dentro dela sobe a mesma conta, só transform.
    const fill = { p: 0 }
    const paint = () => {
      if (reduced) {
        gsap.set(maskEls, { opacity: fill.p })
        return
      }
      maskEls.forEach((mask, i) => {
        const offset = (1 - fill.p) * mask.offsetHeight
        gsap.set(mask, { y: offset })
        gsap.set(innerEls[i], { y: -offset })
      })
    }
    paint()

    // A pose da comemoração já fica carregada, pra troca não piscar vazia.
    new Image().src = poseSrc('comemorando').webpSmall

    const finish = () => {
      block(false)
      setShow(false)
    }

    // As letras saem do lugar delas e encaixam em cima das letras do título do hero, que fica escondido até o fim.
    const travel = () => {
      if (cancelled || out || !entered || !loaded || fill.p < 1 || !pageReadyRef.current) return
      // Destrava o corpo (e refaz a medida dos gatilhos) antes de medir o título; até o fim a página segue parada.
      block(true)
      unlockScroll()
      locked = false
      root.style.pointerEvents = 'none'
      out = gsap.timeline({ onComplete: finish, delay: HOLD })
      // Ele ainda comemora um pouco com as letras já saindo, e some antes delas chegarem.
      out.call(setGuy, ['saindo'], reduced ? 0 : TRAVEL * 0.35)

      const title = document.querySelector<HTMLElement>('#abertura h1')
      const targets = title ? charRects(title) : []
      if (reduced || !title || targets.length !== letterEls.length) {
        out.call(finishIntro, undefined, 0)
        out.to(root, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0)
        return
      }

      // Fecha o resto da mola antes de medir: a letra parte do lugar dela, sem giro.
      drop?.progress(1)
      gsap.set(title, { opacity: 0 })
      letterEls.forEach((el, i) => {
        const from = textRect(el)
        const box = el.getBoundingClientRect()
        const to = targets[i]
        gsap.set(el, { transformOrigin: `${from.left - box.left}px ${from.top - box.top}px` })
        out?.to(
          el,
          {
            x: to.left - from.left,
            y: to.top - from.top,
            scale: to.height / from.height,
            duration: TRAVEL,
            ease: 'expo.inOut',
          },
          i * 0.015,
        )
      })
      out.to(status, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0)
      out.to(bg, { opacity: 0, duration: TRAVEL * 0.8, ease: 'power2.inOut' }, 0.12)
      // Os cartões e o texto do hero entram enquanto as letras ainda estão chegando.
      out.call(finishIntro, undefined, TRAVEL * 0.45)
      // Troca pelas letras de verdade no mesmo quadro: mesma posição, mesmo tamanho.
      out.call(() => {
        gsap.set(title, { clearProps: 'opacity' })
        gsap.set(root, { opacity: 0 })
      })
    }

    const fillTo = () => {
      if (cancelled || !fillOpen) return
      const target = progress()
      if (target <= fill.p) {
        travel()
        return
      }
      fillTween?.kill()
      fillTween = gsap.to(fill, {
        p: target,
        duration: FILL,
        ease: 'power2.out',
        onUpdate: paint,
        onComplete: () => {
          if (fill.p >= 1) setGuy('comemorando')
          travel()
        },
      })
    }

    const check = () => {
      if (!loaded && fontsDone === ESSENTIAL_FONTS.length && photosDone === photos.length) loaded = true
      if (loaded) cap.kill()
      renderStatus()
      fillTo()
    }
    progressRef.current = check
    const cap = gsap.delayedCall(MAX_WAIT, () => {
      loaded = true
      check()
    })
    ESSENTIAL_FONTS.forEach((font) =>
      document.fonts
        .load(font)
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return
          fontsDone += 1
          check()
        }),
    )
    photos.forEach((img) =>
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return
          photosDone += 1
          check()
        }),
    )

    const build = () => {
      setGuy('apontando')
      drop = gsap.timeline()
      const settle = () => {
        entered = true
        travel()
      }
      const openFill = () => {
        fillOpen = true
        fillTo()
      }
      if (reduced) {
        drop.to(letterEls, { opacity: 1, duration: 0.4, ease: 'power1.out' }, START_DELAY)
        drop.call(openFill, undefined, START_DELAY)
        drop.call(settle, undefined, START_DELAY + 0.4)
        return
      }
      let lastStart = START_DELAY
      letterEls.forEach((el, i) => {
        const t = START_DELAY + i * STAGGER + (i >= FIRST.length ? WORD_GAP : 0)
        lastStart = t
        drop?.fromTo(
          el,
          { yPercent: -80, rotation: gsap.utils.random(-18, 18), scaleY: 1.25, scaleX: 0.85 },
          { yPercent: 0, rotation: 0, scaleY: 1, scaleX: 1, duration: DROP, ease: 'elastic.out(1, 0.45)' },
          t,
        )
        drop?.to(el, { opacity: 1, duration: 0.1, ease: 'none' }, t)
      })
      drop.call(openFill, undefined, lastStart + FILL_OPEN)
      drop.call(settle, undefined, lastStart + SETTLE)
    }

    // Só começa com a Tanker pronta, pra não cair na fonte reserva e trocar no meio.
    const fontReady = document.fonts.load('1em Tanker').catch(() => undefined)
    const timeout = new Promise<void>((resolve) => gsap.delayedCall(FONT_TIMEOUT, resolve))
    Promise.race([fontReady, timeout]).then(() => {
      if (!cancelled) build()
    })

    return () => {
      cancelled = true
      drop?.kill()
      out?.kill()
      fillTween?.kill()
      cap.kill()
      gsap.set([root, bg, status, ...letterEls, ...maskEls, ...innerEls], { clearProps: 'transform,opacity' })
      const title = document.querySelector<HTMLElement>('#abertura h1')
      if (title) gsap.set(title, { clearProps: 'opacity' })
      progressRef.current = () => undefined
      block(false)
      // Solta só o que este preloader travou (o contador do scrollLock é global).
      if (locked) unlockScroll()
    }
  }, [show])

  if (!show) return null

  let index = 0
  const letter = (char: string, outline: boolean) => {
    const i = index++
    const d = outline ? i - FIRST.length : -1
    return (
      <span
        key={i}
        ref={(el) => {
          letters.current[i] = el
        }}
        className="relative inline-block origin-bottom opacity-0 will-change-transform"
      >
        {outline ? (
          <>
            <span style={{ color: 'transparent', WebkitTextStroke: '0.012em var(--c-acid)' }}>{char}</span>
            {/* Lima por cima, numa máscara maior que a letra pra não cortar a Tanker. */}
            <span
              ref={(el) => {
                masks.current[d] = el
              }}
              className="absolute -inset-x-[0.1em] -inset-y-[0.25em] overflow-hidden"
            >
              <span
                ref={(el) => {
                  inners.current[d] = el
                }}
                className="absolute top-[0.25em] left-[0.1em] block text-acid"
              >
                {char}
              </span>
            </span>
          </>
        ) : (
          char
        )}
      </span>
    )
  }

  return (
    <div ref={rootRef} aria-hidden className="fixed inset-0" style={{ zIndex: 'var(--z-preloader)' }}>
      <div ref={bgRef} className="absolute inset-0 bg-bg" />
      <div className="relative flex h-full items-center justify-center px-4">
        <div className="flex flex-col font-display text-[min(24vw,26svh)] leading-[0.8] tracking-[-0.01em] uppercase md:flex-row md:gap-[0.2em] md:text-[min(15vw,26svh)]">
          <span className="block whitespace-pre text-bone">{Array.from(FIRST).map((c) => letter(c, false))}</span>
          <span className="relative block self-start whitespace-pre">
            {Array.from(SECOND).map((c) => letter(c, true))}
            {/* Espelhado por fora: o flip do Personagem vira giro de 180° quando o GSAP anima a troca de pose. */}
            <span className="absolute -bottom-[0.04em] left-full ml-[0.08em] block -scale-x-100">
              <Personagem
                pose={guy === 'comemorando' || guy === 'saindo' ? 'comemorando' : 'apontando'}
                size="sm"
                show={guy === 'apontando' || guy === 'comemorando'}
                delay={0.1}
              />
            </span>
          </span>
        </div>
      </div>
      <p
        ref={statusRef}
        className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+24px)] text-center font-mono text-[11px] text-muted md:text-xs"
      >
        carregando · <span ref={fontsRef} /> · <span ref={photosRef} />
      </p>
    </div>
  )
}

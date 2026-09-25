import { gsap } from './gsap'

const FRAME = 1 / 60

interface GlitchOptions {
  /** Deslocamento horizontal máximo em px. */
  amp?: number
  /** Intervalo entre um alvo e o próximo. */
  stagger?: number
}

/**
 * Glitch curto: o alvo aparece deslocado de lado por três frames, puxa pro outro lado e estabiliza.
 * Escreve na timeline recebida a partir de `at`. Os alvos precisam começar com opacity 0.
 */
export function addGlitchIn(
  tl: gsap.core.Timeline,
  targets: Element[],
  at = 0,
  { amp = 12, stagger = 0.08 }: GlitchOptions = {},
): gsap.core.Timeline {
  targets.forEach((el, i) => {
    const t = at + i * stagger
    const a = amp * (Math.random() < 0.5 ? -1 : 1) * gsap.utils.random(0.6, 1)
    tl.set(el, { opacity: 0.85, x: a, skewX: a * 0.35 }, t)
      .set(el, { opacity: 0.55, x: -a * 0.5, skewX: 0 }, t + FRAME)
      .set(el, { opacity: 1, x: a * 0.2 }, t + FRAME * 2)
      .set(el, { x: 0 }, t + FRAME * 3)
  })
  return tl
}

/** Glitch avulso num elemento que já está visível (ex.: número que troca). */
export function glitchOnce(el: Element, amp = 6): gsap.core.Timeline {
  const a = amp * (Math.random() < 0.5 ? -1 : 1)
  return gsap
    .timeline()
    .set(el, { x: a, opacity: 0.6 })
    .set(el, { x: -a * 0.5, opacity: 1 }, FRAME)
    .set(el, { x: 0 }, FRAME * 2)
}

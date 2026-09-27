import { gsap } from './gsap'
import { getLenis } from './useLenis'

type Phase = 'start' | 'end'
const listeners = new Set<(phase: Phase, target: HTMLElement) => void>()
let navigating = false

export const isNavigating = (): boolean => navigating

/** Avisa quando uma navegação pelo menu começa e termina (o palco de projetos solta e depois decide se prende). */
export function onNavigate(cb: (phase: Phase, target: HTMLElement) => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Rola até o elemento com o Lenis, atravessando o que estiver no caminho sem travar. */
export function navigateTo(el: HTMLElement): void {
  navigating = true
  listeners.forEach((cb) => cb('start', el))
  let finished = false
  const done = () => {
    if (finished) return
    finished = true
    fallback.kill()
    navigating = false
    listeners.forEach((cb) => cb('end', el))
  }
  // Se o usuário interromper a rolagem, o onComplete não vem: encerra mesmo assim.
  const fallback = gsap.delayedCall(2.4, done)
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { duration: 1.6, force: true, onComplete: done })
  else {
    el.scrollIntoView()
    done()
  }
}

import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { watchVisibility } from './spring'

/**
 * Animação contínua (vapor, respiração) que só roda com o elemento na tela.
 * `build` monta uma timeline com repeat: -1; em reduced-motion não roda.
 */
export function useLoop(ref: RefObject<Element | null>, build: (tl: gsap.core.Timeline) => void): void {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let tl: gsap.core.Timeline | undefined
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ repeat: -1, paused: true })
      build(tl)
    })
    const trigger = watchVisibility(el, (visible) => {
      if (visible) tl?.play()
      else tl?.pause()
    })
    return () => {
      trigger.kill()
      ctx.revert()
    }
    // build só lê refs; montar uma vez é o esperado.
  }, [ref])
}

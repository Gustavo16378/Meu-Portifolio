import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { useLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, createSpring, springAtRest, stepSpring, tickerDt, watchVisibility, type SpringConfig } from './spring'

interface ScrollSkewOptions extends Partial<SpringConfig> {
  /** Graus de skew por px/frame de velocidade do Lenis. */
  factor?: number
  /** Limite em graus. */
  max?: number
}

/**
 * Skew vertical proporcional à velocidade do scroll. Quando o scroll para,
 * a velocidade cai e a mola devolve o elemento a zero passando um pouco do ponto.
 */
export function useScrollSkew(ref: RefObject<HTMLElement | null>, options: ScrollSkewOptions = {}): void {
  const lenis = useLenis()
  const { factor = 0.22, max = 9, stiffness = 120, damping = 9 } = options

  useEffect(() => {
    const el = ref.current
    if (!el || !lenis || prefersReducedMotion()) return

    const setSkew = gsap.quickSetter(el, 'skewY', 'deg')
    const spring = createSpring()
    const config = { stiffness, damping }

    const tick = (_time: number, deltaMs: number) => {
      spring.target = clamp(lenis.velocity * factor, -max, max)
      if (springAtRest(spring)) return
      stepSpring(spring, tickerDt(deltaMs), config)
      setSkew(spring.value)
    }

    let running = false
    const trigger = watchVisibility(el, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) {
        gsap.ticker.remove(tick)
        spring.value = 0
        spring.velocity = 0
        setSkew(0)
      }
      running = visible
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      gsap.set(el, { skewY: 0 })
    }
  }, [ref, lenis, factor, max, stiffness, damping])
}

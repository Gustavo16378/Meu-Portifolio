import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { useLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, createSpring, springAtRest, stepSpring, tickerDt, watchVisibility } from './spring'

// Suspensão macia: quando o scroll para, a carroceria desce, passa do ponto e assenta.
const SPRING = { stiffness: 70, damping: 5.5 }

/**
 * Carroceria sobre molas. Rolando, ela sobe um pouco e inclina pro lado do movimento;
 * quando o scroll para, afunda na suspensão e balança até assentar.
 * `mirrorRef` (opcional) é o reflexo no piso, dentro de um invólucro espelhado: recebe o mesmo
 * movimento, e o espelho do invólucro inverte.
 */
export function useSuspension(
  bodyRef: RefObject<HTMLElement | null>,
  mirrorRef?: RefObject<HTMLElement | null>,
): void {
  const lenis = useLenis()

  useEffect(() => {
    const body = bodyRef.current
    const mirror = mirrorRef?.current ?? null
    if (!body || !lenis || prefersReducedMotion()) return

    const setY = gsap.quickSetter(body, 'y', 'px')
    const setR = gsap.quickSetter(body, 'rotation', 'deg')
    const setMY = mirror ? gsap.quickSetter(mirror, 'y', 'px') : null
    const setMR = mirror ? gsap.quickSetter(mirror, 'rotation', 'deg') : null
    const lift = createSpring()
    const pitch = createSpring()

    const tick = (_time: number, deltaMs: number) => {
      const v = lenis.velocity
      lift.target = -clamp(Math.abs(v) * 0.35, 0, 9)
      pitch.target = clamp(v * 0.05, -1.5, 1.5)
      if (springAtRest(lift, 0.01) && springAtRest(pitch, 0.01)) return
      const dt = tickerDt(deltaMs)
      stepSpring(lift, dt, SPRING)
      stepSpring(pitch, dt, SPRING)
      setY(lift.value)
      setR(pitch.value)
      setMY?.(lift.value)
      setMR?.(pitch.value)
    }

    let running = false
    const trigger = watchVisibility(body, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
    }
  }, [bodyRef, mirrorRef, lenis])
}

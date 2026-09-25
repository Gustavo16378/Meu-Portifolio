import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, createSpring, stepSpring, tickerDt, watchVisibility } from './spring'

interface SpotlightOptions {
  /** Ângulo de repouso em graus (0 = pra direita, negativo = pra cima). */
  rest?: number
  min?: number
  max?: number
}

// Mola mole: o facho chega atrasado e passa um pouco, como um farol pesado girando.
const FOLLOW = { stiffness: 22, damping: 7 }

/**
 * Facho de luz que gira em volta de `originRef` pra apontar pro ponteiro, com atraso de mola.
 * Sem mouse (toque), varre devagar sozinho. `coneRef` gira em volta da borda esquerda.
 */
export function useSpotlight(
  coneRef: RefObject<HTMLElement | null>,
  originRef: RefObject<HTMLElement | null>,
  { rest = -35, min = -80, max = 12 }: SpotlightOptions = {},
): void {
  useEffect(() => {
    const cone = coneRef.current
    const origin = originRef.current
    if (!cone || !origin) return

    gsap.set(cone, { transformOrigin: '0% 50%', rotation: rest })
    if (prefersReducedMotion()) return

    const setRot = gsap.quickSetter(cone, 'rotation', 'deg')
    const angle = createSpring(rest)
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let pointer: { x: number; y: number } | null = null

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY }
    }

    const tick = (time: number, deltaMs: number) => {
      if (hasMouse && pointer) {
        const o = origin.getBoundingClientRect()
        const deg = (Math.atan2(pointer.y - o.top, pointer.x - o.left) * 180) / Math.PI
        angle.target = clamp(deg, min, max)
      } else {
        angle.target = rest + Math.sin(time * 0.45) * 22
      }
      stepSpring(angle, tickerDt(deltaMs), FOLLOW)
      setRot(angle.value)
    }

    let running = false
    const trigger = watchVisibility(cone, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
    }
  }, [coneRef, originRef, rest, min, max])
}

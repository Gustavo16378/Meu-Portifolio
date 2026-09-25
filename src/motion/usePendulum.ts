import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, tickerDt, watchVisibility } from './spring'

interface PendulumOptions {
  /** Período de uma oscilação completa em segundos (quanto maior, mais comprido e pesado parece). */
  period?: number
  /** Amortecimento por segundo. */
  damping?: number
  /** Distância em px do ponteiro até a peça pra ela sentir o vento da mão. */
  reach?: number
  /** Quanto a velocidade do ponteiro (px/s) vira aceleração angular. */
  push?: number
  /** Empurrão inicial (rad/s) quando a peça aparece na tela. */
  kick?: number
}

/**
 * Pêndulo: `ref` gira em torno do topo (o ponto de pendurar). O ponteiro passando perto de `bobRef`
 * empurra na direção em que a mão se move. Pausa fora da tela.
 */
export function usePendulum(
  ref: RefObject<HTMLElement | SVGElement | null>,
  bobRef: RefObject<Element | null>,
  options: PendulumOptions = {},
): void {
  const { period = 1.7, damping = 0.4, reach = 90, push = 0.006, kick = 0.9 } = options

  useEffect(() => {
    const el = ref.current
    const bob = bobRef.current
    if (!el || !bob || prefersReducedMotion()) return

    const w2 = ((2 * Math.PI) / period) ** 2
    let theta = 0
    let omega = 0
    let torque = 0

    gsap.set(el, { transformOrigin: '50% 0%' })
    const setRot = gsap.quickSetter(el, 'rotation', 'deg')

    let lastX = 0
    let lastT = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max(1, now - lastT) / 1000
      const vx = lastT ? (e.clientX - lastX) / dt : 0
      lastX = e.clientX
      lastT = now
      const r = bob.getBoundingClientRect()
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right)
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom)
      if (Math.hypot(dx, dy) > reach) return
      // Mão pra direita empurra a ponta pra direita: rotação anti-horária em volta do topo.
      torque += -clamp(vx, -3000, 3000) * push
    }

    const tick = (_time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      const accel = -w2 * Math.sin(theta) - damping * omega + torque
      torque = 0
      omega += accel * dt
      theta += omega * dt
      theta = clamp(theta, -1.2, 1.2)
      setRot((theta * 180) / Math.PI)
    }

    let running = false
    const trigger = watchVisibility(el, (visible) => {
      if (visible && !running) {
        gsap.ticker.add(tick)
        if (Math.abs(omega) < 0.05 && Math.abs(theta) < 0.02) omega = kick * (Math.random() < 0.5 ? -1 : 1)
      }
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      gsap.set(el, { rotation: 0 })
    }
  }, [ref, bobRef, period, damping, reach, push, kick])
}

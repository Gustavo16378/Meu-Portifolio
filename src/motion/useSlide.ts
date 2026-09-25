import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { useLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, tickerDt, watchVisibility } from './spring'

interface SlideOptions {
  /** Aceleração em px/s² por px/frame de velocidade do scroll. */
  scrollPush?: number
  /** Decaimento da velocidade por segundo (atrito do balcão). */
  friction?: number
  /** Energia que sobra ao bater na ponta. */
  restitution?: number
  /** Alcance em px pro ponteiro empurrar a peça. */
  reach?: number
}

/**
 * Objeto solto numa superfície: o scroll acelera, o atrito freia, as pontas devolvem com perda.
 * `ref` anda em x dentro da largura de `trackRef`. O ponteiro passando perto também empurra.
 */
export function useSlide(
  ref: RefObject<HTMLElement | SVGElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  options: SlideOptions = {},
): void {
  const lenis = useLenis()
  const { scrollPush = 30, friction = 2.2, restitution = 0.45, reach = 50 } = options

  useEffect(() => {
    const el = ref.current
    const track = trackRef.current
    if (!el || !track || !lenis || prefersReducedMotion()) return

    const setX = gsap.quickSetter(el, 'x', 'px')
    const setR = gsap.quickSetter(el, 'rotation', 'deg')
    let x = 0
    let v = 0
    let min = 0
    let max = 0

    // A peça começa no lugar do layout; os limites são as pontas do balcão.
    const measure = () => {
      const t = track.getBoundingClientRect()
      const e = el.getBoundingClientRect()
      const left = e.left - x
      min = t.left - left
      max = t.right - (left + e.width)
    }
    measure()

    let lastX = 0
    let lastT = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max(1, now - lastT) / 1000
      const vx = lastT ? (e.clientX - lastX) / dt : 0
      lastX = e.clientX
      lastT = now
      const r = el.getBoundingClientRect()
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right)
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom)
      if (Math.hypot(dx, dy) > reach) return
      const target = clamp(vx, -2400, 2400) * 0.7
      if (Math.abs(target) > Math.abs(v)) v += (target - v) * 0.5
    }

    const tick = (_time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      // Limite: um salto de navegação (menu, âncora) não pode arremessar a peça.
      v += clamp(lenis.velocity, -40, 40) * scrollPush * dt
      v *= Math.exp(-friction * dt)
      x += v * dt
      if (x < min) {
        x = min + (min - x) * restitution
        v = -v * restitution
      } else if (x > max) {
        x = max - (x - max) * restitution
        v = -v * restitution
      }
      setX(x)
      // Inclina um pouco quando anda rápido, como algo que arrasta no atrito.
      setR(clamp(v * 0.004, -4, 4))
    }

    let running = false
    const trigger = watchVisibility(track, (visible) => {
      if (visible && !running) {
        measure()
        gsap.ticker.add(tick)
      }
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', measure)
      gsap.set(el, { x: 0, rotation: 0 })
    }
  }, [ref, trackRef, lenis, scrollPush, friction, restitution, reach])
}

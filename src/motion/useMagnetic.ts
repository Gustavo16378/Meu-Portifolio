import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'

interface MagneticOptions {
  /** Desliga sem desmontar (ex.: menu fechado). */
  enabled?: boolean
}

const MAX = 6 // px de deslocamento, em cada eixo
const RADIUS = 80 // px em volta do botão em que ele começa a seguir o cursor
const PULL = 0.3 // fração da distância ao centro
const HOVER_SCALE = 1.02

/**
 * Botão magnético contido: dentro de 80px em volta dele, anda até 6px na direção do cursor
 * (quickTo, 0.6s, power3); ao sair, volta ao centro com elastic. Em cima dele, scale 1.02.
 * O transform do elemento é só do GSAP: nada de transição CSS de transform nele.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, { enabled = true }: MagneticOptions = {}): void {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let follow: { x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null = null
    let hovered = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      // Caixa sem o deslocamento atual, pra o centro não fugir junto com o botão.
      const r = el.getBoundingClientRect()
      const ox = Number(gsap.getProperty(el, 'x')) || 0
      const oy = Number(gsap.getProperty(el, 'y')) || 0
      const left = r.left - ox
      const top = r.top - oy
      const near =
        e.clientX > left - RADIUS && e.clientX < left + r.width + RADIUS && e.clientY > top - RADIUS && e.clientY < top + r.height + RADIUS

      if (near) {
        if (!follow) {
          gsap.killTweensOf(el, 'x,y')
          follow = {
            x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
            y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
          }
        }
        const cx = left + r.width / 2
        const cy = top + r.height / 2
        follow.x(gsap.utils.clamp(-MAX, MAX, (e.clientX - cx) * PULL))
        follow.y(gsap.utils.clamp(-MAX, MAX, (e.clientY - cy) * PULL))
      } else if (follow) {
        follow = null
        gsap.killTweensOf(el, 'x,y')
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
      }

      // Scale leve só com o cursor em cima do botão.
      const over = e.clientX >= left && e.clientX <= left + r.width && e.clientY >= top && e.clientY <= top + r.height
      if (over !== hovered) {
        hovered = over
        gsap.to(el, { scale: over ? HOVER_SCALE : 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(el, 'x,y,scale')
      gsap.set(el, { x: 0, y: 0, scale: 1 })
    }
  }, [ref, enabled])
}

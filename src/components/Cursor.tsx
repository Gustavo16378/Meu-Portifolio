import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { createSpring, springAtRest, stepSpring, tickerDt } from '../motion/spring'

type Mode = 'default' | 'link' | 'drag'

const RING_SCALE: Record<Mode, number> = { default: 1, link: 1.9, drag: 1.4 }
const DOT_SCALE: Record<Mode, number> = { default: 1, link: 0, drag: 1 }

// O anel é mais leve que o ponto: atrasa e passa um pouco do lugar.
const FOLLOW = { stiffness: 260, damping: 24 }
const GROW = { stiffness: 300, damping: 16 }

const interactive = 'a, button, [data-cursor]'

/** Ponto lima preso ao mouse e anel fino com inércia. Só em dispositivos com mouse. */
export function Cursor() {
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!enabled || !dot || !ring) return

    const root = document.documentElement
    root.classList.add('has-cursor')
    const reduced = prefersReducedMotion()

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })
    const dotX = gsap.quickSetter(dot, 'x', 'px')
    const dotY = gsap.quickSetter(dot, 'y', 'px')
    // Um setter por eixo: 'scale' vira 'scaleX,scaleY' no quickSetter e não entra no transform.
    const dotSX = gsap.quickSetter(dot, 'scaleX')
    const dotSY = gsap.quickSetter(dot, 'scaleY')
    const ringX = gsap.quickSetter(ring, 'x', 'px')
    const ringY = gsap.quickSetter(ring, 'y', 'px')
    const ringSX = gsap.quickSetter(ring, 'scaleX')
    const ringSY = gsap.quickSetter(ring, 'scaleY')

    const rx = createSpring()
    const ry = createSpring()
    const rs = createSpring(1)
    const ds = createSpring(1)
    let mode: Mode = 'default'
    let pressed = false
    let visible = false
    let running = false

    const applyScale = () => {
      rs.target = RING_SCALE[mode] * (pressed ? 0.75 : 1)
      ds.target = DOT_SCALE[mode]
    }

    const tick = (_time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      if (reduced) {
        rx.value = rx.target
        ry.value = ry.target
        rs.value = rs.target
        ds.value = ds.target
      } else {
        stepSpring(rx, dt, FOLLOW)
        stepSpring(ry, dt, FOLLOW)
        stepSpring(rs, dt, GROW)
        stepSpring(ds, dt, GROW)
      }
      ringX(rx.value)
      ringY(ry.value)
      ringSX(rs.value)
      ringSY(rs.value)
      const d = Math.max(0, ds.value)
      dotSX(d)
      dotSY(d)
      if (springAtRest(rx, 0.05) && springAtRest(ry, 0.05) && springAtRest(rs) && springAtRest(ds)) {
        gsap.ticker.remove(tick)
        running = false
      }
    }
    const wake = () => {
      if (running) return
      running = true
      gsap.ticker.add(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dotX(e.clientX)
      dotY(e.clientY)
      rx.target = e.clientX
      ry.target = e.clientY
      if (!visible) {
        visible = true
        rx.value = e.clientX
        ry.value = e.clientY
        gsap.to([dot, ring], { opacity: 1, duration: 0.25, overwrite: 'auto' })
      }
      wake()
    }
    const onOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target.closest(interactive) : null
      const next: Mode = target ? (target.getAttribute('data-cursor') === 'drag' ? 'drag' : 'link') : 'default'
      if (next === mode) return
      mode = next
      applyScale()
      wake()
    }
    const onDown = () => {
      pressed = true
      applyScale()
      wake()
    }
    const onUp = () => {
      pressed = false
      applyScale()
      wake()
    }
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return
      visible = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.2, overwrite: 'auto' })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseout', onLeave)

    return () => {
      root.classList.remove('has-cursor')
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-0" style={{ zIndex: 'var(--z-cursor)' }}>
      <div
        ref={ringRef}
        className="absolute top-0 left-0 size-9 rounded-full will-change-transform"
        style={{ border: '1px solid var(--c-acid)' }}
      />
      <div ref={dotRef} className="absolute top-0 left-0 size-1.5 rounded-full bg-acid will-change-transform" />
    </div>
  )
}

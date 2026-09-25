import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, createSpring, springAtRest, stepSpring, tickerDt, watchVisibility, type SpringConfig } from './spring'

interface TiltOptions extends Partial<SpringConfig> {
  /** Inclinação máxima em graus no eixo X (frente e trás). */
  maxX?: number
  /** Inclinação máxima em graus no eixo Y (lados). */
  maxY?: number
  perspective?: number
  /** Camada de brilho que desliza conforme a inclinação. */
  glareRef?: RefObject<HTMLElement | null>
}

interface OrientationPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Inclinação 3D com mola. Mouse: o elemento olha pro cursor.
 * Toque: giroscópio quando permitido, senão o dedo arrastando sobre o elemento.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, options: TiltOptions = {}): void {
  const { maxX = 10, maxY = 14, perspective = 900, stiffness = 90, damping = 11, glareRef } = options

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    gsap.set(el, { transformPerspective: perspective })
    const setRX = gsap.quickSetter(el, 'rotationX', 'deg')
    const setRY = gsap.quickSetter(el, 'rotationY', 'deg')
    const glare = glareRef?.current ?? null
    const setGlareX = glare ? gsap.quickSetter(glare, 'xPercent') : null
    const setGlareO = glare ? gsap.quickSetter(glare, 'opacity') : null

    const rx = createSpring()
    const ry = createSpring()
    const config = { stiffness, damping }

    // nx, ny em [-1, 1]: onde está o ponteiro em relação ao centro do elemento.
    const aim = (nx: number, ny: number) => {
      ry.target = clamp(nx, -1, 1) * maxY
      rx.target = clamp(-ny, -1, 1) * maxX
    }
    const rest = () => aim(0, 0)

    const fromPoint = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      aim((clientX - cx) / (window.innerWidth * 0.5), (clientY - cy) / (window.innerHeight * 0.5))
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') fromPoint(e.clientX, e.clientY)
    }
    const onTouchMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') fromPoint(e.clientX, e.clientY)
    }
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) rest()
    }

    let gyro = false
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      gyro = true
      aim(e.gamma / 30, (e.beta - 45) / 30)
    }
    const Orientation = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined
    const askGyro = () => {
      Orientation?.requestPermission?.()
        .then((state) => {
          if (state === 'granted') window.addEventListener('deviceorientation', onOrientation)
        })
        .catch(() => undefined)
    }
    const onTouchEnd = () => {
      if (!gyro) rest()
    }

    const coarse = window.matchMedia('(hover: none)').matches
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseout', onLeave)
    if (coarse) {
      el.addEventListener('pointermove', onTouchMove, { passive: true })
      el.addEventListener('pointerup', onTouchEnd)
      el.addEventListener('pointercancel', onTouchEnd)
      if (Orientation?.requestPermission) el.addEventListener('click', askGyro, { once: true })
      else window.addEventListener('deviceorientation', onOrientation)
    }

    const tick = (_time: number, deltaMs: number) => {
      if (springAtRest(rx) && springAtRest(ry)) return
      const dt = tickerDt(deltaMs)
      stepSpring(rx, dt, config)
      stepSpring(ry, dt, config)
      setRX(rx.value)
      setRY(ry.value)
      if (setGlareX && setGlareO) {
        setGlareX((ry.value / maxY) * 35)
        setGlareO(0.25 + (Math.abs(ry.value) / maxY + Math.abs(rx.value) / maxX) * 0.35)
      }
    }

    let running = false
    const trigger = watchVisibility(el, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseout', onLeave)
      el.removeEventListener('pointermove', onTouchMove)
      el.removeEventListener('pointerup', onTouchEnd)
      el.removeEventListener('pointercancel', onTouchEnd)
      el.removeEventListener('click', askGyro)
      window.removeEventListener('deviceorientation', onOrientation)
      gsap.set(el, { rotationX: 0, rotationY: 0 })
    }
  }, [ref, maxX, maxY, perspective, stiffness, damping, glareRef])
}

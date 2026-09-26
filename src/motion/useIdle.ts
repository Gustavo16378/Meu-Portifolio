import { useEffect, useRef } from 'react'
import { gsap } from './gsap'

const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'scroll'] as const

/**
 * Avisa quando o usuário fica `seconds` sem mexer (mouse, toque, teclado, scroll) e quando volta a mexer.
 * O relógio só corre com `enabled`; qualquer interação zera.
 */
export function useIdle(seconds: number, onIdle: () => void, onActive: () => void, enabled = true): void {
  const idle = useRef(onIdle)
  const active = useRef(onActive)
  idle.current = onIdle
  active.current = onActive

  useEffect(() => {
    if (!enabled) return
    let isIdle = false
    const timer = gsap.delayedCall(seconds, () => {
      isIdle = true
      idle.current()
    })
    const reset = () => {
      if (isIdle) {
        isIdle = false
        active.current()
      }
      timer.restart(true)
    }
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      timer.kill()
      EVENTS.forEach((e) => window.removeEventListener(e, reset))
      if (isIdle) active.current()
    }
  }, [seconds, enabled])
}

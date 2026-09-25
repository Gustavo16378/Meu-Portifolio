import { ScrollTrigger } from './gsap'

/** Mola amortecida: integrada no gsap.ticker, dá o overshoot que um ease não dá. */
export interface Spring {
  value: number
  velocity: number
  target: number
}

export interface SpringConfig {
  /** Rigidez: quanto maior, mais rápido volta. */
  stiffness: number
  /** Amortecimento: abaixo de 2·√stiffness passa do ponto e volta. */
  damping: number
}

export function createSpring(value = 0): Spring {
  return { value, velocity: 0, target: value }
}

export function stepSpring(s: Spring, dt: number, { stiffness, damping }: SpringConfig): void {
  const accel = stiffness * (s.target - s.value) - damping * s.velocity
  s.velocity += accel * dt
  s.value += s.velocity * dt
}

export function springAtRest(s: Spring, epsilon = 0.001): boolean {
  return Math.abs(s.target - s.value) < epsilon && Math.abs(s.velocity) < epsilon
}

/** Delta do ticker em segundos, limitado pra não explodir a física depois de uma aba parada. */
export function tickerDt(deltaMs: number): number {
  return Math.min(deltaMs / 1000, 1 / 30)
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

/** Chama `onChange(true|false)` quando o elemento entra ou sai da viewport. Pra pausar loops contínuos. */
export function watchVisibility(el: Element, onChange: (visible: boolean) => void): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => onChange(self.isActive),
  })
}

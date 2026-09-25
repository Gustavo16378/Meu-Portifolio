import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { watchVisibility } from './spring'

interface BeansOptions {
  /** Faixas de x (fração da largura do container) onde os grãos podem cair. */
  lanes: [number, number][]
  /** Altura do pires, como fração da altura do container. */
  floor: number
  /** Gravidade em px/s². */
  gravity?: number
  /** Energia que sobra a cada quique. */
  restitution?: number
}

/**
 * Grãos caindo com gravidade (Physics2D) e quicando no pires, perdendo energia a cada batida.
 * Cada queda é dividida em trechos parabólicos: a duração de cada trecho sai da física,
 * então o grão toca o pires exatamente na altura certa. Os grãos são reaproveitados.
 */
export function useBeans(
  containerRef: RefObject<HTMLElement | null>,
  beansRef: RefObject<(HTMLElement | null)[]>,
  { lanes, floor, gravity = 1500, restitution = 0.42 }: BeansOptions,
): void {
  useEffect(() => {
    const container = containerRef.current
    const beans = (beansRef.current ?? []).filter((b): b is HTMLElement => b !== null)
    if (!container || beans.length === 0) return

    if (prefersReducedMotion()) {
      // Parado: alguns grãos já no pires.
      beans.forEach((b, i) => {
        const [a, z] = lanes[i % lanes.length]
        gsap.set(b, {
          x: container.offsetWidth * (a + (z - a) * ((i * 0.37) % 1)),
          y: container.offsetHeight * floor - b.offsetHeight,
          rotation: i * 47,
          opacity: 1,
        })
      })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(beans, { opacity: 0 })
    })
    const free = [...beans]
    let spawner: gsap.core.Tween | null = null

    const drop = (bean: HTMLElement) => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      const [a, z] = lanes[Math.floor(Math.random() * lanes.length)]
      const x0 = w * gsap.utils.random(a, z)
      // Nasce acima da borda de cima do palco (que recorta), pra entrar na tela já caindo.
      const stage = container.closest('[data-sticky]')
      const above = stage ? container.getBoundingClientRect().top - stage.getBoundingClientRect().top : h
      const startY = -above - gsap.utils.random(40, 160)
      const landY = h * floor - bean.offsetHeight * 0.7
      const spin = gsap.utils.random(-1, 1)

      ctx.add(() => {
        gsap.set(bean, { x: x0, y: startY, rotation: gsap.utils.random(0, 360), opacity: 1 })
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(bean, { opacity: 0 })
            free.push(bean)
          },
        })
        // Queda livre até o pires.
        const fall = Math.sqrt((2 * (landY - startY)) / gravity)
        tl.to(bean, {
          duration: fall,
          ease: 'none',
          physics2D: { velocity: 0, angle: 90, gravity },
          rotation: `+=${spin * 200}`,
        })
        // Quiques: sobe com parte da velocidade de impacto e volta pra mesma altura.
        let vy = gravity * fall
        for (let i = 0; i < 4; i++) {
          vy *= restitution
          if (vy < 70) break
          const vx = gsap.utils.random(-70, 70)
          const up = (2 * vy) / gravity
          tl.to(bean, {
            duration: up,
            ease: 'none',
            physics2D: { velocity: Math.hypot(vx, vy), angle: (Math.atan2(-vy, vx) * 180) / Math.PI, gravity },
            rotation: `+=${spin * vy * 0.4}`,
          })
        }
        // Assenta, fica um pouco e some.
        tl.to(bean, { opacity: 0, duration: 0.5, delay: 1.4, ease: 'power1.in' })
      })
    }

    const schedule = () => {
      spawner = gsap.delayedCall(gsap.utils.random(0.35, 0.8), () => {
        const bean = free.shift()
        if (bean) drop(bean)
        schedule()
      })
    }

    let running = false
    const trigger = watchVisibility(container, (visible) => {
      if (visible && !running) schedule()
      if (!visible && running) spawner?.kill()
      running = visible
    })

    return () => {
      trigger.kill()
      spawner?.kill()
      ctx.revert()
    }
  }, [containerRef, beansRef, lanes, floor, gravity, restitution])
}

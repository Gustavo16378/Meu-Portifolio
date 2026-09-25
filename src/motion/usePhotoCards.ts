import { useEffect, type RefObject } from 'react'
import { gsap, Draggable, InertiaPlugin } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { onIntroDone } from './intro'
import { clamp, createSpring, stepSpring, tickerDt, watchVisibility, type Spring } from './spring'

/** Camadas de um cartão, de fora pra dentro. Cada uma é dona de uma parte do transform. */
export interface PhotoCardEls {
  /** Espalhamento controlado pelo scroll. */
  scatter: HTMLElement
  /** Arrasto, voo e quique (x, y, rotation, scale). */
  body: HTMLElement
  /** Flutuação em repouso. */
  float: HTMLElement
  /** Sombra de cartão erguido (só opacity). */
  lift: HTMLElement
}

export interface PhotoCardConfig {
  /** Rotação de repouso em graus. */
  rotation: number
  /** Pra onde o cartão vai quando a página rola: x em vw, y em vh, rotação em graus. */
  scatter: { x: number; y: number; rotation: number }
}

type Mode = 'rest' | 'drag' | 'fly'

interface Body {
  els: PhotoCardEls
  mode: Mode
  x: number
  y: number
  r: number
  vx: number
  vy: number
  vr: number
  /** Rotação na hora de pegar, base da inclinação durante o arrasto. */
  heldR: number
  lean: Spring
  amp: number
  phase: number
  // geometria em px, relativa ao hero
  hw: number
  hh: number
  cx0: number
  cy0: number
  setX: (v: number) => void
  setY: (v: number) => void
  setR: (v: number) => void
  setFloatY: (v: number) => void
  setFloatR: (v: number) => void
}

// Física do arremesso
const FRICTION = 1.3 // decaimento exponencial da velocidade, por segundo
const GRIP = 90 // atrito constante em px/s², faz o cartão parar de vez em vez de deslizar pra sempre
const SPIN_DAMP = 2.4
const RESTITUTION = 0.62 // energia que sobra depois de bater na borda
const SPIN_ON_HIT = 0.045 // quanto a velocidade tangencial vira giro na batida
const MAX_THROW = 5200
const WALL_GAP = 6

const LEAN = { stiffness: 160, damping: 13 }

function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0
  let top = 0
  let node: HTMLElement | null = el
  while (node && node !== ancestor) {
    left += node.offsetLeft
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { left, top }
}

/**
 * Cartões de foto como objetos físicos: flutuam, são arrastados e jogados,
 * quicam nas bordas do hero, e se espalham com o scroll.
 */
export function usePhotoCards(
  heroRef: RefObject<HTMLElement | null>,
  cardsRef: RefObject<(PhotoCardEls | null)[]>,
  configs: PhotoCardConfig[],
): void {
  useEffect(() => {
    const hero = heroRef.current
    const list = cardsRef.current
    if (!hero || !list) return
    const els = list.filter((c): c is PhotoCardEls => c !== null)
    if (els.length !== configs.length) return

    if (prefersReducedMotion()) {
      let fade: gsap.core.Tween | undefined
      const ctx = gsap.context(() => {
        els.forEach((c, i) => gsap.set(c.body, { rotation: configs[i].rotation }))
        fade = gsap.fromTo(
          els.map((c) => c.body),
          { opacity: 0 },
          { opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power1.out', paused: true },
        )
      })
      const cancel = onIntroDone(() => fade?.play())
      return () => {
        cancel()
        ctx.revert()
      }
    }

    let heroW = 0
    let heroH = 0
    let zTop = els.length
    const draggables: Draggable[] = []

    const bodies: Body[] = els.map((c, i) => ({
      els: c,
      mode: 'rest',
      x: 0,
      y: 0,
      r: configs[i].rotation,
      vx: 0,
      vy: 0,
      vr: 0,
      heldR: 0,
      lean: createSpring(),
      amp: 1,
      phase: i * 2.1,
      hw: 0,
      hh: 0,
      cx0: 0,
      cy0: 0,
      setX: gsap.quickSetter(c.body, 'x', 'px') as (v: number) => void,
      setY: gsap.quickSetter(c.body, 'y', 'px') as (v: number) => void,
      setR: gsap.quickSetter(c.body, 'rotation', 'deg') as (v: number) => void,
      setFloatY: gsap.quickSetter(c.float, 'y', 'px') as (v: number) => void,
      setFloatR: gsap.quickSetter(c.float, 'rotation', 'deg') as (v: number) => void,
    }))

    const measure = () => {
      heroW = hero.offsetWidth
      heroH = hero.offsetHeight
      for (const b of bodies) {
        const { left, top } = offsetWithin(b.els.scatter, hero)
        b.hw = b.els.scatter.offsetWidth / 2
        b.hh = b.els.scatter.offsetHeight / 2
        b.cx0 = left + b.hw
        b.cy0 = top + b.hh
      }
    }

    // Limites do deslocamento (x, y) pra caixa girada do cartão caber dentro do hero.
    const limits = (b: Body) => {
      const rad = (b.r * Math.PI) / 180
      const cos = Math.abs(Math.cos(rad))
      const sin = Math.abs(Math.sin(rad))
      const ex = b.hw * cos + b.hh * sin + WALL_GAP
      const ey = b.hw * sin + b.hh * cos + WALL_GAP
      return {
        minX: ex - b.cx0,
        maxX: heroW - ex - b.cx0,
        minY: ey - b.cy0,
        maxY: heroH - ey - b.cy0,
      }
    }

    // Passou do limite enquanto arrasta: segue, mas com resistência de elástico.
    const rubber = (v: number, min: number, max: number) => {
      if (v < min) return min - (min - v) * 0.3
      if (v > max) return max + (v - max) * 0.3
      return v
    }

    const syncFromDom = (b: Body) => {
      b.x = Number(gsap.getProperty(b.els.body, 'x'))
      b.y = Number(gsap.getProperty(b.els.body, 'y'))
      b.r = Number(gsap.getProperty(b.els.body, 'rotation'))
    }

    /** Colisão num eixo. Retorna a velocidade tangencial a converter em giro (0 se não bateu). */
    const collide = (b: Body, axis: 'x' | 'y', min: number, max: number, prev: number, dt: number): number => {
      const v = axis === 'x' ? 'vx' : 'vy'
      const pos = b[axis]
      if (pos >= min && pos <= max) return 0
      const wall = pos < min ? min : max
      const outward = pos < min ? b[v] < 0 : b[v] > 0
      const cameFromInside = prev >= min - 0.5 && prev <= max + 0.5
      if (cameFromInside) {
        // Batida de verdade: espelha a posição e devolve parte da velocidade.
        b[axis] = wall - (pos - wall) * RESTITUTION
        const impact = Math.abs(b[v])
        b[v] = -b[v] * RESTITUTION
        return impact * (pos < min ? -1 : 1)
      }
      // Solto fora do limite (elástico do arrasto): volta pra dentro sem teleporte.
      b[axis] = pos + (wall - pos) * Math.min(1, dt * 16)
      if (outward) b[v] = -b[v] * RESTITUTION
      return 0
    }

    const fly = (b: Body, dt: number) => {
      const decay = Math.exp(-FRICTION * dt)
      b.vx *= decay
      b.vy *= decay
      const speed = Math.hypot(b.vx, b.vy)
      if (speed > 0) {
        const grip = Math.max(0, speed - GRIP * dt) / speed
        b.vx *= grip
        b.vy *= grip
      }
      b.vr *= Math.exp(-SPIN_DAMP * dt)

      const px = b.x
      const py = b.y
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.r += b.vr * dt

      const l = limits(b)
      const hitX = collide(b, 'x', l.minX, l.maxX, px, dt)
      const hitY = collide(b, 'y', l.minY, l.maxY, py, dt)
      // Bater de lado com velocidade vertical faz girar, e vice-versa.
      if (hitX) b.vr += Math.sign(hitX) * b.vy * SPIN_ON_HIT
      if (hitY) b.vr -= Math.sign(hitY) * b.vx * SPIN_ON_HIT

      const inside = b.x >= l.minX - 1 && b.x <= l.maxX + 1 && b.y >= l.minY - 1 && b.y <= l.maxY + 1
      if (inside && Math.hypot(b.vx, b.vy) < 10 && Math.abs(b.vr) < 3) b.mode = 'rest'

      b.setX(b.x)
      b.setY(b.y)
      b.setR(b.r)
    }

    const tick = (time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      for (const b of bodies) {
        // Flutuação some enquanto o cartão está na mão ou voando, e volta devagar.
        b.amp += ((b.mode === 'rest' ? 1 : 0) - b.amp) * Math.min(1, dt * 2.5)
        b.setFloatY(Math.sin(time * 0.9 + b.phase) * 7 * b.amp)
        b.setFloatR(Math.sin(time * 0.6 + b.phase) * 1.1 * b.amp)

        if (b.mode === 'drag') {
          // Inclina na direção do movimento, como algo pesado seguro pela ponta.
          const vx = InertiaPlugin.getVelocity(b.els.body, 'x')
          b.lean.target = b.heldR + clamp(vx * 0.009, -18, 18)
          stepSpring(b.lean, dt, LEAN)
          b.r = b.lean.value
          b.setR(b.r)
        } else if (b.mode === 'fly') {
          fly(b, dt)
        }
      }
    }

    let entrance: gsap.core.Timeline | undefined
    const ctx = gsap.context(() => {
      measure()

      // Entrada (depois do preloader): caem na mesa e assentam com um quique.
      entrance = gsap.timeline({ paused: true })
      bodies.forEach((b, i) => {
        entrance?.fromTo(
          b.els.body,
          { x: 0, y: -window.innerHeight, rotation: b.r + (i % 2 ? 28 : -22), opacity: 0 },
          {
            x: 0,
            y: 0,
            rotation: b.r,
            opacity: 1,
            duration: 1.25,
            ease: 'back.out(1.5)',
            onComplete: () => syncFromDom(b),
          },
          0.2 + i * 0.16,
        )
      })

      // Arrastar e jogar: só com mouse ou caneta.
      if (window.matchMedia('(pointer: fine)').matches) {
        bodies.forEach((b) => {
          InertiaPlugin.track(b.els.body, 'x,y')
          let d: Draggable | undefined
          ;[d] = Draggable.create(b.els.body, {
            type: 'x,y',
            minimumMovement: 1,
            cursor: 'grab',
            activeCursor: 'grabbing',
            liveSnap: {
              x: (v: number) => {
                const l = limits(b)
                return rubber(v, l.minX, l.maxX)
              },
              y: (v: number) => {
                const l = limits(b)
                return rubber(v, l.minY, l.maxY)
              },
            },
            onPress: () => {
              gsap.killTweensOf(b.els.body, 'x,y,rotation,opacity')
              gsap.set(b.els.body, { opacity: 1 })
              syncFromDom(b)
              measure()
              b.mode = 'drag'
              b.heldR = b.r
              b.lean.value = b.r
              b.lean.target = b.r
              b.lean.velocity = 0
              b.els.scatter.style.zIndex = String(++zTop)
              gsap.to(b.els.body, { scale: 1.06, duration: 0.35, ease: 'back.out(3)', overwrite: 'auto' })
              gsap.to(b.els.lift, { opacity: 1, duration: 0.3, overwrite: 'auto' })
            },
            onDrag: () => {
              if (!d) return
              b.x = d.x
              b.y = d.y
            },
            onRelease: () => {
              if (d) {
                b.x = d.x
                b.y = d.y
              }
              b.vx = clamp(InertiaPlugin.getVelocity(b.els.body, 'x'), -MAX_THROW, MAX_THROW)
              b.vy = clamp(InertiaPlugin.getVelocity(b.els.body, 'y'), -MAX_THROW, MAX_THROW)
              b.vr = b.lean.velocity * 0.35 + clamp(b.vx * 0.016, -260, 260)
              b.mode = 'fly'
              gsap.to(b.els.body, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' })
              gsap.to(b.els.lift, { opacity: 0, duration: 0.5, overwrite: 'auto' })
            },
          })
          if (d) draggables.push(d)
        })
      }

      // Scroll: os cartões ganham momento e saem da tela; voltam pelo mesmo caminho.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      bodies.forEach((b, i) => {
        const s = configs[i].scatter
        tl.to(
          b.els.scatter,
          {
            x: () => (s.x * window.innerWidth) / 100,
            y: () => (s.y * window.innerHeight) / 100,
            rotation: s.rotation,
            ease: 'power2.in',
          },
          0,
        )
      })

      let running = false
      watchVisibility(hero, (visible) => {
        if (visible && !running) gsap.ticker.add(tick)
        if (!visible && running) gsap.ticker.remove(tick)
        running = visible
      })
    }, hero)

    // Depois de redimensionar, cartões fora do hero voltam pra dentro quicando.
    const settle = gsap.delayedCall(0.15, () => {
      measure()
      for (const b of bodies) if (b.mode === 'rest') b.mode = 'fly'
    }).pause()
    const onResize = () => settle.restart(true)
    window.addEventListener('resize', onResize)

    const cancelIntro = onIntroDone(() => entrance?.play())

    return () => {
      cancelIntro()
      window.removeEventListener('resize', onResize)
      settle.kill()
      gsap.ticker.remove(tick)
      draggables.forEach((d) => d.kill())
      bodies.forEach((b) => InertiaPlugin.untrack(b.els.body))
      ctx.revert()
    }
  }, [heroRef, cardsRef, configs])
}

import { useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { useIdle } from '../motion/useIdle'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { POSES, poseSrc } from '../data/personagem'

const IDLE_SECONDS = 30
const SPEED = 110 // px por segundo
const PAUSE_BETWEEN = 3

// Seções onde ele não passa: projetos (lá só o site aparece) e contato (lá o personagem já dorme).
const QUIET = ['projetos', 'contato']

function inQuietSection(): boolean {
  const mid = window.innerHeight / 2
  return QUIET.some((id) => {
    const r = document.getElementById(id)?.getBoundingClientRect()
    return !!r && r.top < mid && r.bottom > mid
  })
}

/**
 * Depois de 30 segundos sem interação, o personagem atravessa o rodapé da tela andando,
 * vai e volta enquanto ninguém mexe, e some assim que o usuário mexe.
 */
export function IdleWalker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const bobRef = useRef<HTMLDivElement>(null)
  const walk = useRef<gsap.core.Timeline | null>(null)
  const steps = useRef<gsap.core.Tween | null>(null)
  const [dir, setDir] = useState<'direita' | 'esquerda'>('direita')

  const stop = () => {
    walk.current?.kill()
    steps.current?.kill()
    walk.current = null
    steps.current = null
    if (rootRef.current) gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.25, overwrite: true })
  }

  const start = () => {
    const root = rootRef.current
    const bob = bobRef.current
    if (!root || !bob || prefersReducedMotion() || inQuietSection()) return
    const width = root.offsetWidth || 120
    const vw = window.innerWidth
    const time = (vw + width) / SPEED
    const tl = gsap.timeline({ repeat: -1 })
    // Passada: sobe e desce a cada passo.
    steps.current = gsap.to(bob, { y: -4, duration: 0.26, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    tl.call(() => setDir('direita'))
      .set(root, { x: -width, autoAlpha: 1 })
      .to(root, { x: vw, duration: time, ease: 'none' })
      .to({}, { duration: PAUSE_BETWEEN })
      .call(() => setDir('esquerda'))
      .set(root, { x: vw })
      .to(root, { x: -width, duration: time, ease: 'none' })
      .to({}, { duration: PAUSE_BETWEEN })
    walk.current = tl
  }

  useIdle(IDLE_SECONDS, start, stop)

  const pose = dir === 'direita' ? 'andando-direita' : 'andando-esquerda'
  const [w, h] = POSES[pose]
  const src = poseSrc(pose)

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none invisible fixed bottom-0 left-0 opacity-0 will-change-transform"
      style={{ zIndex: 'var(--z-walker)' }}
    >
      <div ref={bobRef} className="will-change-transform">
        <picture>
          <source
            srcSet={`${src.webpSmall} ${Math.round((w * 220) / h)}w, ${src.webp} ${w}w`}
            sizes={`(min-width: 768px) ${Math.round((130 * w) / h)}px, ${Math.round((84 * w) / h)}px`}
            type="image/webp"
          />
          <img src={src.png} alt="" width={w} height={h} loading="lazy" decoding="async" className="block h-[84px] w-auto md:h-[130px]" />
        </picture>
      </div>
    </div>
  )
}

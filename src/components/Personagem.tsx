import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { watchVisibility } from '../motion/spring'
import { POSES, poseSrc, type Pose } from '../data/personagem'

/** Altura: sm 80 / 120, md 110 / 170, lg 140 / 220 (mobile / desktop). */
/** Altura em px de cada tamanho: [mobile, desktop], pro sizes do srcset. */
const HEIGHTS = { sm: [80, 120], md: [110, 170], lg: [140, 220] } as const

const SIZES = {
  sm: 'h-[80px] md:h-[120px]',
  md: 'h-[110px] md:h-[170px]',
  lg: 'h-[140px] md:h-[220px]',
} as const

interface PersonagemProps {
  pose: Pose
  size?: keyof typeof SIZES
  /** Tamanho diferente pra certas poses (aplicado junto com a troca da imagem). */
  sizes?: Partial<Record<Pose, keyof typeof SIZES>>
  /** Controlado por fora. Sem valor: aparece quando entra na tela. */
  show?: boolean
  /** Espera antes de entrar, em segundos. */
  delay?: number
  /** Entrada: spring (sobe com mola) ou hop (fade com quique leve). */
  enter?: 'spring' | 'hop'
  /** Balanço lento em volta dos pés (acenando). */
  sway?: boolean
  /** Espelha na horizontal. */
  flip?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * O personagem: sempre pequeno, nunca compete com o conteúdo. Entra com mola, flutua de leve em repouso
 * (pausa fora da tela), troca de pose com um tranco curto. Em reduced-motion aparece parado, só com fade.
 * Nunca intercepta clique.
 */
export function Personagem({
  pose,
  size = 'md',
  sizes,
  show,
  delay = 0,
  enter = 'spring',
  sway = false,
  flip = false,
  className = '',
  style,
}: PersonagemProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLDivElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [displayed, setDisplayed] = useState(pose)
  const visible = show ?? inView

  // Sem controle de fora: aparece a primeira vez que entra na tela.
  useEffect(() => {
    if (show !== undefined || !rootRef.current) return
    const st = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top 88%',
      once: true,
      onEnter: () => setInView(true),
    })
    return () => st.kill()
  }, [show])

  // Entrada e saída.
  useLayoutEffect(() => {
    const el = enterRef.current
    if (!el) return
    const reduced = prefersReducedMotion()
    gsap.killTweensOf(el)
    if (!visible) {
      gsap.to(el, { autoAlpha: 0, y: reduced ? 0 : 10, duration: 0.35, ease: 'power2.in' })
      return
    }
    if (reduced) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay })
    } else if (enter === 'hop') {
      gsap.fromTo(el, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, delay, ease: 'back.out(3)' })
    } else {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 40, scale: 0.6, rotation: -6 },
        { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 1, delay, ease: 'back.out(2)' },
      )
    }
  }, [visible, delay, enter])

  // Flutua (e balança, se pedido) só enquanto está na tela.
  useEffect(() => {
    const el = floatRef.current
    if (!el || prefersReducedMotion()) return
    gsap.set(el, { transformOrigin: '50% 100%' })
    const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true })
    if (sway) tl.fromTo(el, { rotation: -3, y: 0 }, { rotation: 4, y: -3, duration: 1.6, ease: 'sine.inOut' })
    else tl.to(el, { y: -4, rotation: 0.8, duration: 1.8, ease: 'sine.inOut' })
    const trigger = watchVisibility(el, (v) => (v ? tl.play() : tl.pause()))
    return () => {
      trigger.kill()
      tl.kill()
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [sway])

  // Troca de pose: encolhe, troca a imagem, volta com mola.
  useEffect(() => {
    if (pose === displayed) return
    const el = imgRef.current
    if (!el || prefersReducedMotion()) {
      setDisplayed(pose)
      return
    }
    const tween = gsap.to(el, {
      scale: 0.85,
      autoAlpha: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setDisplayed(pose),
    })
    return () => {
      tween.kill()
    }
  }, [pose, displayed])

  useLayoutEffect(() => {
    const el = imgRef.current
    if (!el || prefersReducedMotion()) return
    if (gsap.getProperty(el, 'opacity') !== 1) {
      gsap.to(el, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.4)' })
    }
  }, [displayed])

  const [w, h] = POSES[displayed]
  const shown = sizes?.[displayed] ?? size
  const src = poseSrc(displayed)

  return (
    <div ref={rootRef} aria-hidden className={`pointer-events-none select-none ${className}`} style={style}>
      <div ref={enterRef} className="invisible will-change-transform" style={{ opacity: 0 }}>
        <div ref={floatRef} className="will-change-transform">
          <div ref={imgRef} style={flip ? { scale: '-1 1' } : undefined}>
            <picture>
              <source
                srcSet={`${src.webpSmall} ${Math.round((w * 220) / h)}w, ${src.webp} ${w}w`}
                sizes={`(min-width: 768px) ${Math.round((HEIGHTS[shown][1] * w) / h)}px, ${Math.round((HEIGHTS[shown][0] * w) / h)}px`}
                type="image/webp"
              />
              <img
                src={src.png}
                alt=""
                width={w}
                height={h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`block w-auto max-w-none ${SIZES[shown]}`}
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  )
}

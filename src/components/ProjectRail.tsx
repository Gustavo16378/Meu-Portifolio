import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { glitchOnce } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { pad2 } from '../data/sections'

interface ProjectRailProps {
  current: number
  total: number
  /** Aparece enquanto o palco de projetos está preso. */
  visible: boolean
}

/** Trilho fixo na esquerda: número do projeto e uma linha que enche em lima até o último. */
export function ProjectRail({ current, total, visible }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (railRef.current) gsap.to(railRef.current, { autoAlpha: visible ? 1 : 0, duration: 0.35, overwrite: true })
  }, [visible])

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, { scaleY: (current + 1) / total, duration: 0.8, ease: 'power3.out', overwrite: true })
    }
    // Troca de projeto: o número dá um tranco de lado e assenta.
    if (numRef.current && !prefersReducedMotion()) glitchOnce(numRef.current)
  }, [current, total])

  // No celular o trilho fica na metade de baixo, ao lado do texto: centralizado, ele caía sobre a borda dos prints
  // largos (Stewer e AUTORIA). No desktop continua no meio da tela.
  return (
    <div
      ref={railRef}
      aria-hidden
      className="pointer-events-none invisible fixed top-[54svh] flex flex-col md:top-1/2 md:-translate-y-1/2 items-center gap-3 font-mono text-[10px] text-muted opacity-0 md:gap-4 md:text-[11px]"
      style={{ left: 'calc(env(safe-area-inset-left) + 12px)', zIndex: 'var(--z-hud)' }}
    >
      <p className="flex flex-col items-center leading-tight md:flex-row md:gap-1">
        <span ref={numRef} className="inline-block text-acid">
          {pad2(current + 1)}
        </span>
        <span className="hidden md:inline">/</span>
        <span>{pad2(total)}</span>
      </p>
      <span className="relative block h-[22svh] w-px bg-border md:h-[30svh]">
        <span ref={fillRef} className="absolute inset-0 block origin-top scale-y-0 bg-acid" />
      </span>
    </div>
  )
}

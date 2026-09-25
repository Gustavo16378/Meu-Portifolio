import { useEffect, useRef, useState, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { glitchOnce } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { pad2 } from '../data/sections'

interface ProjectRailProps {
  sectionRef: RefObject<HTMLElement | null>
  total: number
}

/** Trilho fixo na esquerda, só dentro da seção de projetos: número do projeto e uma linha que enche em lima. */
export function ProjectRail({ sectionRef, total }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const rail = railRef.current
    const fill = fillRef.current
    if (!section || !rail || !fill) return

    const ctx = gsap.context(() => {
      gsap.set(rail, { opacity: 0 })
      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => gsap.to(rail, { opacity: self.isActive ? 1 : 0, duration: 0.35, overwrite: true }),
      })

      gsap.fromTo(
        fill,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 50%', end: 'bottom 50%', scrub: true } },
      )

      section.querySelectorAll<HTMLElement>('[data-project-index]').forEach((scene) => {
        const i = Number(scene.dataset.projectIndex)
        ScrollTrigger.create({
          trigger: scene,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setCurrent(i)
          },
        })
      })
    })
    return () => ctx.revert()
  }, [sectionRef])

  // Troca de projeto: o número dá um tranco de lado e assenta.
  useEffect(() => {
    if (numRef.current && !prefersReducedMotion()) glitchOnce(numRef.current)
  }, [current])

  return (
    <div
      ref={railRef}
      aria-hidden
      className="pointer-events-none fixed top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 font-mono text-[10px] text-muted md:gap-4 md:text-[11px]"
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
        <span ref={fillRef} className="absolute inset-0 block origin-top bg-acid" />
      </span>
    </div>
  )
}

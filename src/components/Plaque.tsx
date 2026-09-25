import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { useMagnetic } from '../motion/useMagnetic'
import { useScrollSkew } from '../motion/useScrollSkew'
import { prefersReducedMotion } from '../motion/reducedMotion'
import type { Project } from '../data/projects'

interface PlaqueProps {
  project: Project
  onSheet: () => void
  /** Cena sem quique: entrada e skew sem passar do ponto. */
  calm?: boolean
  className?: string
}

/** Placa do projeto: nome, ano, tipo, uma linha, stack e os dois links. Nada de texto de conceito. */
export function Plaque({ project, onSheet, calm = false, className = '' }: PlaqueProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const liveRef = useRef<HTMLAnchorElement>(null)
  const sheetRef = useRef<HTMLButtonElement>(null)

  useScrollSkew(titleRef, calm ? { stiffness: 60, damping: 16 } : { stiffness: 120, damping: 9 })
  useMagnetic(liveRef, { strength: 0.3 })
  useMagnetic(sheetRef, { strength: 0.3 })

  // Linhas entram em sequência, com mola, quando a placa chega.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.from(root.children, {
        y: reduced ? 0 : 40,
        opacity: 0,
        duration: reduced ? 0.5 : 0.9,
        stagger: 0.07,
        ease: reduced || calm ? 'power2.out' : 'back.out(1.6)',
        scrollTrigger: { trigger: root, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
    }, root)
    return () => ctx.revert()
  }, [calm])

  return (
    <div ref={rootRef} className={className}>
      <p className="font-mono text-[11px] text-muted md:text-xs">
        <span style={{ color: 'var(--accent)' }}>{project.year}</span> · {project.kind}
      </p>
      <h3
        ref={titleRef}
        className="mt-4 origin-left font-display text-[17vw] leading-[0.84] uppercase will-change-transform md:text-[min(6.4vw,13svh)]"
      >
        {project.name}
      </h3>
      <p className="mt-5 max-w-[26rem] text-lg leading-snug text-bone md:text-xl">{project.line}</p>
      <p className="mt-3 font-mono text-[11px] text-muted md:text-xs">{project.stack.join(' · ')}</p>
      <div className="mt-8 flex items-center gap-8 font-mono text-xs md:text-sm">
        <a
          ref={liveRef}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="-m-3 inline-block p-3"
          style={{ color: 'var(--accent)' }}
        >
          ver no ar ↗
        </a>
        <button ref={sheetRef} type="button" onClick={onSheet} className="-m-3 p-3 text-bone">
          ficha técnica
        </button>
      </div>
    </div>
  )
}

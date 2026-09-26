import { useRef, type Ref } from 'react'
import { useMagnetic } from '../motion/useMagnetic'
import type { Project } from '../data/projects'

interface PlaqueProps {
  project: Project
  onSheet: () => void
  /** Só nome e links, sobre o print (Monte Vinhedo). */
  overlay?: boolean
  /** Sombra no texto pra ler por cima do print. */
  shadow?: boolean
  /** Centralizado (Torra). */
  center?: boolean
  /** Só com mídia em vídeo e aparelho que mostra poster: botão pra tocar mesmo assim. */
  onMotion?: () => void
  blockRef?: Ref<HTMLDivElement>
  className?: string
}

/**
 * Texto do projeto. Cada filho direto entra e sai em stagger (controlado pelo palco da seção).
 * Os dois links são botões de verdade: 44px de altura, magnéticos.
 */
export function Plaque({ project, onSheet, overlay = false, shadow = false, center = false, onMotion, blockRef, className = '' }: PlaqueProps) {
  const liveRef = useRef<HTMLAnchorElement>(null)
  const sheetRef = useRef<HTMLButtonElement>(null)
  useMagnetic(liveRef)
  useMagnetic(sheetRef)

  const textShadow = shadow ? { textShadow: 'var(--shadow-text)' } : undefined

  return (
    <div ref={blockRef} className={className}>
      {!overlay && (
        <p className="font-mono text-[11px] text-muted md:text-xs" style={textShadow}>
          <span style={{ color: 'var(--accent)' }}>{project.year}</span> · {project.kind}
        </p>
      )}
      <h3
        className={`font-display leading-[0.84] uppercase ${
          overlay ? 'text-[11vw] md:text-[min(5.2vw,11svh)]' : 'mt-2 text-[11vw] md:mt-4 md:text-[min(4.6vw,9.5svh)]'
        }`}
        style={textShadow}
      >
        {project.name}
      </h3>
      {!overlay && (
        <p className="mt-2 text-base leading-snug text-bone md:mt-5 md:text-lg" style={textShadow}>
          {project.line}
        </p>
      )}
      {!overlay && (
        <p className="mt-2 font-mono text-[11px] text-muted md:mt-3 md:text-xs" style={textShadow}>
          {project.stack.join(' · ')}
        </p>
      )}
      <div className={`mt-4 flex flex-wrap items-center gap-3 font-mono text-xs md:mt-7 md:text-sm ${center ? 'justify-center' : ''}`}>
        <a
          ref={liveRef}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-[3px] px-5 font-bold text-bg"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          ver no ar <span aria-hidden>↗</span>
        </a>
        <button
          ref={sheetRef}
          type="button"
          onClick={onSheet}
          className="inline-flex min-h-11 items-center rounded-[3px] px-5 text-bone"
          style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--button-ghost)' }}
        >
          ficha técnica
        </button>
        {onMotion && (
          <button type="button" onClick={onMotion} className="inline-flex min-h-11 items-center px-2 text-muted underline underline-offset-4">
            ver em movimento
          </button>
        )}
      </div>
    </div>
  )
}

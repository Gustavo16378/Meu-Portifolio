import { useRef, type Ref } from 'react'
import { useMagnetic } from '../motion/useMagnetic'
import type { Project } from '../data/projects'

interface PlaqueProps {
  project: Project
  onSheet: () => void
  /** full: tudo; overlay: só nome e links, sobre o vídeo (Monte Vinhedo). */
  variant?: 'full' | 'overlay'
  /** Centralizado (Torra). */
  center?: boolean
  /** Quando o aparelho só mostra poster: botão pra tocar o vídeo mesmo assim. */
  onMotion?: () => void
  blockRef?: Ref<HTMLDivElement>
  className?: string
}

/**
 * Texto do projeto. Cada filho direto entra e sai em stagger (controlado pelo palco da seção);
 * a placa em si não tem física, só os links magnéticos.
 */
export function Plaque({ project, onSheet, variant = 'full', center = false, onMotion, blockRef, className = '' }: PlaqueProps) {
  const liveRef = useRef<HTMLAnchorElement>(null)
  const sheetRef = useRef<HTMLButtonElement>(null)
  useMagnetic(liveRef, { strength: 0.3 })
  useMagnetic(sheetRef, { strength: 0.3 })

  const overlay = variant === 'overlay'
  const shadow = overlay ? { textShadow: 'var(--shadow-text)' } : undefined

  return (
    <div ref={blockRef} className={className} style={shadow}>
      {!overlay && (
        <p className="font-mono text-[11px] text-muted md:text-xs">
          <span style={{ color: 'var(--accent)' }}>{project.year}</span> · {project.kind}
        </p>
      )}
      <h3
        className={`font-display leading-[0.84] uppercase ${
          overlay ? 'text-[12vw] md:text-[min(5.2vw,11svh)]' : 'mt-3 text-[12vw] md:mt-4 md:text-[min(4.6vw,9.5svh)]'
        }`}
      >
        {project.name}
      </h3>
      {!overlay && <p className="mt-3 text-base leading-snug text-bone md:mt-5 md:text-lg">{project.line}</p>}
      {!overlay && <p className="mt-3 font-mono text-[11px] text-muted md:text-xs">{project.stack.join(' · ')}</p>}
      <div
        className={`mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-xs md:mt-7 md:text-sm ${
          center ? 'md:justify-center' : ''
        }`}
      >
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
        {onMotion && (
          <button type="button" onClick={onMotion} className="-m-3 p-3 text-muted">
            ver em movimento
          </button>
        )}
      </div>
    </div>
  )
}

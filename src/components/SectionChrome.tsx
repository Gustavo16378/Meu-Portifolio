import { pad2, sectionIndex, sections, type SectionId } from '../data/sections'
import { GridBackdrop } from './GridBackdrop'

interface SectionChromeProps {
  id: SectionId
  /** Grade de fundo (o hero e o contato já têm a própria). */
  grid?: boolean
  /** Divisória no topo (não vai na primeira seção). */
  divider?: boolean
  /** Lado do número gigante. */
  side?: 'left' | 'right'
}

/**
 * Camadas comuns às seções: grade de fundo, número da seção em Tanker gigante só em contorno (apagado, no canto),
 * divisória de 1px no topo com o nome da seção no meio, e metadados em mono no rodapé.
 * A seção precisa ser `relative` e cortar o que sobra na horizontal.
 */
export function SectionChrome({ id, grid = true, divider = true, side = 'right' }: SectionChromeProps) {
  const i = sectionIndex(id)
  const info = sections[i]
  const n = pad2(i + 1)
  return (
    <>
      {grid && <GridBackdrop className="-z-10" />}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-[4svh] -z-10 font-display text-[42vw] leading-[0.8] select-none md:top-[6svh] md:text-[22vw] ${
          side === 'right' ? 'right-[-2vw]' : 'left-[-2vw]'
        }`}
        style={{ color: 'transparent', WebkitTextStroke: '1px var(--mark-stroke)' }}
      >
        {n}
      </span>
      {divider && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 px-6 md:px-12">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[11px] text-muted md:text-xs">
            {n} · {info.label}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
      )}
      {/* No celular só número e nome, numa linha (o resto não cabe e invadia o conteúdo); os metadados entram no desktop. */}
      <p
        aria-hidden
        className="pointer-events-none absolute right-4 bottom-[72px] left-6 text-right font-mono text-[11px] text-muted md:right-12 md:bottom-[84px] md:left-auto md:text-xs"
      >
        {`${n} / ${pad2(sections.length)} · ${info.label}`}
        {info.meta.length > 0 && <span className="hidden md:inline">{` · ${info.meta.join(' · ')}`}</span>}
      </p>
    </>
  )
}

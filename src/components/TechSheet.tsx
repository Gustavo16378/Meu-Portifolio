import { useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useMagnetic } from '../motion/useMagnetic'
import type { Project } from '../data/projects'
import { pad2 } from '../data/sections'
import { useDialog } from './useDialog'

interface TechSheetProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

type AccentStyle = CSSProperties & Record<'--accent', string>

/** Ficha técnica em painel lateral: mesma mecânica do menu (portal, overlay, Esc e clique fora). */
export function TechSheet({ project, open, onClose }: TechSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useDialog(open, onClose, panelRef, closeRef)
  useMagnetic(closeRef, { enabled: open })

  // Blocos entram um a um, deslizando da borda com mola.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || !open) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        body.children,
        { x: reduced ? 0 : 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: reduced ? 0.4 : 0.9,
          stagger: 0.06,
          delay: 0.12,
          ease: reduced ? 'power1.out' : 'back.out(1.5)',
        },
      )
    }, body)
    return () => ctx.revert()
  }, [open, project])

  const sheet = project?.sheet
  const style: AccentStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'min(520px, 100vw)',
    zIndex: 'var(--z-panel)',
    opacity: open ? 1 : 0,
    transform: open ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
    pointerEvents: open ? 'auto' : 'none',
    backgroundColor: 'var(--c-surface)',
    borderLeft: '1px solid var(--c-border)',
    '--accent': project?.accent ?? 'var(--c-acid)',
  }

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="transition-[opacity] duration-500"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-overlay)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          backgroundColor: 'var(--overlay-soft)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={project ? `Ficha técnica de ${project.name}` : 'Ficha técnica'}
        aria-hidden={!open}
        data-lenis-prevent
        className="overflow-y-auto overscroll-contain transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={style}
      >
        <div className="flex items-center justify-between px-5 pt-5 font-mono text-[10px] text-muted md:px-8 md:pt-7 md:text-[11px]">
          <span>ficha técnica</span>
          <button ref={closeRef} type="button" onClick={onClose} className="-m-3 p-3 text-bone">
            fechar
          </button>
        </div>

        {project && (
          <div ref={bodyRef} className="flex flex-col gap-9 px-5 pt-8 pb-12 md:px-8 md:pt-10">
            <div>
              <h2 className="font-display text-[13vw] leading-[0.86] uppercase md:text-6xl">{project.name}</h2>
              <p className="mt-3 font-mono text-[11px] text-muted md:text-xs">{project.stack.join(' · ')}</p>
            </div>

            {sheet && (
              <section>
                <h3 className="font-mono text-[11px] text-muted md:text-xs">arquitetura</h3>
                <p className="mt-3 leading-snug text-bone md:text-lg">{sheet.architecture}</p>
              </section>
            )}

            {sheet && (
              <section>
                <h3 className="font-mono text-[11px] text-muted md:text-xs">decisões</h3>
                <ol className="mt-3 flex flex-col gap-4">
                  {sheet.decisions.map((d, i) => (
                    <li key={d} className="flex gap-4 text-base leading-snug text-bone md:text-[17px]">
                      <span className="pt-[0.2em] font-mono text-[11px] md:text-xs" style={{ color: 'var(--accent)' }}>
                        {pad2(i + 1)}
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section>
              <h3 className="font-mono text-[11px] text-muted md:text-xs">links</h3>
              <div className="mt-3 flex flex-col gap-2 font-mono text-xs md:text-sm">
                {sheet && (
                  <p>
                    <a href={sheet.repo.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                      {sheet.repo.label} ↗
                    </a>
                    {sheet.repoNote && <span className="text-muted"> · {sheet.repoNote}</span>}
                  </p>
                )}
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {project.url.replace('https://', '')} ↗
                </a>
              </div>
            </section>
          </div>
        )}
      </aside>
    </>,
    document.body,
  )
}

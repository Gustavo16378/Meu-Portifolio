import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useMagnetic } from '../motion/useMagnetic'
import { stackGroups } from '../data/stack'
import { timeline } from '../data/timeline'
import { contact, cvs, social } from '../data/contact'
import { useDialog } from './useDialog'

interface RecruiterPanelProps {
  open: boolean
  onClose: () => void
}

const links = social.filter((s) => s.label === 'github' || s.label === 'linkedin')

/** Painel do recrutador: o essencial em 30 segundos. Mesma mecânica da ficha técnica. */
export function RecruiterPanel({ open, onClose }: RecruiterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const cvPtRef = useRef<HTMLAnchorElement>(null)
  const cvEnRef = useRef<HTMLAnchorElement>(null)
  const cvRefs = [cvPtRef, cvEnRef]

  useDialog(open, onClose, panelRef, closeRef)
  useMagnetic(closeRef, { enabled: open })
  useMagnetic(cvPtRef, { enabled: open })
  useMagnetic(cvEnRef, { enabled: open })

  // Blocos entram um a um, deslizando da borda.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || !open) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        body.children,
        { x: reduced ? 0 : 24, opacity: 0 },
        { x: 0, opacity: 1, duration: reduced ? 0.4 : 0.9, stagger: 0.06, delay: 0.12, ease: reduced ? 'power1.out' : 'back.out(1.5)' },
      )
    }, body)
    return () => ctx.revert()
  }, [open])

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
        aria-label="Resumo pra recrutador"
        aria-hidden={!open}
        data-lenis-prevent
        className="overflow-y-auto overscroll-contain transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
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
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 font-mono text-[10px] text-muted md:px-8 md:pt-7 md:text-[11px]">
          <span>recrutador</span>
          <button ref={closeRef} type="button" onClick={onClose} className="-my-3 -mr-3 inline-flex min-h-11 items-center px-3 text-bone">
            fechar
          </button>
        </div>

        <div ref={bodyRef} className="flex flex-col gap-9 px-5 pt-8 pb-12 md:px-8 md:pt-10">
          <div>
            <h2 className="font-display text-[13vw] leading-[0.86] uppercase md:text-6xl">Gustavo Barbosa Lima</h2>
            <p className="mt-4 leading-snug text-bone md:text-lg">
              Desenvolvedor full-stack em Palmas, TO. Faço sites, sistemas e APIs, do front ao deploy.
            </p>
          </div>

          <section>
            <h3 className="font-mono text-[11px] text-muted md:text-xs">stack</h3>
            <dl className="mt-3 grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 font-mono text-xs md:text-sm">
              {stackGroups.map((g) => (
                <div key={g.label} className="contents">
                  <dt className="text-acid">{g.label}</dt>
                  <dd className="text-bone">{g.items.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="font-mono text-[11px] text-muted md:text-xs">experiência</h3>
            <ol className="mt-3 flex flex-col gap-2 font-mono text-xs md:text-sm">
              {timeline.map((t) => (
                <li key={t.when}>
                  <span className="text-acid">{t.when}</span> <span className="text-muted">·</span>{' '}
                  <span className="text-bone">{t.what}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="font-mono text-[11px] text-muted md:text-xs">contato</h3>
            <div className="mt-1 flex flex-col font-mono text-xs md:text-sm">
              {links.map((l) => (
                <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-fit items-center gap-1 text-acid">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ))}
              <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-fit items-center gap-1 text-bone">
                {contact.whatsappDisplay} <span aria-hidden>↗</span>
              </a>
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 w-fit items-center text-bone">
                {contact.email}
              </a>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            {cvs.map((cv, i) => (
              <a
                key={cv.href}
                ref={cvRefs[i]}
                href={cv.href}
                hrefLang={cv.lang}
                type="application/pdf"
                download
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[3px] bg-acid px-5 font-mono text-xs font-bold text-bg md:text-sm"
              >
                {cv.label} <span className="sr-only">em PDF, {cv.language}</span>
                <span aria-hidden>↓</span>
              </a>
            ))}
          </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[3px] font-mono text-xs text-bone md:hidden"
          style={{ border: '1px solid var(--c-border)' }}
        >
          fechar
        </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}

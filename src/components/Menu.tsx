import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useMagnetic } from '../motion/useMagnetic'
import { pad2, sectionIndex, type SectionId } from '../data/sections'
import { useDialog } from './useDialog'

interface MenuItemData {
  id: SectionId
  label: string
}

const items: MenuItemData[] = [
  { id: 'projetos', label: 'projetos' },
  { id: 'processo', label: 'como funciona' },
  { id: 'historia', label: 'história' },
  { id: 'contato', label: 'contato' },
]

interface MenuProps {
  open: boolean
  onClose: () => void
  onNavigate: (id: SectionId) => void
  onRecruiter: () => void
}

function MenuItem({ item, open, onNavigate }: { item: MenuItemData; open: boolean; onNavigate: (id: SectionId) => void }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, { enabled: open })

  return (
    <a
      ref={ref}
      href={`#${item.id}`}
      onClick={(e) => {
        e.preventDefault()
        onNavigate(item.id)
      }}
      className="group flex items-start gap-3 md:gap-5"
    >
      <span className="pt-[0.9em] font-mono text-[11px] text-muted md:text-xs">{pad2(sectionIndex(item.id) + 1)}</span>
      <span className="relative block font-display text-[min(14vw,12svh)] leading-[0.95] uppercase md:text-[min(10vw,15svh)]">
        <span className="block text-bone transition-[opacity] duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
          {item.label}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block text-acid opacity-0 transition-[opacity] duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      </span>
    </a>
  )
}

/** Menu em tela cheia. Fica sempre no DOM; fechado é opacity 0 sem eventos. */
export function Menu({ open, onClose, onNavigate, onRecruiter }: MenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const recruiterRef = useRef<HTMLButtonElement>(null)

  useMagnetic(closeRef, { enabled: open })
  useMagnetic(recruiterRef, { enabled: open })

  useDialog(open, onClose, panelRef, closeRef)

  // Itens caem no lugar com mola ao abrir e sobem rápido ao fechar.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.children)
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.to(rows, { opacity: open ? 1 : 0, duration: 0.3 })
        return
      }
      if (open) {
        gsap.fromTo(
          rows,
          { yPercent: -90, rotation: () => gsap.utils.random(-7, 7), opacity: 0 },
          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'back.out(1.8)',
            stagger: 0.06,
            delay: 0.05,
            overwrite: true,
          },
        )
      } else {
        gsap.to(rows, { yPercent: -40, opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.03, overwrite: true })
      }
    }, list)
    return () => ctx.kill()
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
          backgroundColor: 'var(--overlay)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className="transition-[opacity] duration-300"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-panel)',
          opacity: open ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <div
          className="absolute flex items-center justify-between font-mono text-[10px] text-muted md:text-[11px]"
          style={{
            top: 'calc(env(safe-area-inset-top) + 16px)',
            left: 'calc(env(safe-area-inset-left) + 16px)',
            right: 'calc(env(safe-area-inset-right) + 16px)',
          }}
        >
          <span>menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="-my-3 -mr-3 inline-flex min-h-11 items-center px-3 text-bone"
            style={{ pointerEvents: open ? 'auto' : 'none' }}
          >
            fechar
          </button>
        </div>

        <nav className="absolute inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-12">
          <ul ref={listRef} className="flex flex-col gap-2 md:gap-3" style={{ pointerEvents: 'none' }}>
            {items.map((item) => (
              <li key={item.id} className="w-fit" style={{ pointerEvents: open ? 'auto' : 'none' }}>
                <MenuItem item={item} open={open} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="absolute"
          style={{ left: 'calc(env(safe-area-inset-left) + 16px)', bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        >
          <button
            ref={recruiterRef}
            type="button"
            onClick={onRecruiter}
            className="-m-3 inline-flex min-h-11 items-center p-3 font-mono text-xs text-acid md:text-sm"
            style={{ pointerEvents: open ? 'auto' : 'none' }}
          >
            recrutador?
          </button>
        </div>

        {/* No celular, fechar também embaixo, onde o polegar chega. */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -m-3 inline-flex min-h-11 items-center p-3 font-mono text-xs text-bone md:hidden"
          style={{
            right: 'calc(env(safe-area-inset-right) + 16px)',
            bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          fechar
        </button>
      </div>
    </>,
    document.body,
  )
}

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useMagnetic } from '../motion/useMagnetic'
import { navigateTo } from '../motion/navigate'
import { pad2, sections } from '../data/sections'

const clockFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Araguaina',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const edge = {
  top: 'calc(env(safe-area-inset-top) + 16px)',
  bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
  left: 'calc(env(safe-area-inset-left) + 16px)',
  right: 'calc(env(safe-area-inset-right) + 16px)',
}

interface HudProps {
  /** As seções abaixo do hero montam depois: refaz os triggers de seção atual quando chegam. */
  sectionsReady: boolean
  menuOpen: boolean
  onMenu: () => void
  onRecruiter: () => void
}

export function Hud({ menuOpen, onMenu, onRecruiter, sectionsReady }: HudProps) {
  const clockRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const recruiterRef = useRef<HTMLButtonElement>(null)
  useMagnetic(menuRef)
  useMagnetic(recruiterRef)
  const [active, setActive] = useState(0)

  // Hora de Palmas: escreve direto no DOM quando o segundo muda, dentro do ticker do GSAP.
  useEffect(() => {
    let last = ''
    const tick = () => {
      const now = clockFormat.format(Date.now())
      if (now !== last && clockRef.current) {
        clockRef.current.textContent = now
        last = now
      }
    }
    tick()
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  // Seção atual: a que cruza o meio da tela.
  useEffect(() => {
    const ctx = gsap.context(() => {
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActive(i)
          },
        })
      })
    })
    return () => ctx.revert()
  }, [sectionsReady])

  const current = sections[active]

  return (
    <div
      className="pointer-events-none fixed inset-0 font-mono text-[10px] leading-[1.5] tracking-[0.04em] text-muted select-none md:text-[11px]"
      style={{ zIndex: 'var(--z-hud)' }}
    >
      {/* Faixas atrás dos cantos: o conteúdo que passa por baixo desfoca e escurece, e o HUD continua legível. */}
      <div aria-hidden className="hud-band absolute inset-x-0 top-0 h-[76px] md:h-[84px]" />
      <div aria-hidden className="hud-band hud-band-bottom absolute inset-x-0 bottom-0 h-[56px] md:h-[64px]" />

      {/* Nome: volta pro topo. */}
      <button
        type="button"
        onClick={() => {
          const top = document.getElementById('abertura')
          if (top) navigateTo(top)
        }}
        className="pointer-events-auto absolute -m-2 p-2 text-left"
        style={{ top: edge.top, left: edge.left }}
      >
        <span className="block text-bone">GUSTAVO BARBOSA LIMA</span>
        <span className="block">full-stack · palmas, to</span>
        <span className="sr-only">, voltar pro topo</span>
      </button>

      <div className="absolute flex items-center gap-6" style={{ top: edge.top, right: edge.right }}>
        <button
          ref={recruiterRef}
          type="button"
          onClick={onRecruiter}
          className="pointer-events-auto -my-2 hidden rounded-[3px] px-3 py-2 text-acid md:block"
          style={{ border: '1px solid var(--c-acid)' }}
        >
          recrutador?
        </button>
        <div className="hidden text-right md:block">
          <p>
            <span ref={clockRef} className="text-bone tabular-nums" /> brt
          </p>
          <p>10°10'S 48°20'W</p>
        </div>
        <button
          ref={menuRef}
          type="button"
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className="pointer-events-auto -my-2 flex items-center gap-2 rounded-[3px] px-3 py-2 text-bone"
          style={{ border: '1px solid var(--hud-edge)' }}
        >
          <span aria-hidden className="inline-block size-1.5 bg-acid" />
          menu
        </button>
      </div>

      <div className="absolute" style={{ bottom: edge.bottom, left: edge.left }} aria-live="polite">
        <p>
          <span className="text-acid">{pad2(active + 1)}</span> / {pad2(sections.length)} · {current.label}
        </p>
      </div>

      <div className="absolute hidden items-center gap-2 md:flex" style={{ bottom: edge.bottom, right: edge.right }}>
        <span className="hud-dot inline-block size-1.5 rounded-full bg-acid" aria-hidden />
        <p>status: disponível para projetos</p>
      </div>
    </div>
  )
}

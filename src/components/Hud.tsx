import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'
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

export function Hud() {
  const clockRef = useRef<HTMLSpanElement>(null)
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
  }, [])

  const current = sections[active]

  return (
    <div
      className="pointer-events-none fixed inset-0 font-mono text-[10px] leading-[1.5] tracking-[0.04em] text-muted select-none md:text-[11px]"
      style={{ zIndex: 'var(--z-hud)' }}
    >
      <div className="absolute" style={{ top: edge.top, left: edge.left }}>
        <p className="text-bone">GUSTAVO BARBOSA LIMA</p>
        <p>full-stack · palmas, to</p>
      </div>

      <div className="absolute hidden text-right md:block" style={{ top: edge.top, right: edge.right }}>
        <p>
          <span ref={clockRef} className="text-bone tabular-nums" /> brt
        </p>
        <p>10°10'S 48°20'W</p>
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

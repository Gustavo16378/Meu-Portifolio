import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText } from '../motion/gsap'
import { addGlitchIn } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { watchVisibility } from '../motion/spring'
import { useScrollSkew } from '../motion/useScrollSkew'
import { Personagem } from './Personagem'
import { SectionChrome } from './SectionChrome'

type NodeId = 'tela' | 'api' | 'banco' | 'deploy'

// Blocos do diagrama, na ordem em que a requisição passa. Posição em % do quadro (proporção 4:5).
const NODES: { id: NodeId; label: string; sub: string; x: number; y: number }[] = [
  { id: 'tela', label: 'tela', sub: 'react · typescript', x: 26, y: 12 },
  { id: 'api', label: 'API', sub: 'java · quarkus · node', x: 74, y: 37 },
  { id: 'banco', label: 'banco', sub: 'postgresql', x: 26, y: 63 },
  { id: 'deploy', label: 'deploy', sub: 'cloudflare · docker', x: 74, y: 88 },
]

// Cada parágrafo acende os blocos do que ele fala.
const paragraphs: { text: string; lights: NodeId[] }[] = [
  {
    text: 'Eu desenho e construo cada site do zero. Não uso template: layout, animação e código saem pensados pra aquele projeto.',
    lights: ['tela'],
  },
  {
    text: 'O trabalho não para na tela. Faço o back-end, a API e o banco de dados que ficam por trás dela.',
    lights: ['api', 'banco'],
  },
  {
    text: 'E coloco no ar: domínio, hospedagem, SEO e o acompanhamento depois da entrega.',
    lights: ['deploy'],
  },
]

const PULSE_LOOP = 3 // segundos pra requisição ir da tela ao deploy

/** Diagrama em mono: quatro blocos ligados por linhas de 1px e um pulso lima que passa por eles em loop. */
function Diagram({ lit }: { lit: Set<NodeId> }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLSpanElement>(null)
  const floatRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const box = boxRef.current
    const pulse = pulseRef.current
    if (!box || !pulse || prefersReducedMotion()) return

    let tl: gsap.core.Timeline | undefined
    let floats: gsap.core.Tween[] = []
    let visible = false
    // Monta de novo quando o quadro muda de tamanho (o caminho é em px).
    const build = () => {
      tl?.kill()
      floats.forEach((f) => f.kill())
      const w = box.clientWidth
      const h = box.clientHeight
      const pts = NODES.map((n) => ({ x: (n.x / 100) * w, y: (n.y / 100) * h }))
      tl = gsap.timeline({ repeat: -1, paused: !visible })
      tl.set(pulse, { x: pts[0].x, y: pts[0].y, opacity: 0 })
        .to(pulse, { opacity: 1, duration: 0.15 })
      const step = (PULSE_LOOP - 0.3) / (pts.length - 1)
      for (let i = 1; i < pts.length; i++) tl.to(pulse, { x: pts[i].x, y: pts[i].y, duration: step, ease: 'power1.inOut' })
      tl.to(pulse, { opacity: 0, duration: 0.15 })
      // Flutuação leve dos blocos, cada um num tempo.
      floats = floatRefs.current
        .filter((el): el is HTMLDivElement => el !== null)
        .map((el, i) =>
          gsap.to(el, { y: -3, duration: 2.2 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: !visible }),
        )
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(box)
    const trigger = watchVisibility(box, (v) => {
      visible = v
      ;[tl, ...floats].forEach((a) => (v ? a?.play() : a?.pause()))
    })
    return () => {
      ro.disconnect()
      trigger.kill()
      tl?.kill()
      floats.forEach((f) => f.kill())
    }
  }, [])

  const path = NODES.map((n) => `${n.x},${n.y * 1.25}`).join(' ')

  return (
    <div ref={boxRef} className="relative mx-auto aspect-[4/5] w-[66vw] max-w-[440px] md:w-full">
      <svg viewBox="0 0 100 125" aria-hidden className="absolute inset-0 size-full overflow-visible">
        <polyline
          points={path}
          fill="none"
          stroke="var(--c-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        ref={pulseRef}
        aria-hidden
        className="absolute top-0 left-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid opacity-0 will-change-transform"
        style={{ boxShadow: 'var(--pulse-glow)' }}
      />
      {NODES.map((n, i) => {
        const on = lit.has(n.id)
        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div
              ref={(el) => {
                floatRefs.current[i] = el
              }}
              className={`rounded-[3px] border bg-bg px-3 py-2 font-mono whitespace-nowrap transition-[border-color,background-color,color] duration-500 md:px-4 md:py-3 ${
                on ? 'border-acid bg-[var(--row-hover)] text-acid' : 'border-border text-muted'
              }`}
            >
              <p className="text-sm uppercase md:text-base">{n.label}</p>
              <p className={`text-[10px] md:text-[11px] ${on ? 'text-bone' : 'text-muted'}`}>{n.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Seção 02. Título e os três parágrafos à esquerda, diagrama à direita (preso enquanto os parágrafos passam).
 * Cada parágrafo, quando entra, acende o bloco do que ele fala. Em reduced-motion, tudo aceso e parado.
 */
export function Manifesto() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState<Set<NodeId>>(() => new Set(prefersReducedMotion() ? NODES.map((n) => n.id) : []))

  useScrollSkew(titleRef, { stiffness: 110, damping: 8 })

  useEffect(() => {
    const title = titleRef.current
    const text = textRef.current
    if (!title || !text) return

    const mm = gsap.matchMedia()
    mm.add(
      { reduced: '(prefers-reduced-motion: reduce)', full: '(prefers-reduced-motion: no-preference)' },
      (ctx) => {
        const reduced = Boolean(ctx.conditions?.reduced)
        let alive = true

        gsap.from(title, {
          yPercent: reduced ? 0 : 40,
          rotation: reduced ? 0 : 3,
          opacity: 0,
          duration: reduced ? 0.6 : 1.1,
          ease: reduced ? 'power1.out' : 'back.out(1.7)',
          transformOrigin: '0% 100%',
          scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none reverse' },
        })

        // Parágrafo entrou: acende os blocos dele (e apaga ao voltar pra cima).
        if (!reduced) {
          Array.from(text.children).forEach((p, i) => {
            ScrollTrigger.create({
              trigger: p,
              start: 'top 78%',
              onEnter: () => setLit((s) => new Set([...s, ...paragraphs[i].lights])),
              onLeaveBack: () =>
                setLit((s) => {
                  const next = new Set(s)
                  paragraphs[i].lights.forEach((id) => next.delete(id))
                  return next
                }),
            })
          })
        }

        // Linhas cortadas depois das fontes; se a largura mudar, o SplitText corta de novo e refaz a animação.
        document.fonts.ready.then(() => {
          if (!alive) return
          ctx.add(() => {
            Array.from(text.children).forEach((p) => {
              SplitText.create(p, {
                type: 'lines',
                // As linhas continuam texto normal pra leitor de tela; sem aria-label no parágrafo.
                aria: 'none',
                linesClass: 'block will-change-transform',
                autoSplit: true,
                onSplit: (self) => {
                  gsap.set(self.lines, { opacity: 0 })
                  const tl = gsap.timeline({
                    scrollTrigger: { trigger: p, start: 'top 82%', toggleActions: 'play none none reset' },
                  })
                  if (reduced) return tl.to(self.lines, { opacity: 1, duration: 0.5, stagger: 0.08 })
                  return addGlitchIn(tl, self.lines, 0, { amp: 14, stagger: 0.09 })
                },
              })
            })
          })
        })

        return () => {
          alive = false
        }
      },
    )
    return () => mm.revert()
  }, [])

  return (
    <section id="faco" data-section className="relative isolate overflow-x-clip px-4 pt-28 pb-32 pl-6 md:px-12 md:py-40">
      <SectionChrome id="faco" side="left" />
      <div className="grid gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16">
        <div className="flex flex-col">
          <div className="flex items-end justify-between gap-6">
            <h2
              ref={titleRef}
              className="origin-left font-display text-[19vw] leading-[0.84] uppercase will-change-transform md:text-[8.5vw]"
            >
              Não é só
              <br />a tela
            </h2>
            {/* Ele aponta pro diagrama */}
            <Personagem pose="apontando" size="sm" className="hidden shrink-0 md:block" />
          </div>

          {/* No celular o diagrama vem logo depois do título, antes dos parágrafos. */}
          <div className="mt-10 md:hidden">
            <Diagram lit={lit} />
          </div>

          {/* Espaço entre os parágrafos: cada um entra (e acende o seu bloco) num momento do scroll. */}
          <div ref={textRef} className="mt-10 flex max-w-[34rem] flex-col gap-[12svh] md:mt-14 md:gap-[16svh] md:pb-[10svh]">
            {paragraphs.map((p) => (
              <p key={p.text} className="text-lg leading-snug text-bone md:text-[clamp(1.125rem,1.4vw,1.5rem)]">
                {p.text}
              </p>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="sticky top-[16svh]">
            <Diagram lit={lit} />
          </div>
        </div>
      </div>
    </section>
  )
}

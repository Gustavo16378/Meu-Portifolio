import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { glitchOnce } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { useMagnetic } from '../motion/useMagnetic'
import { getLenis } from '../motion/useLenis'
import { isScrollLocked } from '../motion/scrollLock'
import { otherProjects, type OtherPrint, type OtherProject } from '../data/projects'
import { SectionChrome } from './SectionChrome'

const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const srcSet = (p: OtherPrint) => p.sizes.map(([w, src]) => `${src} ${w}w`).join(', ')

function PrintImage({ print, alt, sizes }: { print: OtherPrint; alt: string; sizes: string }) {
  return (
    <picture>
      <source srcSet={srcSet(print)} sizes={sizes} type="image/webp" />
      <img
        src={print.png}
        alt={alt}
        width={print.width}
        height={print.height}
        loading="lazy"
        decoding="async"
        className="block size-full object-cover object-top"
      />
    </picture>
  )
}

const frame: CSSProperties = { border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-frame)' }

/** Conteúdo da linha aberta: prints à esquerda, texto, stack e links à direita. No celular, empilha. */
function Details({ project, id }: { project: OtherProject; id: string }) {
  const liveRef = useRef<HTMLAnchorElement>(null)
  const repoRef = useRef<HTMLAnchorElement>(null)
  useMagnetic(liveRef)
  useMagnetic(repoRef)
  const { prints } = project

  return (
    <div id={id} data-details className="grid gap-8 pt-2 pb-10 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-12 md:pb-14">
      <div className="flex items-end gap-4 md:gap-6">
        {prints ? (
          <>
            <div className="aspect-[16/10] min-w-0 flex-1 overflow-hidden rounded-[4px] bg-surface" style={frame}>
              <PrintImage print={prints.desktop} alt={`${project.name} no desktop`} sizes="(min-width: 768px) 45vw, 70vw" />
            </div>
            <div className="aspect-[480/1039] w-[22%] shrink-0 overflow-hidden rounded-[10px] bg-surface" style={frame}>
              <PrintImage print={prints.mobile} alt={`${project.name} no celular`} sizes="(min-width: 768px) 10vw, 20vw" />
            </div>
          </>
        ) : (
          <div
            className="flex aspect-[16/10] w-full max-w-[280px] items-center justify-center rounded-[4px] bg-surface font-display text-[16vw] text-muted md:text-6xl"
            style={frame}
          >
            {initials(project.name)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {project.about.map((p) => (
          <p key={p} className="max-w-[34rem] text-base leading-snug text-bone md:text-lg">
            {p}
          </p>
        ))}
        {project.stack.length > 0 && <p className="font-mono text-[11px] text-muted md:text-xs">{project.stack.join(' · ')}</p>}
        {(project.url || project.repo) && (
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs md:text-sm">
            {project.url && (
              <a
                ref={liveRef}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-acid px-5 font-bold text-bg"
              >
                ver no ar <span aria-hidden>↗</span>
              </a>
            )}
            {project.repo && (
              <a
                ref={repoRef}
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-[3px] border border-acid px-5 text-bone"
              >
                código
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Seção 04. Lista dos outros projetos. Fechada, cada linha mostra a miniatura do print, nome, uma linha e
 * metadados; no hover a miniatura cresce um pouco e a linha acende em lima. Clicar em qualquer ponto da linha
 * abre (só uma por vez, Esc fecha). A abertura não anima altura: o layout muda de uma vez e as linhas de baixo
 * deslizam com mola da posição antiga pra nova (FLIP), só com transform.
 */
export function Others() {
  const listRef = useRef<HTMLUListElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const thumbs = useRef<(HTMLDivElement | null)[]>([])
  const [open, setOpen] = useState<number | null>(0)
  const openRef = useRef<number | null>(0)

  useScrollSkew(titleRef, { stiffness: 120, damping: 10 })

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      gsap.from(list.children, {
        y: reduced ? 0 : 24,
        opacity: 0,
        duration: reduced ? 0.5 : 0.7,
        stagger: 0.08,
        ease: reduced ? 'power1.out' : 'back.out(1.6)',
        scrollTrigger: { trigger: list, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
    }, list)
    return () => ctx.revert()
  }, [])

  const toggle = (i: number | null) => {
    const list = listRef.current
    if (!list) return
    const next = openRef.current === i ? null : i
    const reduced = prefersReducedMotion()
    const rows = Array.from(list.children) as HTMLElement[]
    const before = rows.map((r) => r.getBoundingClientRect().top)
    const change = () => {
      openRef.current = next
      flushSync(() => setOpen(next))
      // Last: onde cada linha foi parar. Invert + Play: parte da posição antiga e desliza até a nova.
      rows.forEach((row, k) => {
        const d = before[k] - row.getBoundingClientRect().top
        if (Math.abs(d) > 0.5 && !reduced) {
          gsap.fromTo(row, { y: d }, { y: 0, duration: 0.85, ease: 'back.out(1.1)', overwrite: 'auto' })
        }
      })
      if (next !== null) {
        const details = rows[next].querySelector('[data-details]')
        if (details) {
          gsap.fromTo(
            details.children,
            { opacity: 0, y: reduced ? 0 : -16 },
            { opacity: 1, y: 0, duration: reduced ? 0.3 : 0.6, stagger: 0.08, ease: 'power3.out', delay: reduced ? 0 : 0.12 },
          )
        }
        // A linha aberta fica à vista, mesmo que as de cima tenham fechado.
        const top = rows[next].getBoundingClientRect().top
        if (top < 100) getLenis()?.scrollTo(rows[next], { offset: -100, duration: 0.8 })
      }
      // A página mudou de altura: recalcula o scroll suave e os gatilhos das seções de baixo.
      getLenis()?.resize()
      ScrollTrigger.refresh()
    }
    // Fechando uma linha aberta: o conteúdo some rápido antes do layout mudar.
    const current = openRef.current !== null ? rows[openRef.current]?.querySelector('[data-details]') : null
    if (current && !reduced) gsap.to(current.children, { opacity: 0, duration: 0.15, onComplete: change })
    else change()
  }

  // Esc fecha a linha aberta (se nenhuma camada estiver por cima).
  const toggleRef = useRef(toggle)
  toggleRef.current = toggle
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || isScrollLocked()) return
      // Só com a lista na tela (ou o foco nela): fechar de longe encolhia a página por baixo do usuário.
      const list = listRef.current
      if (!list) return
      const r = list.getBoundingClientRect()
      const onScreen = r.bottom > 0 && r.top < window.innerHeight
      if (onScreen || list.contains(document.activeElement)) toggleRef.current(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const glitch = (i: number) => {
    const el = thumbs.current[i]
    if (el && !prefersReducedMotion()) glitchOnce(el, 5)
  }

  return (
    <section id="outros" data-section className="relative isolate overflow-x-clip px-4 pt-24 pb-32 pl-6 md:px-12 md:py-36">
      <SectionChrome id="outros" />
      <h2
        ref={titleRef}
        className="origin-left font-display text-[17vw] leading-[0.84] uppercase will-change-transform md:text-[8vw]"
      >
        Outros no ar
      </h2>

      <ul ref={listRef} className="mt-10 md:mt-16" style={{ borderBottom: '1px solid var(--c-border)' }}>
        {otherProjects.map((p, i) => {
          const isOpen = open === i
          const detailsId = `outro-${p.id}`
          return (
            <li key={p.id} className="will-change-transform" style={{ borderTop: '1px solid var(--c-border)' }}>
              {/* A linha inteira é clicável; o botão com o nome é o alvo de teclado. */}
              <div
                onClick={() => toggle(i)}
                onPointerEnter={() => glitch(i)}
                className={`group flex cursor-pointer items-center gap-4 py-5 transition-[background-color] duration-200 hover:bg-[var(--row-hover)] md:gap-8 md:py-6 ${
                  isOpen ? 'bg-[var(--row-hover)]' : ''
                }`}
              >
                <div
                  ref={(el) => {
                    thumbs.current[i] = el
                  }}
                  aria-hidden
                  className="flex aspect-[16/10] w-24 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-border bg-surface font-mono text-xs text-muted transition-[border-color,color] duration-200 group-hover:border-acid group-hover:text-acid md:w-40 md:text-sm"
                >
                  {p.prints ? (
                    <div className="size-full transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]">
                      <PrintImage print={p.prints.desktop} alt="" sizes="(min-width: 768px) 160px, 96px" />
                    </div>
                  ) : (
                    initials(p.name)
                  )}
                </div>
                <div className="min-w-0 flex-1 md:grid md:grid-cols-[1.3fr_1.4fr_1fr] md:items-baseline md:gap-6">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={detailsId}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(i)
                    }}
                    className={`text-left font-display text-2xl leading-none uppercase transition-[color] duration-200 group-hover:text-acid md:text-4xl ${
                      isOpen ? 'text-acid' : ''
                    }`}
                  >
                    {p.name}
                  </button>
                  <p className="mt-1 text-base leading-snug text-bone md:mt-0 md:text-[17px]">{p.line}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted md:mt-0 md:text-xs">
                    {[p.kind, p.year, ...p.stack].join(' · ')}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-4 font-mono text-xs text-muted">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${p.name}: ver no ar`}
                      className="-my-2 inline-flex min-h-11 min-w-11 items-center justify-center px-2 transition-[color] duration-200 hover:text-acid md:min-w-0"
                    >
                      <span className="hidden md:inline">{p.url.replace('https://', '')} </span>
                      <span aria-hidden>↗</span>
                    </a>
                  )}
                  <span
                    aria-hidden
                    className={`text-base transition-[color] duration-200 group-hover:text-acid ${isOpen ? 'text-acid' : ''}`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </span>
              </div>
              {isOpen && <Details project={p} id={detailsId} />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

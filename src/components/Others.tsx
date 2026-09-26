import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { glitchOnce } from '../motion/glitch'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { otherProjects, type OtherProject } from '../data/projects'

const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

function Thumb({ project, thumbRef }: { project: OtherProject; thumbRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={thumbRef}
      aria-hidden
      className="flex aspect-[4/3] w-16 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-border bg-surface font-mono text-xs text-muted transition-[color,border-color] duration-200 group-hover:border-acid group-hover:text-acid md:w-24 md:text-sm"
    >
      {project.thumb ? (
        <picture>
          <source srcSet={project.thumb.webp} type="image/webp" />
          <img
            src={project.thumb.png}
            alt=""
            width={project.thumb.width}
            height={project.thumb.height}
            loading="lazy"
            decoding="async"
            className="block size-full object-cover object-top"
          />
        </picture>
      ) : (
        initials(project.name)
      )}
    </div>
  )
}

/**
 * Seção 04. Lista dos outros projetos, visível sem clicar. A linha inteira acende em lima no hover
 * e a miniatura dá um glitch rápido. Sem print, a miniatura mostra as iniciais.
 */
export function Others() {
  const listRef = useRef<HTMLUListElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const thumbs = useRef<(HTMLDivElement | null)[]>([])

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

  const glitch = (i: number) => {
    const el = thumbs.current[i]
    if (el && !prefersReducedMotion()) glitchOnce(el, 5)
  }

  return (
    <section id="outros" data-section className="relative px-4 py-24 pl-6 md:px-12 md:py-36">
      <h2
        ref={titleRef}
        className="origin-left font-display text-[17vw] leading-[0.84] uppercase will-change-transform md:text-[8vw]"
      >
        Outros no ar
      </h2>

      <ul ref={listRef} className="mt-10 md:mt-16" style={{ borderBottom: '1px solid var(--c-border)' }}>
        {otherProjects.map((p, i) => {
          const content = (
            <>
              <Thumb
                project={p}
                thumbRef={(el) => {
                  thumbs.current[i] = el
                }}
              />
              <div className="min-w-0 flex-1 md:grid md:grid-cols-[1.3fr_1.4fr_1fr] md:items-baseline md:gap-6">
                <p className="font-display text-2xl leading-none uppercase transition-[color] duration-200 group-hover:text-acid md:text-4xl">
                  {p.name}
                </p>
                <p className="mt-1 text-sm leading-snug text-bone md:mt-0 md:text-base">{p.line}</p>
                <p className="mt-1 font-mono text-[11px] text-muted md:mt-0 md:text-xs">
                  {p.kind} · {p.year} · {p.stack.join(' · ')}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted transition-[color] duration-200 group-hover:text-acid">
                {/* No celular só a seta: o endereço apertaria o texto. */}
                {p.url ? (
                  <>
                    <span className="hidden md:inline">{p.url.replace('https://', '')} </span>
                    <span aria-hidden>↗</span>
                  </>
                ) : (
                  <span className="hidden md:inline">sem link público</span>
                )}
              </span>
            </>
          )
          const rowClass =
            'group flex items-center gap-4 py-5 transition-[background-color] duration-200 hover:bg-[var(--row-hover)] md:gap-8 md:py-6'
          return (
            <li key={p.name} style={{ borderTop: '1px solid var(--c-border)' }}>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={rowClass} onPointerEnter={() => glitch(i)}>
                  {content}
                </a>
              ) : (
                <div className={rowClass} onPointerEnter={() => glitch(i)}>
                  {content}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

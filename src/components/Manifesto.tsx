import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { prefersReducedMotion } from '../motion/reducedMotion'
import { useScrollSkew } from '../motion/useScrollSkew'
import { createSteppedStage, STEP, stepLabel, type StageMemory } from '../motion/steppedStage'
import { API_RESPONSE, DB_COLUMNS, DB_QUERY, DB_ROWS, LAYER_TEXT_OF, LAYER_TEXTS, LAYERS } from '../data/layers'
import { useVideoPolicy } from './useVideoPolicy'
import { Personagem } from './Personagem'
import { SectionChrome } from './SectionChrome'

function ApiCard() {
  return (
    <div className="flex h-full flex-col justify-center p-3 font-mono text-[9px] leading-[1.5] text-muted md:p-5 md:text-[11px]">
      <p className="mb-1 text-bone">GET /ecommerce/produtos/1</p>
      {API_RESPONSE.map((l) => (
        <p key={l.line} className={`whitespace-pre ${l.mobile ? '' : 'hidden md:block'}`}>
          {l.line}
        </p>
      ))}
      <p className="mt-1 text-acid">200 OK · application/json</p>
    </div>
  )
}

function DbCard() {
  return (
    <div className="flex h-full flex-col justify-center p-3 font-mono text-[9px] leading-[1.6] text-muted md:p-5 md:text-[11px]">
      <p className="mb-2 text-bone">{DB_QUERY}</p>
      <div className="grid grid-cols-[1.6em_1fr_auto] gap-x-3 md:grid-cols-[1.6em_1fr_auto_auto]">
        {DB_COLUMNS.map((c, k) => (
          <span key={c} className={`text-acid ${k === 3 ? 'hidden md:block' : ''}`}>
            {c}
          </span>
        ))}
        {DB_ROWS.flatMap((row) =>
          row.map((c, k) => (
            <span key={`${row[0]}-${k}`} className={`whitespace-nowrap ${k === 3 ? 'hidden md:block' : ''}`}>
              {c}
            </span>
          )),
        )}
      </div>
      <p className="mt-2">(4 linhas)</p>
    </div>
  )
}

function DeployCard() {
  return (
    <div className="flex h-full flex-col justify-center gap-1 p-3 font-mono text-[9px] text-muted md:p-5 md:text-[11px]">
      <p className="text-[4.2vw] leading-tight text-bone md:text-[1.35vw]">torra-cafe.pages.dev</p>
      <p className="mt-1">cloudflare pages</p>
      <p>https · certificado ok</p>
      <p className="text-acid">no ar</p>
    </div>
  )
}

const CARD_BODY = [
  <img
    key="tela"
    src="/prints/torra-desktop-800.webp"
    alt="Site da TORRA"
    width={800}
    height={500}
    loading="lazy"
    decoding="async"
    className="block size-full object-cover object-top"
  />,
  <ApiCard key="api" />,
  <DbCard key="banco" />,
  <DeployCard key="deploy" />,
]

/**
 * Seção 02. Um palco em passos (o mesmo mecanismo do palco de projetos): a cada gesto o cartão da frente sai voando
 * pra pilha e mostra a camada de trás (tela, API, banco, deploy), a palavra da camada enche de lima e a linha de
 * log aparece embaixo. Os cartões vêm de dois projetos reais, marcados em cada um.
 */
export function Manifesto() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const words = useRef<(HTMLDivElement | null)[]>([])
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  const logs = useRef<(HTMLDivElement | null)[]>([])
  const texts = useRef<(HTMLParagraphElement | null)[]>([])
  const memory = useRef<StageMemory>({ current: 0, engaged: false })
  const { desktop } = useVideoPolicy()
  const [current, setCurrent] = useState(0)

  useScrollSkew(titleRef, { stiffness: 110, damping: 8 })

  useEffect(() => {
    const stage = stageRef.current
    const content = contentRef.current
    if (!stage || !content) return
    const all = <T,>(a: (T | null)[]) => a.filter((el): el is T => el !== null)
    const cardEls = all(cards.current)
    const wordEls = all(words.current)
    const fillEls = all(fills.current)
    const logEls = all(logs.current)
    const textEls = all(texts.current)
    const n = LAYERS.length

    // Cartões empilhados: um atrás do outro, quase alinhados. d = distância até a frente.
    const stacked = (d: number) => ({ xPercent: d * 2, yPercent: d * -3, rotation: 0, scale: 1 - d * 0.02 })
    // Pilha dos que já passaram: menores, acima, cada um num ângulo (em % do próprio cartão).
    const pile = (k: number) =>
      desktop
        ? { xPercent: -36 + k * 20, yPercent: -66 - (k % 2) * 8, rotation: [-9, 5, -3][k], scale: 0.48 }
        : { xPercent: -28 + k * 26, yPercent: -70 - (k % 2) * 4, rotation: [-8, 6, -4][k], scale: 0.4 }

    const build = () => {
      // Estado do passo 0 aplicado na hora (a timeline nasce pausada no 0).
      cardEls.forEach((el, k) => gsap.set(el, { ...stacked(k), zIndex: 10 + n - k }))
      gsap.set(wordEls, { yPercent: 0, opacity: (i: number) => (i === 0 ? 1 : 0) })
      gsap.set(fillEls, { opacity: (i: number) => (i === 0 ? 1 : 0) })
      gsap.set(logEls, { y: 0, opacity: (i: number) => (i === 0 ? 1 : 0) })
      gsap.set(textEls, { y: 0, opacity: (i: number) => (i === LAYER_TEXT_OF[0] ? 1 : 0) })

      const tl = gsap.timeline({ paused: true })
      tl.addLabel(stepLabel(0), 0)
      for (let i = 0; i < n - 1; i++) {
        const t = i * STEP
        // O cartão da frente sai voando pra pilha, com mola; os de trás andam uma posição pra frente.
        // Vai pra trás logo depois de começar a voar; no tempo exato da etiqueta ele ainda é o da frente.
        tl.set(cardEls[i], { zIndex: i }, t + 0.05)
        tl.fromTo(cardEls[i], stacked(0), { ...pile(i), duration: 0.85, ease: 'back.out(1.3)', immediateRender: false }, t)
        for (let j = i + 1; j < n; j++) {
          tl.fromTo(cardEls[j], stacked(j - i), { ...stacked(j - i - 1), duration: 0.6, ease: 'power2.out', immediateRender: false }, t + 0.15)
        }
        // A palavra atual sobe e some; a próxima entra de baixo em contorno e enche de lima.
        tl.fromTo(wordEls[i], { yPercent: 0, opacity: 1 }, { yPercent: -45, opacity: 0, duration: 0.45, ease: 'power2.in', immediateRender: false }, t)
        tl.fromTo(wordEls[i + 1], { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t + 0.35)
        tl.fromTo(fillEls[i + 1], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, t + 0.75)
        // Linha de log: a atual sai, a próxima entra.
        tl.fromTo(logEls[i], { y: 0, opacity: 1 }, { y: -8, opacity: 0, duration: 0.25, immediateRender: false }, t)
        tl.fromTo(logEls[i + 1], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, immediateRender: false }, t + 0.7)
        // Parágrafo: troca só quando muda de assunto.
        const a = LAYER_TEXT_OF[i]
        const b = LAYER_TEXT_OF[i + 1]
        if (a !== b) {
          tl.fromTo(textEls[a], { y: 0, opacity: 1 }, { y: -16, opacity: 0, duration: 0.35, ease: 'power2.in', immediateRender: false }, t)
          tl.fromTo(textEls[b], { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', immediateRender: false }, t + 0.55)
        }
        tl.addLabel(stepLabel(i + 1), t + STEP)
      }
      return tl
    }

    const stageApi = createSteppedStage({
      stage,
      backdrop: backdropRef.current,
      count: n,
      desktop,
      reduced: prefersReducedMotion(),
      memory,
      build,
      onCurrent: setCurrent,
      reducedSwap: (seek, done) =>
        gsap
          .timeline({ onComplete: done })
          .to(content, { opacity: 0, duration: 0.25 })
          .call(seek)
          .to(content, { opacity: 1, duration: 0.3 }),
      focusables: () => [],
      onEngaged: () => undefined,
    })
    return () => stageApi.destroy()
  }, [desktop])

  return (
    <section id="faco" data-section className="relative isolate overflow-x-clip pb-32 md:pb-40">
      <SectionChrome id="faco" side="left" />
      <div className="px-4 pt-28 pl-6 md:px-12 md:pt-40">
        <h2
          ref={titleRef}
          className="origin-left font-display text-[19vw] leading-[0.84] uppercase will-change-transform md:text-[8.5vw]"
        >
          Não é só
          <br />a tela
        </h2>
      </div>

      {/* Só no celular: fundo fixo que cobre o resto da tela enquanto o palco está preso (barra do iOS recolhida). */}
      {!desktop && (
        <div ref={backdropRef} aria-hidden className="pointer-events-none fixed inset-0 bg-bg" style={{ opacity: 0 }} />
      )}

      <div ref={stageRef} data-layers-stage className="relative mt-[8svh] h-svh overflow-hidden bg-bg">
        <div
          ref={contentRef}
          className="flex h-full flex-col justify-center gap-4 px-4 pt-[84px] pb-[72px] pl-6 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-16 md:px-12 md:pt-[96px]"
        >
          {/* Celular: palavra e log em cima; desktop: na coluna da direita. */}
          <div className="flex flex-col gap-2 md:order-2 md:gap-5">
            <div className="flex items-end justify-between gap-4">
              <div className="relative font-display text-[18vw] leading-[0.86] uppercase md:text-[9vw]">
                {/* Reserva o tamanho da palavra mais longa. */}
                <span aria-hidden className="invisible block">
                  Deploy
                </span>
                {LAYERS.map((l, i) => (
                  <div
                    key={l.id}
                    ref={(el) => {
                      words.current[i] = el
                    }}
                    className="absolute bottom-0 left-0 will-change-transform"
                  >
                    <span className="block" style={{ color: 'transparent', WebkitTextStroke: '1px var(--c-acid)' }}>
                      {l.word}
                    </span>
                    <span
                      ref={(el) => {
                        fills.current[i] = el
                      }}
                      aria-hidden
                      className="absolute inset-0 block text-acid"
                    >
                      {l.word}
                    </span>
                  </div>
                ))}
              </div>
              <Personagem pose={LAYERS[current].pose} size="sm" className="shrink-0" />
            </div>
            <div className="relative h-[2.6em] font-mono text-[10px] leading-[1.3em] md:text-xs">
              {LAYERS.map((l, i) => (
                <div
                  key={l.id}
                  ref={(el) => {
                    logs.current[i] = el
                  }}
                  className="absolute inset-x-0 top-0 will-change-transform"
                >
                  <p className="text-bone">
                    <span className="text-acid">{String(i + 1).padStart(2, '0')}</span> {l.log}
                  </p>
                  <p className="text-muted">
                    {l.project} · {l.stack}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pilha de cartões. Margem em cima: a pilha dos que já passaram fica acima do atual. */}
          <div className="relative mx-auto mt-[26vw] aspect-[4/3] w-[64vw] md:order-1 md:row-span-2 md:mt-[11vw] md:aspect-[16/10] md:w-[34vw]">
            {LAYERS.map((l, k) => (
              <div
                key={l.id}
                ref={(el) => {
                  cards.current[k] = el
                }}
                className="absolute inset-0 will-change-transform"
              >
                <div
                  className="flex size-full flex-col bg-surface p-[5px] md:p-[7px]"
                  style={{ border: '1px solid var(--card-edge)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="min-h-0 flex-1 overflow-hidden bg-bg">{CARD_BODY[k]}</div>
                  <div
                    className="flex justify-between gap-2 pt-[6px] pb-[1px] font-mono text-[9px] leading-none md:text-[10px]"
                    style={{ color: 'var(--c-muted-hi)' }}
                  >
                    <span>
                      <span className="text-acid">{String(k + 1).padStart(2, '0')}</span> / 04 · {l.id === 'api' ? 'API' : l.id}
                    </span>
                    {/* Projeto real do cartão: tela e deploy são da TORRA, API e banco do Ecommerce Café. */}
                    <span className="text-bone">{l.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative min-h-[5.6em] max-w-[34rem] text-base leading-snug text-bone md:order-3 md:col-start-2 md:min-h-[5em] md:text-[clamp(1.125rem,1.4vw,1.5rem)]">
            {LAYER_TEXTS.map((t, i) => (
              <p
                key={t}
                ref={(el) => {
                  texts.current[i] = el
                }}
                className="absolute inset-x-0 top-0 will-change-transform"
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

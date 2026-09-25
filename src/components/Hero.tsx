import { GridBackdrop } from './GridBackdrop'

/** Etapa 0: só a grade e uma amostra das três fontes. O hero de verdade entra na Etapa 1. */
export function Hero() {
  return (
    <section id="abertura" data-section className="relative flex min-h-svh items-center px-4 md:px-12">
      <GridBackdrop />
      <div className="relative">
        <h1 className="font-display text-[22vw] leading-[0.85] tracking-[-0.01em] uppercase md:text-[12vw]">
          <span className="block text-bone">Gustavo</span>
          <span className="block text-acid">Dev</span>
        </h1>
        <p className="mt-6 max-w-md text-base text-bone md:text-lg">
          Sites, sistemas e APIs. Front e back, do design ao deploy.
        </p>
        <p className="mt-3 font-mono text-xs text-muted">react · typescript · java · spring · quarkus · postgresql</p>
      </div>
    </section>
  )
}

import { useEffect, useRef } from 'react'
import { useMagnetic } from '../motion/useMagnetic'
import { GridBackdrop } from './GridBackdrop'
import { Personagem } from './Personagem'

/** Página que não existe: ele dá de ombros, no centro, e um link de volta. */
export function NotFound() {
  const backRef = useRef<HTMLAnchorElement>(null)
  useMagnetic(backRef, { strength: 0.3 })

  // Não indexar: o servidor devolve o app pra qualquer caminho.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    document.title = 'Página não encontrada · gustavodev.dev'
    return () => meta.remove()
  }, [])

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-4 text-center">
      <GridBackdrop />
      <Personagem pose="ombros" size="lg" show className="relative" />
      <h1 className="relative font-display text-[13vw] leading-[0.86] uppercase md:text-[7vw]">
        Não achei <span className="text-acid">essa página</span>
      </h1>
      <a ref={backRef} href="/" className="relative -m-3 p-3 font-mono text-xs text-acid md:text-sm">
        voltar pro início
      </a>
    </main>
  )
}

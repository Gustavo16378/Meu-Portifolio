import { useEffect, useState } from 'react'

interface NetworkInfo {
  saveData?: boolean
  effectiveType?: string
  addEventListener?: (type: 'change', cb: () => void) => void
  removeEventListener?: (type: 'change', cb: () => void) => void
}

export interface VideoPolicy {
  /** Layout desktop (min-width 768px). No mobile os vídeos desktop não carregam. */
  desktop: boolean
  /** Só poster, com botão "ver em movimento": economia de dados, 2g/3g ou reduced-motion. */
  posterOnly: boolean
}

const DESKTOP = '(min-width: 768px)'
const REDUCED = '(prefers-reduced-motion: reduce)'
const SLOW = ['slow-2g', '2g', '3g']

function read(): VideoPolicy {
  const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection
  const slow = Boolean(connection?.saveData) || SLOW.includes(connection?.effectiveType ?? '')
  return {
    desktop: window.matchMedia(DESKTOP).matches,
    posterOnly: slow || window.matchMedia(REDUCED).matches,
  }
}

/** O que este aparelho e esta conexão podem tocar. Atualiza se a tela, a preferência ou a rede mudarem. */
export function useVideoPolicy(): VideoPolicy {
  const [policy, setPolicy] = useState(read)

  useEffect(() => {
    const update = () =>
      setPolicy((prev) => {
        const next = read()
        return prev.desktop === next.desktop && prev.posterOnly === next.posterOnly ? prev : next
      })
    const queries = [window.matchMedia(DESKTOP), window.matchMedia(REDUCED)]
    queries.forEach((q) => q.addEventListener('change', update))
    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection
    connection?.addEventListener?.('change', update)
    return () => {
      queries.forEach((q) => q.removeEventListener('change', update))
      connection?.removeEventListener?.('change', update)
    }
  }, [])

  return policy
}

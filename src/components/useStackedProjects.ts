import { useEffect, useState } from 'react'

/** Palco preso só com mouse e tela larga; o resto (toque, tela estreita) rola normal. */
const STAGE = '(min-width: 900px) and (pointer: fine)'

/** Se a seção de projetos vira cinco blocos em scroll normal (true) ou o palco preso em passos (false). */
export function useStackedProjects(): boolean {
  const [stacked, setStacked] = useState(() => !window.matchMedia(STAGE).matches)

  useEffect(() => {
    const query = window.matchMedia(STAGE)
    const update = () => setStacked(!query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return stacked
}

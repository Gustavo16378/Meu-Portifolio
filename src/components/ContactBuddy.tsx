import { useEffect, useRef, useState } from 'react'
import { useIdle } from '../motion/useIdle'
import { watchVisibility } from '../motion/spring'
import { Personagem } from './Personagem'

const SLEEP_AFTER = 20

/**
 * Personagem do contato: acena com balanço lento; depois de 20 segundos sem ninguém mexer, dorme.
 * Qualquer interação acorda. O relógio só corre com a seção na tela.
 */
export function ContactBuddy({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [asleep, setAsleep] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const trigger = watchVisibility(ref.current, setInView)
    return () => {
      trigger.kill()
    }
  }, [])

  useIdle(
    SLEEP_AFTER,
    () => setAsleep(true),
    () => setAsleep(false),
    inView,
  )

  return (
    <div ref={ref} className={className}>
      <Personagem pose={asleep ? 'dormindo' : 'acenando'} size="md" sizes={{ dormindo: 'sm' }} sway={!asleep} />
    </div>
  )
}

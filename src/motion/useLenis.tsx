import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './reducedMotion'

const LenisContext = createContext<Lenis | null>(null)

/** Liga o Lenis ao ticker único do GSAP e ao ScrollTrigger. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const instance = new Lenis({
      lerp: reduced ? 1 : 0.1,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    })

    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    setLenis(instance)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

/** Instância do Lenis (null antes de montar). Use `lenis.velocity` pra skew por velocidade. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

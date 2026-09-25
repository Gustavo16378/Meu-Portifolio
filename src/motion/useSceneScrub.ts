import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { MEDIA } from './media'

/**
 * Timeline da cena controlada pelo scroll, no trecho em que o palco acabou de chegar
 * (luz acendendo, print aparecendo, taça enchendo). Reversível.
 * `build` recebe a timeline já ligada ao scroll; `reduced` monta o estado final sem movimento.
 */
export function useSceneScrub(
  sceneRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline) => void,
  reduced?: () => void,
): void {
  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const mm = gsap.matchMedia()
    mm.add(MEDIA, (ctx) => {
      if (ctx.conditions?.reduced) {
        reduced?.()
        return
      }
      const desktop = Boolean(ctx.conditions?.desktop)
      build(
        gsap.timeline({
          scrollTrigger: {
            trigger: desktop ? scene : stage,
            start: desktop ? 'top 40%' : 'top 70%',
            end: desktop ? 'top -60%' : 'bottom 70%',
            scrub: 0.5,
          },
        }),
      )
    })
    return () => mm.revert()
    // build e reduced só leem refs; montar uma vez é o esperado.
  }, [sceneRef, stageRef])
}

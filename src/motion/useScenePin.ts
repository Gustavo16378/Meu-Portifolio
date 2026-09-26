import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { MEDIA } from './media'

/**
 * Entrada do frame de um projeto, controlada pelo scroll e reversível. O frame sobe com mola
 * enquanto o palco chega e termina de assentar no começo do trecho preso; o resto do trecho
 * é pra olhar o site rodando. Elementos com [data-enter] entram na ordem de data-enter-at.
 */
export function useScenePin(
  sceneRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  { calm = false }: { calm?: boolean } = {},
): void {
  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const mm = gsap.matchMedia()
    mm.add(MEDIA, (ctx) => {
      if (ctx.conditions?.reduced) return
      const desktop = Boolean(ctx.conditions?.desktop)
      const items = Array.from(stage.querySelectorAll<HTMLElement>('[data-enter]'))

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: desktop ? 'top 70%' : 'top 85%',
          // Assenta logo no começo do trecho preso; o resto dele é tempo de olhar.
          end: desktop ? 'top -25%' : 'top 5%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      items.forEach((el) => {
        tl.fromTo(
          el,
          { y: () => window.innerHeight * 0.22, rotation: calm ? 0 : -2.5, opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 1, ease: calm ? 'power3.out' : 'back.out(1.4)' },
          Number(el.dataset.enterAt ?? 0),
        )
      })
    })
    return () => mm.revert()
  }, [sceneRef, stageRef, calm])
}

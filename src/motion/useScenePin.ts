import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { MEDIA } from './media'

const num = (el: Element, key: string): number => Number((el as HTMLElement).dataset[key] ?? 0)

interface ScenePinOptions {
  /** Cena sem quique (Cleane). */
  calm?: boolean
  /** Acrescenta à timeline da montagem (posições de 0 a 1 dentro do trecho preso). */
  build?: (tl: gsap.core.Timeline) => void
  /** Estado final parado, pra reduced-motion. */
  reduced?: () => void
}

/**
 * Cena de projeto com freada: o palco fica preso (sticky) enquanto a cena se monta,
 * tudo controlado pelo scroll e reversível.
 *
 * 1. Montagem, do momento em que o palco prende até ele soltar: cada objeto cai com mola
 *    no seu `enterAt` (0 a 1), e `build` acrescenta o resto (luz, lâmpadas). O último trecho
 *    fica parado, com a cena montada, antes de soltar.
 * 2. Parallax leve entre as camadas enquanto está preso.
 * 3. Saída, depois que solta: os objetos são empurrados pra cima, ganhando velocidade e girando,
 *    enquanto a próxima cena chega.
 */
export function useScenePin(
  sceneRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  { calm = false, build, reduced }: ScenePinOptions = {},
): void {
  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const mm = gsap.matchMedia()
    mm.add(MEDIA, (ctx) => {
      const objects = Array.from(stage.querySelectorAll('[data-obj]'))
      const pick = (sel: string) => objects.map((o) => o.querySelector(sel)).filter((e): e is Element => !!e)
      const outs = pick('[data-obj-out]')
      const ins = pick('[data-obj-in]')
      const depths = pick('[data-obj-depth]')
      const ambient = stage.querySelector('[data-ambient]')
      const vh = () => window.innerHeight

      if (ctx.conditions?.reduced) {
        reduced?.()
        gsap.from([...ins, ambient], {
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: scene, start: 'top 70%', toggleActions: 'play none none reverse' },
        })
        return
      }

      // 1. Montagem durante o trecho preso.
      const assemble = gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      })
      if (ambient) assemble.fromTo(ambient, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' }, 0)
      ins.forEach((el) => {
        assemble.fromTo(
          el,
          { y: () => -vh() * 0.85, rotation: num(el, 'fallR'), opacity: 0 },
          {
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.26,
            // Cena calma pousa sem passar do ponto.
            ease: calm ? 'power3.out' : 'back.out(1.5)',
          },
          num(el, 'enterAt'),
        )
      })
      build?.(assemble)
      // Garante a duração 1: o fim do trecho preso é a cena montada, parada.
      assemble.to({}, { duration: 0 }, 1)

      // 2. Parallax leve enquanto está preso.
      const parallax = gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: true },
      })
      depths.forEach((el) => {
        const d = num(el, 'depth')
        parallax.fromTo(el, { y: d * 40 }, { y: -d * 40, ease: 'none' }, 0)
      })

      // 3. Saída, depois que o palco solta.
      const exit = gsap.timeline({
        scrollTrigger: { trigger: scene, start: 'bottom bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
      })
      outs.forEach((el, i) => {
        exit.to(
          el,
          {
            y: () => -vh() * 0.9,
            x: () => (num(el, 'exitX') * window.innerWidth) / 100,
            rotation: num(el, 'exitR') * (calm ? 0.4 : 1),
            duration: 1,
            ease: calm ? 'power1.in' : 'power2.in',
          },
          i * 0.06,
        )
      })
      if (ambient) {
        exit.fromTo(ambient, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'none', immediateRender: false }, 0)
      }
    })

    return () => mm.revert()
    // build e reduced só leem refs; montar uma vez é o esperado.
  }, [sceneRef, stageRef, calm])
}

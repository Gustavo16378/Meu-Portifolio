import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { MEDIA } from './media'

const num = (el: Element, key: string): number => Number((el as HTMLElement).dataset[key] ?? 0)

/**
 * Transição física de uma cena de projeto, toda controlada pelo scroll e reversível:
 * os objetos caem na cena com mola, andam em camadas de parallax enquanto a cena está presa,
 * e no fim são empurrados pra fora por cima, ganhando velocidade e girando.
 *
 * No desktop a cena é alta e o palco fica preso (sticky); no mobile o palco rola normal
 * e os gatilhos passam a ser o próprio palco.
 */
export function useSceneTransition(
  sceneRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const mm = gsap.matchMedia()
    mm.add(MEDIA, (ctx) => {
      const desktop = Boolean(ctx.conditions?.desktop)
      const reduced = Boolean(ctx.conditions?.reduced)
      const objects = Array.from(stage.querySelectorAll('[data-obj]'))
      const outs = objects.map((o) => o.querySelector('[data-obj-out]')).filter((e): e is Element => !!e)
      const ins = objects.map((o) => o.querySelector('[data-obj-in]')).filter((e): e is Element => !!e)
      const depths = objects.map((o) => o.querySelector('[data-obj-depth]')).filter((e): e is Element => !!e)
      const ambient = stage.querySelector('[data-ambient]')

      if (reduced) {
        gsap.from([...ins, ambient], {
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: stage, start: 'top 70%', toggleActions: 'play none none reverse' },
        })
        return
      }

      const trigger = desktop ? scene : stage
      const vh = () => window.innerHeight

      // Entrada: cada objeto cai de cima, girado, e assenta passando um pouco do ponto.
      const enter = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: desktop ? 'top 80%' : 'top 95%',
          end: desktop ? 'top top' : 'top 30%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      ins.forEach((el, i) => {
        enter.fromTo(
          el,
          { y: () => -vh() * (0.75 + i * 0.12), rotation: num(el, 'fallR'), opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'back.out(1.6)' },
          i * 0.16,
        )
      })
      if (ambient) enter.fromTo(ambient, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'none' }, 0)

      // Parallax em camadas enquanto a cena passa.
      const drift = desktop ? 70 : 30
      const parallax = gsap.timeline({
        scrollTrigger: { trigger, start: desktop ? 'top top' : 'top bottom', end: 'bottom bottom', scrub: true },
      })
      depths.forEach((el) => {
        const d = num(el, 'depth')
        parallax.fromTo(el, { y: d * drift }, { y: -d * drift, ease: 'none' }, 0)
      })

      // Saída: empurrados pra cima com velocidade que cresce, girando, cada um pro seu lado.
      const exit = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: desktop ? 'bottom 185%' : 'bottom 75%',
          end: desktop ? 'bottom 100%' : 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      outs.forEach((el, i) => {
        exit.to(
          el,
          {
            y: () => -vh() * 1.25,
            x: () => (num(el, 'exitX') * window.innerWidth) / 100,
            rotation: num(el, 'exitR'),
            duration: 1,
            ease: 'power2.in',
          },
          i * 0.08,
        )
      })
      // fromTo explícito: a entrada já mexe na mesma opacidade, e um `to` gravaria o valor errado.
      if (ambient) {
        exit.fromTo(ambient, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'none', immediateRender: false }, 0)
      }
    })

    return () => mm.revert()
  }, [sceneRef, stageRef])
}

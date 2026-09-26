import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../motion/gsap'

const TILE = 160

/**
 * Ruído gerado uma vez num canvas pequeno e repetido como textura, fixo sobre tudo.
 * Neutro (só tons de cinza, blend normal, opacidade baixa) pra não tingir a cor do ambiente,
 * e desligado dentro da seção de projetos, onde só o site aparece.
 */
export function Grain() {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TILE
    canvas.height = TILE
    const ctx = canvas.getContext('2d')
    if (!ctx || !layerRef.current) return

    const img = ctx.createImageData(TILE, TILE)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    layerRef.current.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const projects = document.getElementById('projetos')
    if (!root || !projects) return
    const trigger = ScrollTrigger.create({
      trigger: projects,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => gsap.to(root, { autoAlpha: self.isActive ? 0 : 1, duration: 0.4, overwrite: true }),
    })
    return () => trigger.kill()
  }, [])

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--z-grain)' }}>
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: 'var(--grain-opacity)' }}>
        <div
          ref={layerRef}
          className="grain-layer absolute will-change-transform"
          style={{ inset: '-10%', backgroundSize: `${TILE}px ${TILE}px` }}
        />
      </div>
    </div>
  )
}

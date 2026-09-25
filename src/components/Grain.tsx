import { useEffect, useRef } from 'react'

const TILE = 160

/** Ruído gerado uma vez num canvas pequeno e repetido como textura, fixo sobre tudo. */
export function Grain() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TILE
    canvas.height = TILE
    const ctx = canvas.getContext('2d')
    if (!ctx || !ref.current) return

    const img = ctx.createImageData(TILE, TILE)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    ref.current.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-grain)', opacity: 'var(--grain-opacity)' }}
    >
      <div
        ref={ref}
        className="grain-layer absolute will-change-transform"
        style={{ inset: '-10%', backgroundSize: `${TILE}px ${TILE}px` }}
      />
    </div>
  )
}

import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { useTilt } from '../motion/useTilt'
import type { PhotoCardEls } from '../motion/usePhotoCards'

export interface Photo {
  webp: string
  png: string
  width: number
  height: number
  alt: string
  caption: string
}

interface PhotoCardProps {
  photo: Photo
  /** Posição de repouso dentro do palco. */
  className: string
  style?: CSSProperties
  zIndex: number
  register: (els: PhotoCardEls | null) => void
}

/** Cartão fotográfico: moldura fina, sombra, legenda em mono. A física fica em usePhotoCards. */
export function PhotoCard({ photo, className, style, zIndex, register }: PhotoCardProps) {
  const scatter = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const float = useRef<HTMLDivElement>(null)
  const lift = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const glare = useRef<HTMLDivElement>(null)

  useTilt(tilt, { maxX: 12, maxY: 16, glareRef: glare })

  useLayoutEffect(() => {
    if (scatter.current && body.current && float.current && lift.current) {
      register({ scatter: scatter.current, body: body.current, float: float.current, lift: lift.current })
    }
    return () => register(null)
  }, [register])

  return (
    <div
      ref={scatter}
      className={`pointer-events-none absolute will-change-transform ${className}`}
      style={{ ...style, zIndex }}
    >
      <div ref={body} className="pointer-events-auto relative touch-pan-y select-none will-change-transform">
        <div
          ref={lift}
          aria-hidden
          className="absolute inset-0 opacity-0"
          style={{ boxShadow: 'var(--shadow-lift)' }}
        />
        <div ref={float} className="will-change-transform">
          <div
            ref={tilt}
            className="relative overflow-hidden bg-surface p-[5px] will-change-transform md:p-[7px]"
            style={{ border: '1px solid var(--card-edge)', boxShadow: 'var(--shadow-card)' }}
          >
            <picture>
              <source srcSet={photo.webp} type="image/webp" />
              <img
                src={photo.png}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                draggable={false}
                className="block aspect-[4/5] w-full object-cover object-[50%_30%]"
              />
            </picture>
            <div className="flex justify-between pt-[6px] pb-[1px] font-mono text-[9px] leading-none text-muted md:text-[10px]">
              <span>{photo.caption}</span>
              <span>palmas, to</span>
            </div>
            <div
              ref={glare}
              aria-hidden
              className="pointer-events-none absolute -inset-x-1/2 inset-y-0 opacity-0 mix-blend-screen"
              style={{ backgroundImage: 'var(--glare)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

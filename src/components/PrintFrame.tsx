import { useRef, type RefObject } from 'react'
import { useScrollSkew } from '../motion/useScrollSkew'
import type { Project } from '../data/projects'

interface PhoneProps {
  project: Project
  className?: string
}

/** Print mobile num celular desenhado em linha. */
export function Phone({ project, className = '' }: PhoneProps) {
  const { mobile } = project.prints
  return (
    <div className={className}>
      <div className="rounded-[16px] p-[5%] md:rounded-[20px]" style={{ border: '1.25px solid var(--accent)' }}>
        <picture>
          <source srcSet={mobile.webp} type="image/webp" />
          <img
            src={mobile.png}
            alt={`Print do site ${project.name} no celular`}
            width={mobile.width}
            height={mobile.height}
            loading="lazy"
            decoding="async"
            className="block w-full rounded-[10px] md:rounded-[13px]"
          />
        </picture>
      </div>
    </div>
  )
}

interface PrintFrameProps {
  project: Project
  /** Onde o celular encosta na moldura. */
  phone?: 'left' | 'right'
  /** Véu escuro sobre o print, pra cena "acender" o print com o scroll. */
  dimRef?: RefObject<HTMLDivElement>
  /** Mola do skew; a cena calma usa uma sem passar do ponto. */
  calm?: boolean
}

/**
 * Print desktop numa moldura em linha dupla, na cor do projeto, com o celular sobreposto no canto.
 * O print desliza com skew pela velocidade do scroll e endireita quando para.
 */
export function PrintFrame({ project, phone = 'right', dimRef, calm = false }: PrintFrameProps) {
  const skewRef = useRef<HTMLDivElement>(null)
  useScrollSkew(skewRef, calm ? { factor: 0.1, max: 4, stiffness: 60, damping: 16 } : { factor: 0.16, max: 6, stiffness: 140, damping: 10 })
  const { desktop } = project.prints

  return (
    <div className="relative w-full p-[1.6%]" style={{ border: '1.25px solid var(--accent)' }}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface" style={{ outline: '1px solid var(--accent)', outlineOffset: 0 }}>
        <div ref={skewRef} className="h-full w-full will-change-transform">
          <picture>
            <source srcSet={desktop.webp} type="image/webp" />
            <img
              src={desktop.png}
              alt={`Print do site ${project.name} no desktop`}
              width={desktop.width}
              height={desktop.height}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover object-top"
            />
          </picture>
        </div>
        {dimRef && <div ref={dimRef} aria-hidden className="absolute inset-0 bg-bg" style={{ opacity: 0.8 }} />}
      </div>
      <Phone
        project={project}
        className={`absolute bottom-[-14%] w-[22%] ${phone === 'right' ? 'right-[-5%] rotate-[4deg]' : 'left-[-5%] -rotate-[4deg]'}`}
      />
    </div>
  )
}

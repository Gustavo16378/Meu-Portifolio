import { useRef, type ReactNode, type RefObject } from 'react'
import { useScrollSkew } from '../motion/useScrollSkew'
import type { Project } from '../data/projects'

interface PhoneProps {
  project: Project
  className?: string
}

/** Print mobile num celular: moldura fina na cor do projeto, sombra funda. */
export function Phone({ project, className = '' }: PhoneProps) {
  const { mobile } = project.prints
  return (
    <div className={className}>
      <div
        className="rounded-[14px] bg-surface p-[4%] md:rounded-[18px]"
        style={{ border: '1px solid var(--print-edge)', boxShadow: 'var(--shadow-print)' }}
      >
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
  /** Canto em que o celular encosta. */
  phone?: 'left' | 'right'
  /** Véu escuro sobre o print, pra cena "acender" o print com o scroll. */
  dimRef?: RefObject<HTMLDivElement>
  /** Mola do skew; a cena calma usa uma sem passar do ponto. */
  calm?: boolean
  /** Coisas presas ao print (as lâmpadas do Stewer), por cima dele. */
  children?: ReactNode
}

/**
 * O print desktop é o protagonista da cena: grande, com moldura discreta e sombra funda,
 * e o celular no canto. Desliza com skew pela velocidade do scroll e endireita quando para.
 */
export function PrintFrame({ project, phone = 'left', dimRef, calm = false, children }: PrintFrameProps) {
  const skewRef = useRef<HTMLDivElement>(null)
  useScrollSkew(
    skewRef,
    calm ? { factor: 0.08, max: 3, stiffness: 60, damping: 16 } : { factor: 0.12, max: 4, stiffness: 140, damping: 10 },
  )
  const { desktop } = project.prints

  return (
    <div className="relative w-full">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-surface"
        style={{ border: '1px solid var(--print-edge)', boxShadow: 'var(--shadow-print)' }}
      >
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
      {children}
      <Phone
        project={project}
        className={`absolute bottom-[-12%] w-[19%] ${phone === 'left' ? 'left-[-4%] -rotate-[3deg]' : 'right-[-4%] rotate-[3deg]'}`}
      />
    </div>
  )
}

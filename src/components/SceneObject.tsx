import type { CSSProperties, ReactNode } from 'react'

interface SceneObjectProps {
  className?: string
  style?: CSSProperties
  /** Parallax: 0 fica parado, 1 anda bastante (primeiro plano). */
  depth?: number
  /** Quando cai na cena, de 0 a 1 dentro do trecho preso. */
  enterAt?: number
  /** Rotação com que o objeto chega caindo. */
  fallRotation?: number
  /** Saída: pra onde é empurrado (x em vw) e quanto gira. Sai sempre por cima. */
  exit?: { x: number; rotation: number }
  children: ReactNode
}

/**
 * Objeto de cena de projeto. Cada camada é dona de um pedaço do transform, pra
 * saída, entrada e parallax (controlados por useScenePin) não brigarem com a física de dentro.
 */
export function SceneObject({
  className = '',
  style,
  depth = 0.3,
  enterAt = 0,
  fallRotation = 0,
  exit = { x: 0, rotation: 0 },
  children,
}: SceneObjectProps) {
  return (
    <div data-obj className={className} style={style}>
      <div data-obj-out data-exit-x={exit.x} data-exit-r={exit.rotation} className="h-full will-change-transform">
        <div data-obj-in data-enter-at={enterAt} data-fall-r={fallRotation} className="h-full will-change-transform">
          <div data-obj-depth data-depth={depth} className="h-full will-change-transform">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

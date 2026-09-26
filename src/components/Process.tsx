import { PROCESS_POSES } from '../data/personagem'
import { Personagem } from './Personagem'

/**
 * Seção 05. Por enquanto só o personagem, uma pose por passo (pensando, desenhando, digitando, comemorando),
 * cada uma entrando com fade e quique leve. Títulos e textos dos passos entram na Etapa 5.
 */
export function Process() {
  return (
    <section id="processo" data-section className="relative flex min-h-svh items-center px-4 pl-12 md:px-12">
      <ol className="grid w-full grid-cols-2 gap-10 md:grid-cols-4 md:gap-6">
        {PROCESS_POSES.map((pose, i) => (
          <li key={pose} className="flex justify-center">
            <Personagem pose={pose} size="sm" enter="hop" delay={i * 0.12} />
          </li>
        ))}
      </ol>
    </section>
  )
}

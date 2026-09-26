import { Personagem } from './Personagem'

/** Seção 06. Por enquanto só o personagem com o café, onde fica a linha do tempo. O conteúdo entra na Etapa 5. */
export function Story() {
  return (
    <section id="historia" data-section className="relative flex min-h-svh items-end justify-end px-4 pb-[18svh] md:px-12">
      <Personagem pose="cafe" size="md" className="md:mr-[10vw]" />
    </section>
  )
}

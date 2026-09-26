import { GridBackdrop } from './GridBackdrop'
import { ContactBuddy } from './ContactBuddy'

/** Seção 07. Por enquanto a grade e o personagem acenando onde vai ficar o botão do WhatsApp. O conteúdo entra na Etapa 5. */
export function Contact() {
  return (
    <section id="contato" data-section className="relative flex min-h-svh items-center justify-end px-4 md:px-12">
      <GridBackdrop />
      <ContactBuddy className="relative md:mr-[14vw]" />
    </section>
  )
}

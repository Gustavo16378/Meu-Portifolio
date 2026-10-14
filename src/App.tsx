import { startTransition, useCallback, useEffect, useState } from 'react'
import { LenisProvider } from './motion/useLenis'
import { navigateTo } from './motion/navigate'
import { useOverlayState } from './components/useDialog'
import type { SectionId } from './data/sections'
import { Hud } from './components/Hud'
import { Grain } from './components/Grain'
import { Cursor } from './components/Cursor'
import { Preloader } from './components/Preloader'
import { Menu } from './components/Menu'
import { Hero } from './components/Hero'
import { Manifesto } from './components/Manifesto'
import { Projects } from './components/Projects'
import { Others } from './components/Others'
import { Process } from './components/Process'
import { Story } from './components/Story'
import { Contact } from './components/Contact'
import { IdleWalker } from './components/IdleWalker'
import { RecruiterPanel } from './components/RecruiterPanel'

/** Seções abaixo do hero, na ordem da página. Montam uma por quadro (ver App). */
const SECTIONS = [Manifesto, Projects, Others, Process, Story, Contact]

export default function App() {
  const { open: menuOpen, show: openMenu, hide: closeMenu } = useOverlayState()

  const navigate = useCallback(
    (id: SectionId) => {
      closeMenu()
      // Em projetos o destino é o palco (onde ele prende), não a faixa de cor antes dele.
      const target =
        id === 'projetos' ? document.querySelector<HTMLElement>('[data-projects-stage]') : document.getElementById(id)
      if (target) navigateTo(target)
    },
    [closeMenu],
  )

  const recruiter = useOverlayState()
  const { show: showRecruiter } = recruiter
  // Do HUD ou do menu: fecha o menu (se aberto) e abre o painel.
  const openRecruiter = useCallback(() => {
    closeMenu()
    showRecruiter()
  }, [closeMenu, showRecruiter])

  // O hero monta primeiro; as outras seções entram uma por quadro, cada uma numa transição. Montar as seis de uma vez
  // virava uma tarefa só de quase um segundo no celular (DOM, estilo e gatilhos), travando a digitação do preloader,
  // que cobre esse tempo.
  const [mounted, setMounted] = useState(0)
  const sectionsReady = mounted === SECTIONS.length
  useEffect(() => {
    if (sectionsReady) return
    const id = requestAnimationFrame(() => startTransition(() => setMounted((n) => n + 1)))
    return () => cancelAnimationFrame(id)
  }, [mounted, sectionsReady])

  return (
    <LenisProvider>
      <Hud menuOpen={menuOpen} onMenu={openMenu} onRecruiter={openRecruiter} sectionsReady={sectionsReady} />
      <main>
        <Hero />
        {/* A lista só cresce e nunca muda de ordem: a posição serve de chave. */}
        {SECTIONS.slice(0, mounted).map((Section, i) => (
          <Section key={i} />
        ))}
      </main>
      <IdleWalker />
      <Grain sectionsReady={sectionsReady} />
      <Menu open={menuOpen} onClose={closeMenu} onNavigate={navigate} onRecruiter={openRecruiter} />
      <RecruiterPanel open={recruiter.open} onClose={recruiter.hide} />
      <Preloader pageReady={sectionsReady} />
      <Cursor />
    </LenisProvider>
  )
}

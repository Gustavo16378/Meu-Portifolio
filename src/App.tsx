import { useCallback } from 'react'
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

  // O painel do recrutador entra na Etapa 5; por enquanto o atalho só fecha o menu.
  const openRecruiter = closeMenu

  return (
    <LenisProvider>
      <main>
        <Hero />
        <Manifesto />
        <Projects />
        <Others />
        <Process />
        <Story />
        <Contact />
      </main>
      <Hud menuOpen={menuOpen} onMenu={openMenu} onRecruiter={openRecruiter} />
      <IdleWalker />
      <Grain />
      <Menu open={menuOpen} onClose={closeMenu} onNavigate={navigate} onRecruiter={openRecruiter} />
      <Preloader />
      <Cursor />
    </LenisProvider>
  )
}

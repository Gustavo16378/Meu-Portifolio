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

  // O hero monta primeiro; o resto entra numa transição, que o React renderiza em fatias curtas
  // (sem travar a página por quase um segundo no celular). O preloader cobre esse tempo.
  const [sectionsReady, setSectionsReady] = useState(false)
  useEffect(() => {
    startTransition(() => setSectionsReady(true))
  }, [])

  return (
    <LenisProvider>
      <Hud menuOpen={menuOpen} onMenu={openMenu} onRecruiter={openRecruiter} sectionsReady={sectionsReady} />
      <main>
        <Hero />
        {sectionsReady && (
          <>
            <Manifesto />
            <Projects />
            <Others />
            <Process />
            <Story />
            <Contact />
          </>
        )}
      </main>
      <IdleWalker />
      <Grain sectionsReady={sectionsReady} />
      <Menu open={menuOpen} onClose={closeMenu} onNavigate={navigate} onRecruiter={openRecruiter} />
      <RecruiterPanel open={recruiter.open} onClose={recruiter.hide} />
      <Preloader />
      <Cursor />
    </LenisProvider>
  )
}

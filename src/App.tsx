import { useCallback, useRef, useState } from 'react'
import { LenisProvider, getLenis } from './motion/useLenis'
import { lockScroll, unlockScroll } from './motion/scrollLock'
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

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuOpenRef = useRef(false)

  const openMenu = useCallback(() => {
    if (menuOpenRef.current) return
    menuOpenRef.current = true
    lockScroll()
    setMenuOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    if (!menuOpenRef.current) return
    menuOpenRef.current = false
    unlockScroll()
    setMenuOpen(false)
  }, [])

  const navigate = useCallback(
    (id: SectionId) => {
      closeMenu()
      const target = document.getElementById(id)
      if (!target) return
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { duration: 1.6 })
      else target.scrollIntoView()
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
      <Hud menuOpen={menuOpen} onMenu={openMenu} />
      <Grain />
      <Menu open={menuOpen} onClose={closeMenu} onNavigate={navigate} onRecruiter={openRecruiter} />
      <Preloader />
      <Cursor />
    </LenisProvider>
  )
}

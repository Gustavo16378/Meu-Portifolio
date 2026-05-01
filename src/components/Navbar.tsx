import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Trava o scroll do body enquanto menu está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLink = (href: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }, 320)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5"
          >
            <img
              src="./photos/logo.jpeg"
              alt="GustavoDev logo"
              className="h-14 w-auto rounded-lg object-contain"
            />
          </button>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <button
                  onClick={() => handleLink(l.href)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a
            href="https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20um%20or%C3%A7amento!"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex glow-btn px-5 py-2 rounded-lg text-sm"
          >
            Contratar
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — clique fora fecha */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 md:hidden"
              style={{ backdropFilter: 'blur(6px)', background: 'rgba(2,2,13,0.55)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel — desliza da direita, para no centro */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full z-50 md:hidden flex flex-col"
              style={{
                width: '68%',
                background: 'rgba(4,4,16,0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Header do drawer */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.05]">
                <img
                  src="./photos/logo.jpeg"
                  alt="GustavoDev logo"
                  className="h-12 w-auto rounded-md object-contain"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-5 flex flex-col gap-0.5">
                {links.map((l, i) => (
                  <motion.button
                    key={l.href}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.055 + 0.08, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleLink(l.href)}
                    className="text-left px-4 py-3.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all text-base font-medium"
                  >
                    {l.label}
                  </motion.button>
                ))}
              </nav>

              {/* CTA no rodapé do drawer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="px-4 pb-8 pt-2"
              >
                <a
                  href="https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20um%20or%C3%A7amento!"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="glow-btn w-full py-3 rounded-xl text-sm text-center block"
                >
                  Contratar agora
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

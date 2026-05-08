import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Home',     to: '/',         end: true  },
  { label: 'Sobre',    to: '/sobre',    end: false },
  { label: 'Serviços', to: '/servicos', end: false },
  { label: 'Projetos', to: '/projetos', end: false },
  { label: 'Skills',   to: '/skills',   end: false },
  { label: 'Contato',  to: '/contato',  end: false },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [hidden, setHidden]       = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const prevScrollY               = useRef(0)
  const navigate                  = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      const prev    = prevScrollY.current
      setScrolled(current > 40)
      if (current < 80)            setHidden(false)
      else if (current > prev + 4) setHidden(true)
      else if (current < prev - 4) setHidden(false)
      prevScrollY.current = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-4 py-2 text-sm transition-colors rounded-lg hover:bg-white/[0.05] ${
      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
    }`

  const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3.5 rounded-xl text-base font-medium transition-all border-l-2 ${
      isActive
        ? 'text-white border-brand-500 bg-brand-500/[0.06]'
        : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border-transparent'
    }`

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
        style={{ transform: hidden && !menuOpen ? 'translateY(-100%)' : 'translateY(0)' }}
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo → Home */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img
              src="/photos/logo.jpeg"
              alt="GustavoDev logo"
              className="h-14 w-auto rounded-lg object-contain"
            />
          </button>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-px bg-brand-500 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 md:hidden"
              style={{ backdropFilter: 'blur(6px)', background: 'rgba(2,2,13,0.55)' }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

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
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.05]">
                <img
                  src="/photos/logo.jpeg"
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

              <nav className="flex-1 px-4 py-5 flex flex-col gap-0.5">
                {links.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.055 + 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NavLink
                      to={l.to}
                      end={l.end}
                      onClick={() => setMenuOpen(false)}
                      className={drawerLinkClass}
                    >
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

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

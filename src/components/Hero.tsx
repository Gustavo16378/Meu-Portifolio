import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Linkedin, MessageCircle, ChevronDown } from 'lucide-react'
import {
  SiReact, SiTypescript, SiJavascript, SiTailwindcss,
  SiSpring, SiDocker, SiPostgresql, SiNodedotjs, SiGithub,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'

const techBadges = [
  { icon: <SiReact size={13} />, label: 'React', color: '#61DAFB' },
  { icon: <SiTypescript size={13} />, label: 'TypeScript', color: '#3178C6' },
  { icon: <FaJava size={13} />, label: 'Java', color: '#ED8B00' },
  { icon: <SiSpring size={13} />, label: 'Spring Boot', color: '#6DB33F' },
  { icon: <SiJavascript size={13} />, label: 'JavaScript', color: '#F7DF1E' },
  { icon: <SiTailwindcss size={13} />, label: 'Tailwind', color: '#06B6D4' },
  { icon: <SiPostgresql size={13} />, label: 'PostgreSQL', color: '#4169E1' },
  { icon: <SiDocker size={13} />, label: 'Docker', color: '#2496ED' },
  { icon: <SiNodedotjs size={13} />, label: 'Node.js', color: '#339933' },
]

// Para adicionar fotos: coloque-as em /public/photos/ e atualize os src abaixo
const slides = [
  { src: './photos/foto1.png', label: 'Foto 1' },
  { src: './photos/foto2.png', label: 'Foto 2' },
  { src: './photos/foto3.png', label: 'Foto 3' },
]

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const } },
})

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir)
    setCurrent((index + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1)
      setCurrent(prev => (prev + 1) % slides.length)
    }, 9000)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-grid"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      {/* Mobile: foto atual como fundo */}
      <AnimatePresence mode="wait">
        {slides[current].src && (
          <motion.div
            key={`mobile-bg-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 lg:hidden"
          >
            <img
              src={slides[current].src}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            {/* Vinheta */}
            <div className="absolute inset-0" style={{
              background: `
                linear-gradient(to bottom, rgba(2,2,13,0.92) 0%, rgba(2,2,13,0.55) 30%, rgba(2,2,13,0.78) 65%, rgba(2,2,13,0.99) 90%),
                linear-gradient(to right, rgba(2,2,13,0.75) 0%, rgba(2,2,13,0.2) 70%)
              `
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background orbs — desktop */}
      <div className="orb w-[600px] h-[600px] animate-glow-pulse pointer-events-none"
        style={{ top: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)' }} />
      <div className="orb w-[400px] h-[400px] animate-glow-pulse pointer-events-none"
        style={{ bottom: '0', right: '10%', animationDelay: '2s', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: '96px', paddingBottom: '64px' }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT ── */}
          <div>
            <motion.div
              variants={fadeUp(0)} initial="hidden" animate="show"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/[0.08] text-brand-400 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              Disponível para novos projetos
            </motion.div>

            <motion.h1
              variants={fadeUp(1)} initial="hidden" animate="show"
              className="font-black tracking-tight text-white leading-[1.06] mb-5"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}
            >
              Desenvolvedor{' '}
              <span className="gradient-text">Full Stack</span>
              <br />
              que entrega
              <br />
              resultado real
            </motion.h1>

            <motion.p
              variants={fadeUp(2)} initial="hidden" animate="show"
              className="text-base md:text-lg text-slate-400 max-w-md mb-8 leading-relaxed"
            >
              Do design ao deploy — sites, apps e APIs com{' '}
              <span className="text-slate-200 font-medium">React, TypeScript e Java</span>.
              Qualidade de mercado para clientes reais.
            </motion.p>

            <motion.div
              variants={fadeUp(3)} initial="hidden" animate="show"
              className="flex flex-wrap gap-3 mb-7"
            >
              <a
                href="https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20um%20or%C3%A7amento!"
                target="_blank" rel="noreferrer"
                className="glow-btn inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm"
              >
                <MessageCircle size={16} />
                Solicitar orçamento
              </a>
              <button
                onClick={() => document.querySelector('#projetos')?.scrollIntoView({ behavior: 'smooth' })}
                className="outline-btn inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm"
              >
                Ver projetos <ArrowRight size={16} />
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp(4)} initial="hidden" animate="show"
              className="flex items-center gap-2.5 mb-7"
            >
              {[
                { href: 'https://github.com/Gustavo16378', icon: <SiGithub size={16} /> },
                { href: 'https://linkedin.com/in/gustavo-barbosa-lima-341886278', icon: <Linkedin size={16} /> },
                {
                  href: 'https://instagram.com/gustavoDev', icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  )
                },
              ].map(({ href, icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-lg border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                  {icon}
                </a>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp(5)} initial="hidden" animate="show"
              className="flex flex-wrap gap-1.5"
            >
              {techBadges.map((t) => (
                <span key={t.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs text-slate-300 font-medium">
                  <span style={{ color: t.color }}>{t.icon}</span>
                  {t.label}
                </span>
              ))}
            </motion.div>

            {/* Dots de navegação — só no mobile */}
            {slides.some(s => s.src) && (
              <div className="flex items-center gap-2 mt-5 lg:hidden">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? 1 : -1)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === current ? '22px' : '6px',
                      height: '6px',
                      background: i === current ? '#0ea5e9' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: carousel ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col items-center gap-5"
          >
            <div className="relative w-full" style={{ maxWidth: '480px' }}>
              {/* Glow aura */}
              <div className="absolute rounded-3xl pointer-events-none"
                style={{
                  inset: '-20px',
                  background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 75%)',
                  filter: 'blur(20px)',
                }} />

              {/* Photo frame — sem borda, foto morre no escuro */}
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '3/4' }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ x: d > 0 ? '6%' : '-6%', opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d > 0 ? '-6%' : '6%', opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {slides[current].src ? (
                      <img
                        src={slides[current].src}
                        alt={slides[current].label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(160deg, #060614 0%, #0a1020 50%, #050912 100%)' }}>
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                          style={{
                            background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))',
                            border: '1px solid rgba(14,165,233,0.15)',
                            color: 'rgba(14,165,233,0.4)',
                          }}
                        >
                          G
                        </div>
                        <div className="text-center px-6">
                          <p className="text-slate-600 text-xs font-mono">foto {current + 1} de {slides.length}</p>
                          <p className="text-slate-700 text-[10px] mt-1 leading-relaxed">
                            Adicione suas fotos em<br />/public/photos/
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Vinheta — foto morre suavemente em todos os lados */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: `
                        linear-gradient(to top,    rgba(2,2,13,0.95) 0%, transparent 35%),
                        linear-gradient(to bottom, rgba(2,2,13,0.7)  0%, transparent 25%),
                        linear-gradient(to right,  rgba(2,2,13,0.6)  0%, transparent 25%),
                        linear-gradient(to left,   rgba(2,2,13,0.6)  0%, transparent 25%)
                      `
                    }} />
                  </motion.div>
                </AnimatePresence>

                {/* Full Stack badge */}
                <div
                  className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 16px rgba(14,165,233,0.45)' }}
                >
                  Full Stack
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? '22px' : '6px',
                    height: '6px',
                    background: i === current ? '#0ea5e9' : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-700 animate-bounce"
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  )
}

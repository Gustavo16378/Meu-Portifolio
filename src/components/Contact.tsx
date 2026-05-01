import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { MessageCircle, Mail, Github, Linkedin, ArrowRight } from 'lucide-react'

const channels = [
  {
    icon: <MessageCircle size={26} />,
    title: 'WhatsApp',
    subtitle: '(63) 99111-4551',
    description: 'Resposta rápida. Melhor canal para orçamentos e negociações.',
    href: 'https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20conversar!',
    color: '#22c55e',
    bg: 'bg-green-500/[0.07] border-green-500/20 hover:border-green-500/40',
  },
  {
    icon: <Mail size={26} />,
    title: 'E-mail',
    subtitle: 'suportev404@gmail.com',
    description: 'Para projetos mais elaborados e propostas formais.',
    href: 'mailto:suportev404@gmail.com',
    color: '#0ea5e9',
    bg: 'bg-brand-500/[0.07] border-brand-500/20 hover:border-brand-500/40',
  },
  {
    icon: <Github size={26} />,
    title: 'GitHub',
    subtitle: 'github.com/Gustavo16378',
    description: 'Veja o meu código. Projetos reais com qualidade real.',
    href: 'https://github.com/Gustavo16378',
    color: '#e2e8f0',
    bg: 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2]',
  },
]

const socials = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/gustavo-barbosa-lima-341886278', icon: <Linkedin size={18} /> },
  { label: '@gustavoDev', href: 'https://instagram.com/gustavoDev', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )},
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contato" ref={ref} className="py-16 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/[0.02] to-transparent pointer-events-none" />
      <div
        className="orb w-[600px] h-[400px] top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
            className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Contato
          </motion.p>
          <motion.h2
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
            className="section-title mx-auto"
          >
            Vamos construir algo <span className="gradient-text">incrível juntos</span>
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
            className="section-subtitle mx-auto text-center"
          >
            Tem um projeto em mente? Me chama. Respondo rápido e sem enrolação.
          </motion.p>
        </div>

        {/* Channel cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {channels.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={i * 0.15 + 3}
              className={`glass-card rounded-2xl p-6 flex flex-col gap-4 border transition-all duration-300 group ${c.bg}`}
            >
              <div style={{ color: c.color }}>{c.icon}</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-0.5">{c.title}</h3>
                <p className="text-xs font-mono mb-2" style={{ color: c.color }}>{c.subtitle}</p>
                <p className="text-slate-400 text-sm">{c.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium mt-auto" style={{ color: c.color }}>
                Acessar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Social links row */}
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={7}
          className="flex items-center justify-center gap-4"
        >
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card glass-card-hover text-slate-400 hover:text-white text-sm transition-all"
            >
              {s.icon}
              {s.label}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

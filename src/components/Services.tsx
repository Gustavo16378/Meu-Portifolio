import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, Building2, AppWindow, Server, Wrench, ArrowRight, Check } from 'lucide-react'

const services = [
  {
    icon: <Globe size={24} />,
    title: 'Landing Page',
    description: 'Página única de alta conversão. Design profissional, responsivo, animações e deploy incluso.',
    price: 'R$ 2.500',
    unit: 'por projeto',
    color: '#0ea5e9',
    highlight: false,
    features: ['Design no Figma', 'Responsivo mobile/desktop', 'Animações e interações', 'Deploy na Cloudflare', 'SEO básico'],
  },
  {
    icon: <Building2 size={24} />,
    title: 'Site Institucional',
    description: 'Até 5 páginas, formulário de contato, painel de conteúdo e posicionamento no Google.',
    price: 'R$ 5.500',
    unit: 'por projeto',
    color: '#6366f1',
    highlight: true,
    features: ['Tudo da Landing Page', 'Até 5 páginas', 'CMS headless', 'Formulário de contato', 'SEO completo + Analytics'],
  },
  {
    icon: <AppWindow size={24} />,
    title: 'App Web Completo',
    description: 'Sistema full stack com painel administrativo, autenticação e banco de dados.',
    price: 'R$ 10.000+',
    unit: 'por projeto',
    color: '#8b5cf6',
    highlight: false,
    features: ['Tudo do Institucional', 'Backend Java/Node.js', 'Autenticação JWT/OAuth', 'Painel administrativo', 'Docker + CI/CD'],
  },
  {
    icon: <Server size={24} />,
    title: 'API / Back-end',
    description: 'API REST robusta com Java Spring Boot, documentação Swagger e ambiente containerizado.',
    price: 'R$ 6.000+',
    unit: 'por projeto',
    color: '#10b981',
    highlight: false,
    features: ['API REST com Java', 'Spring Boot ou Quarkus', 'PostgreSQL / MySQL', 'Swagger/OpenAPI', 'Docker + testes unitários'],
  },
  {
    icon: <Wrench size={24} />,
    title: 'Suporte Mensal',
    description: 'Manutenção contínua, atualizações, correções e melhorias no seu site ou sistema.',
    price: 'R$ 800+',
    unit: 'por mês',
    color: '#f59e0b',
    highlight: false,
    features: ['Atualizações de conteúdo', 'Correções de bugs', 'Backup de código-fonte', 'Monitoramento', 'Suporte por WhatsApp'],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="servicos" ref={ref} className="py-28 relative">
      {/* Subtle orb */}
      <div
        className="orb w-[500px] h-[400px] top-0 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14">
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
            className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Serviços
          </motion.p>
          <motion.h2
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
            className="section-title"
          >
            O que eu <span className="gradient-text">entrego</span>
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
            className="section-subtitle"
          >
            Pacotes claros, preços justos e entrega do ciclo completo — do design ao deploy.
            Hora técnica: <span className="text-slate-200 font-medium">R$ 100/hora</span>.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={i * 0.1 + 3}
              className={`relative glass-card glass-card-hover rounded-2xl p-6 flex flex-col ${
                s.highlight ? 'ring-1 ring-indigo-500/40' : ''
              }`}
            >
              {s.highlight && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">
                    Mais pedido
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                {s.icon}
              </div>

              <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{s.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <Check size={13} style={{ color: s.color, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="border-t border-white/[0.06] pt-5 mt-auto">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-2xl font-black text-white">{s.price}</span>
                    <span className="text-slate-500 text-xs ml-1">{s.unit}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20tenho%20interesse%20no%20servi%C3%A7o%20de%20${encodeURIComponent(s.title)}!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:text-white"
                  style={{ borderColor: `${s.color}40`, color: s.color }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = `${s.color}15`
                    el.style.borderColor = `${s.color}80`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'transparent'
                    el.style.borderColor = `${s.color}40`
                  }}
                >
                  Solicitar via WhatsApp <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={9}
          className="mt-10 text-center"
        >
          <p className="text-slate-500 text-sm">
            Precisa de algo fora dos pacotes?{' '}
            <a
              href="https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20tenho%20um%20projeto%20personalizado!"
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              Fale comigo e montamos um orçamento personalizado.
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

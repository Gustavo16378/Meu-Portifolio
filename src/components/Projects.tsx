import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ExternalLink, Github, Clock, CheckCircle2, Wrench } from 'lucide-react'

type Status = 'live' | 'dev' | 'done'

interface Project {
  title: string
  client: string
  description: string
  tags: string[]
  status: Status
  statusLabel: string
  gradient: string
  github?: string
  link?: string
  category: 'freelance' | 'personal'
}

const projects: Project[] = [
  {
    title: 'EHL — Eletro Hidro Ltda',
    client: 'Maior construtora de pavimentação de Palmas, TO',
    description:
      'Site institucional completo com CMS headless (Strapi). Gestão de obras, portfólio de projetos, equipamentos e conteúdo dinâmico — design do zero no Figma.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Strapi', 'Cloudflare', 'Figma'],
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-sky-500/20 to-blue-600/10',
    category: 'freelance',
  },
  {
    title: 'LCM Gestão Esportiva',
    client: 'Referência em gestão esportiva no Tocantins — 14 anos, ~15 eventos/ano',
    description:
      'Site institucional com design próprio e identidade visual pensada para o segmento esportivo. Ciclo completo: wireframe, design, desenvolvimento e deploy.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Cloudflare', 'Figma'],
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-indigo-500/20 to-purple-600/10',
    category: 'freelance',
  },
  {
    title: 'orcamento-api + notifications-api',
    client: 'Microserviços — Projeto pessoal',
    description:
      'API de orçamentos com CRUD completo, paginação, soft delete e arquitetura em camadas. Integrada a um microsserviço independente que dispara e-mails transacionais via SMTP.',
    tags: ['Java', 'Spring Boot', 'PostgreSQL', 'SMTP', 'Docker', 'Swagger'],
    status: 'done',
    statusLabel: 'Concluído',
    gradient: 'from-green-500/20 to-emerald-600/10',
    github: 'https://github.com/Gustavo16378',
    category: 'personal',
  },
  {
    title: 'E-commerce API',
    client: 'Acadêmico — Tópicos em Programação I',
    description:
      'API de e-commerce em Java + Quarkus com mensageria assíncrona via RabbitMQ, documentação automática com Swagger e ambiente 100% containerizado com Docker.',
    tags: ['Java', 'Quarkus', 'RabbitMQ', 'PostgreSQL', 'Docker', 'Swagger'],
    status: 'done',
    statusLabel: 'Concluído',
    gradient: 'from-orange-500/20 to-amber-600/10',
    github: 'https://github.com/Gustavo16378',
    category: 'personal',
  },
  {
    title: 'App Tapaburaco',
    client: 'Mobile — Projeto pessoal em desenvolvimento',
    description:
      'App mobile que conecta cidadãos à prefeitura para reporte de problemas urbanos. Design próprio com estrutura preparada para expansão multiplataforma.',
    tags: ['React Native', 'Expo', 'TypeScript'],
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-rose-500/20 to-pink-600/10',
    category: 'personal',
  },
]

const statusConfig: Record<Status, { icon: React.ReactNode; color: string; bg: string }> = {
  live: {
    icon: <CheckCircle2 size={13} />,
    color: '#4ade80',
    bg: 'bg-green-500/10 border-green-500/30',
  },
  dev: {
    icon: <Clock size={13} />,
    color: '#f59e0b',
    bg: 'bg-amber-500/10 border-amber-500/30',
  },
  done: {
    icon: <CheckCircle2 size={13} />,
    color: '#60a5fa',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="projetos" ref={ref} className="py-28 relative">
      <div
        className="orb w-[500px] h-[400px] bottom-0 left-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14">
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
            className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Projetos
          </motion.p>
          <motion.h2
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
            className="section-title"
          >
            O que eu já <span className="gradient-text">construí</span>
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
            className="section-subtitle"
          >
            Projetos reais para clientes reais — e projetos pessoais que mostram profundidade técnica.
          </motion.p>
        </div>

        {/* Freelance projects */}
        <motion.p
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={3}
          className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"
        >
          <Wrench size={13} /> Freelance
        </motion.p>
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {projects.filter(p => p.category === 'freelance').map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i + 4} inView={inView} />
          ))}
        </div>

        {/* Personal projects */}
        <motion.p
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={7}
          className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"
        >
          <Github size={13} /> Projetos pessoais &amp; acadêmicos
        </motion.p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.filter(p => p.category === 'personal').map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i + 8} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project: p, index, inView }: { project: Project; index: number; inView: boolean }) {
  const sc = statusConfig[p.status]

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group"
    >
      {/* Gradient header */}
      <div className={`h-2 bg-gradient-to-r ${p.gradient.replace('/20', '').replace('/10', '')} opacity-60`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg}`}
            style={{ color: sc.color }}>
            {sc.icon}
            {p.statusLabel}
          </span>
          <div className="flex items-center gap-2">
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                <Github size={15} />
              </a>
            )}
            {p.link && (
              <a href={p.link} target="_blank" rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 transition-colors">
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-300 transition-colors">{p.title}</h3>
        <p className="text-brand-400/70 text-xs font-medium mb-3">{p.client}</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-white/[0.04] border border-white/[0.06] text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

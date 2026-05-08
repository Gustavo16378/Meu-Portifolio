import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, Github, Clock, CheckCircle2, Wrench, ImageOff, ArrowRight, Filter } from 'lucide-react'
import { projects, techIconMap, statusConfig, type Status, type Category } from '../data/projects'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
}

const statusIcons: Record<Status, React.ReactNode> = {
  live: <CheckCircle2 size={13} />,
  dev:  <Clock size={13} />,
  done: <CheckCircle2 size={13} />,
}

const statusLabels: Record<Status, string> = {
  live: 'No ar',
  dev:  'Em desenvolvimento',
  done: 'Concluído',
}

type StatusFilter = 'all' | Status
type CategoryFilter = 'all' | Category

export default function Projetos() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filtered = projects.filter((p) => {
    if (p.hidden) return false
    const matchStatus   = statusFilter === 'all'   || p.status   === statusFilter
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchStatus && matchCategory
  })

  return (
    <main className="min-h-screen pt-28 pb-20 relative overflow-hidden">
      <div
        className="orb w-[600px] h-[400px] top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="mb-12">
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
            className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Portfólio
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
            className="section-title"
          >
            Todos os <span className="gradient-text">projetos</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
            className="section-subtitle"
          >
            Projetos reais para clientes reais — e projetos pessoais que mostram profundidade técnica.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={3}
          className="flex flex-wrap items-center gap-3 mb-10"
        >
          <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-widest">
            <Filter size={13} /> Filtrar
          </span>

          <div className="flex flex-wrap gap-2">
            {(['all', 'live', 'dev', 'done'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  statusFilter === s
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {s === 'all' ? 'Todos os status' : statusLabels[s]}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          <div className="flex flex-wrap gap-2">
            {(['all', 'freelance', 'personal'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  categoryFilter === c
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {c === 'all' ? 'Todas as categorias' : c === 'freelance' ? 'Freelance' : 'Pessoal'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Count */}
        <motion.p
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={4}
          className="text-slate-600 text-xs mb-6"
        >
          {filtered.length} {filtered.length === 1 ? 'projeto' : 'projetos'} encontrado{filtered.length !== 1 ? 's' : ''}
        </motion.p>

        {/* Freelance section */}
        {filtered.some(p => p.category === 'freelance') && (
          <>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={5}
              className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"
            >
              <Wrench size={13} /> Freelance
            </motion.p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {filtered.filter(p => p.category === 'freelance').map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i + 6} inView={inView} />
              ))}
            </div>
          </>
        )}

        {/* Personal section */}
        {filtered.some(p => p.category === 'personal') && (
          <>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={5}
              className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"
            >
              <Github size={13} /> Projetos pessoais &amp; acadêmicos
            </motion.p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.filter(p => p.category === 'personal').map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i + 9} inView={inView} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24 text-slate-600">
            <p className="text-lg font-medium mb-2">Nenhum projeto encontrado</p>
            <p className="text-sm">Tente remover algum filtro.</p>
          </div>
        )}
      </div>
    </main>
  )
}

function ProjectCard({ project: p, index, inView }: { project: typeof projects[0]; index: number; inView: boolean }) {
  const sc = statusConfig[p.status]

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group"
    >
      {/* Screenshot */}
      {p.image !== undefined && (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={p.image}
            alt={`Mockup do projeto ${p.title}`}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
            }}
          />
          <div
            className="absolute inset-0 items-center justify-center flex-col gap-2"
            style={{ display: 'none', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}
          >
            <ImageOff size={28} className="text-slate-600" />
            <span className="text-slate-600 text-xs font-medium">Screenshot em breve</span>
          </div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(7,7,20,0.85) 100%)' }} />
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${p.gradient.replace('/20', '').replace('/10', '')} opacity-80`} />
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noreferrer"
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-slate-400 hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {p.image === undefined && (
        <div className={`h-0.5 bg-gradient-to-r ${p.gradient.replace('/20', '').replace('/10', '')} opacity-60`} />
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg}`}
            style={{ color: sc.color }}>
            {statusIcons[p.status]}
            {p.statusLabel}
          </span>
          <div className="flex items-center gap-2">
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                <Github size={15} />
              </a>
            )}
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 transition-colors">
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-300 transition-colors">{p.title}</h3>
        <p className="text-brand-400/70 text-xs font-medium mb-3">{p.client}</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.stack.map((tag) => {
            const tech = techIconMap[tag]
            return (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-slate-400">
                {tech?.icon && (
                  <span className="text-sm leading-none flex items-center justify-center w-3.5 h-3.5" style={{ color: tech.color }}>
                    {tech.icon}
                  </span>
                )}
                {tag}
              </span>
            )
          })}
        </div>

        <Link
          to={`/projetos/${p.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors mt-auto"
        >
          Ver case study <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
}

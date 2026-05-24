import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, Clock, CheckCircle2, ImageOff } from 'lucide-react'
import { projects, techIconMap, statusConfig, type Status } from '../data/projects'

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } },
})

const statusIcons: Record<Status, React.ReactNode> = {
  live: <CheckCircle2 size={14} />,
  dev:  <Clock size={14} />,
  done: <CheckCircle2 size={14} />,
}

export default function ProjetoDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return <Navigate to="/projetos" replace />

  const sc = statusConfig[project.status]

  return (
    <main className="min-h-screen pt-28 pb-20 relative overflow-hidden">
      <div
        className="orb w-[500px] h-[400px] top-0 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Back */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate="show" className="mb-8">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para projetos
          </Link>
        </motion.div>

        {/* Hero image */}
        <motion.div
          variants={fadeUp(1)} initial="hidden" animate="show"
          className="relative rounded-2xl overflow-hidden mb-10 glass-card"
          style={{ aspectRatio: '16/9' }}
        >
          {project.image ? (
            <>
              <img
                src={project.image}
                alt={`Mockup do projeto ${project.title}`}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                }}
              />
              <div
                className="absolute inset-0 items-center justify-center flex-col gap-3"
                style={{ display: 'none', background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(99,102,241,0.04) 100%)' }}
              >
                <ImageOff size={36} className="text-slate-600" />
                <span className="text-slate-600 text-sm">Screenshot em breve</span>
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center flex-col gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(99,102,241,0.04) 100%)' }}
            >
              <ImageOff size={36} className="text-slate-600" />
              <span className="text-slate-600 text-sm">Screenshot em breve</span>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(7,7,20,0.6) 100%)' }} />
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${project.gradient.replace('/20', '').replace('/10', '')} opacity-90`} />
        </motion.div>

        {/* Title + meta */}
        <motion.div variants={fadeUp(2)} initial="hidden" animate="show" className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${sc.bg}`}
              style={{ color: sc.color }}>
              {statusIcons[project.status]}
              {project.statusLabel}
            </span>
            <span className="text-slate-600 text-xs">
              {project.category === 'freelance' ? 'Freelance' : 'Projeto pessoal'}
            </span>
          </div>

          <h1 className="text-white font-black text-3xl md:text-4xl mb-2 leading-tight">{project.title}</h1>
          <p className="text-brand-400/80 text-sm font-medium">{project.client}</p>
        </motion.div>

        {/* Links */}
        {(project.liveUrl || project.github) && (
          <motion.div variants={fadeUp(3)} initial="hidden" animate="show" className="flex flex-wrap gap-3 mb-10">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              >
                <ExternalLink size={15} />
                Ver site ao vivo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="outline-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              >
                <Github size={15} />
                Ver no GitHub
              </a>
            )}
          </motion.div>
        )}

        {/* Description */}
        <motion.div variants={fadeUp(4)} initial="hidden" animate="show" className="glass-card rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Sobre o projeto</h2>
          <p className="text-slate-400 leading-relaxed">{project.longDescription}</p>
        </motion.div>

        {/* Highlights */}
        {project.highlights.length > 0 && (
          <motion.div variants={fadeUp(5)} initial="hidden" animate="show" className="glass-card rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-white font-bold text-lg mb-4">Destaques técnicos</h2>
            <ul className="flex flex-col gap-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-brand-400" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Stack */}
        <motion.div variants={fadeUp(6)} initial="hidden" animate="show" className="glass-card rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-white font-bold text-lg mb-4">Stack utilizada</h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tag) => {
              const tech = techIconMap[tag]
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:border-white/[0.16] transition-colors"
                >
                  {tech?.icon && (
                    <span className="text-base leading-none flex items-center justify-center w-4 h-4" style={{ color: tech.color }}>
                      {tech.icon}
                    </span>
                  )}
                  {tag}
                </span>
              )
            })}
          </div>
        </motion.div>

        {/* Footer nav */}
        <motion.div variants={fadeUp(7)} initial="hidden" animate="show" className="flex justify-end">
          <a
            href="https://wa.me/5563991114551?text=Ol%C3%A1%20Gustavo%2C%20vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20um%20or%C3%A7amento!"
            target="_blank"
            rel="noreferrer"
            className="glow-btn px-5 py-2.5 rounded-xl text-sm"
          >
            Solicitar orçamento
          </a>
        </motion.div>
      </div>
    </main>
  )
}

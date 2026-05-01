import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Code2, Cpu, Layers, MapPin, GraduationCap } from 'lucide-react'

const stats = [
  { value: '3 anos', label: 'Desenvolvendo', icon: <Code2 size={18} /> },
  { value: '100%', label: 'Design → Deploy', icon: <Layers size={18} /> },
  { value: '30+ horas', label: 'de código por semana', icon: <Cpu size={18} /> },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="sobre" ref={ref} className="py-16 lg:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
              className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Sobre mim
            </motion.p>
            <motion.h2
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
              className="section-title mb-6"
            >
              Full Stack Developer<br />
              <span className="gradient-text">apaixonado por tecnologia</span>
            </motion.h2>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
              className="text-slate-400 leading-relaxed mb-5"
            >
              Sou desenvolvedor Full Stack com foco em <span className="text-slate-200">Java + Spring Boot</span> no back-end
              e <span className="text-slate-200">React + TypeScript</span> no front-end. Comecei a explorar tecnologia aos 13 anos —
              redes, hardware, programação — e nunca mais parei.
            </motion.p>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={3}
              className="text-slate-400 leading-relaxed mb-5"
            >
              Tenho 3 anos de desenvolvimento de aplicações e quase 2 anos estudando Java com profundidade: POO, SOLID, arquitetura em camadas e boas práticas.
              No front-end cuido também do design dos projetos no Figma, entregando o ciclo completo — do wireframe ao deploy.
            </motion.p>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={4}
              className="text-slate-400 leading-relaxed mb-8"
            >
              Uso IA (<span className="text-slate-200">Claude Code</span> e <span className="text-slate-200">GitHub Copilot Pro</span>) como parte do
              fluxo de trabalho — não como muleta, mas para revisar código, acelerar entregas e manter qualidade.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={5}
              className="flex flex-col gap-2.5 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-400 shrink-0" />
                Palmas, Tocantins
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-brand-400 shrink-0" />
                Bacharelado em Sistemas de Informação — UNITINS
              </div>
            </motion.div>
          </div>

          {/* Right — card */}
          <motion.div
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
          >
            {/* Profile card */}
            <div className="glass-card rounded-2xl p-8 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.06] to-indigo-500/[0.03]" />
              <div className="relative z-10">
                {/* Avatar placeholder */}
                <h3 className="text-white font-bold text-xl mb-1">Gustavo Barbosa Lima</h3>
                <p className="text-brand-400 text-sm font-medium mb-4">Desenvolvedor Full Stack</p>
                <p className="text-slate-500 text-xs font-mono">
                  Java · Spring Boot · React · TypeScript
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={3 + i * 0.5}
                  className="glass-card glass-card-hover rounded-xl p-4 text-center"
                >
                  <div className="text-brand-400 flex justify-center mb-2">{s.icon}</div>
                  <div className="text-white font-bold text-lg leading-tight">{s.value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Current work */}
            <div className="mt-3 glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div>
                <p className="text-slate-300 text-sm font-medium">Atualmente</p>
                <p className="text-slate-500 text-xs">Dev Full Stack @ DS Web Dev · Suporte Técnico @ Platano-Solution</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

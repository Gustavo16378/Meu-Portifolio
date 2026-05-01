import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  SiReact, SiTypescript, SiJavascript, SiTailwindcss, SiVite,
  SiSpring, SiNodedotjs, SiPostgresql, SiMysql,
  SiDocker, SiGit, SiGithub, SiCloudflare, SiFigma, SiPostman,
  SiRabbitmq, SiExpo, SiSwagger,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'

interface Skill {
  name: string
  icon: React.ReactNode
  color: string
}

interface SkillGroup {
  category: string
  color: string
  skills: Skill[]
}

const skillGroups: SkillGroup[] = [
  {
    category: 'Front-end',
    color: '#61DAFB',
    skills: [
      { name: 'React', icon: <SiReact />, color: '#61DAFB' },
      { name: 'TypeScript', icon: <SiTypescript />, color: '#3178C6' },
      { name: 'JavaScript', icon: <SiJavascript />, color: '#F7DF1E' },
      { name: 'Tailwind CSS', icon: <SiTailwindcss />, color: '#06B6D4' },
      { name: 'Vite', icon: <SiVite />, color: '#646CFF' },
    ],
  },
  {
    category: 'Back-end',
    color: '#6DB33F',
    skills: [
      { name: 'Java', icon: <FaJava />, color: '#ED8B00' },
      { name: 'Spring Boot', icon: <SiSpring />, color: '#6DB33F' },
      { name: 'Quarkus', icon: <span className="font-bold text-[10px]">QK</span>, color: '#4695EB' },
      { name: 'Node.js', icon: <SiNodedotjs />, color: '#339933' },
      { name: 'REST APIs', icon: <span className="font-bold text-[10px]">API</span>, color: '#0ea5e9' },
      { name: 'JWT / OAuth', icon: <span className="font-bold text-[10px]">JWT</span>, color: '#7c3aed' },
      { name: 'RabbitMQ', icon: <SiRabbitmq />, color: '#FF6600' },
    ],
  },
  {
    category: 'Mobile',
    color: '#61DAFB',
    skills: [
      { name: 'React Native', icon: <SiReact />, color: '#61DAFB' },
      { name: 'Expo', icon: <SiExpo />, color: '#FFFFFF' },
    ],
  },
  {
    category: 'Banco de Dados',
    color: '#4169E1',
    skills: [
      { name: 'PostgreSQL', icon: <SiPostgresql />, color: '#4169E1' },
      { name: 'MySQL', icon: <SiMysql />, color: '#4479A1' },
    ],
  },
  {
    category: 'DevOps & Infra',
    color: '#2496ED',
    skills: [
      { name: 'Docker', icon: <SiDocker />, color: '#2496ED' },
      { name: 'Git', icon: <SiGit />, color: '#F05032' },
      { name: 'GitHub', icon: <SiGithub />, color: '#FFFFFF' },
      { name: 'Cloudflare', icon: <SiCloudflare />, color: '#F38020' },
    ],
  },
  {
    category: 'Design & Tools',
    color: '#F24E1E',
    skills: [
      { name: 'Figma', icon: <SiFigma />, color: '#F24E1E' },
      { name: 'Swagger', icon: <SiSwagger />, color: '#85EA2D' },
      { name: 'Postman', icon: <SiPostman />, color: '#FF6C37' },
      { name: 'SOLID', icon: <span className="font-bold text-[10px]">SO</span>, color: '#0ea5e9' },
      { name: 'MVC', icon: <span className="font-bold text-[10px]">MVC</span>, color: '#6366f1' },
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="skills" ref={ref} className="py-28 relative">
      <div
        className="orb w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14">
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={0}
            className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Habilidades
          </motion.p>
          <motion.h2
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={1}
            className="section-title"
          >
            Stack <span className="gradient-text">técnico</span>
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={2}
            className="section-subtitle"
          >
            Tecnologias que uso no dia a dia, do front-end ao deploy.
          </motion.p>
        </div>

        {/* Skill groups */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.category}
              variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={gi * 0.15 + 3}
              className="glass-card rounded-2xl p-6"
            >
              {/* Category header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 rounded-full" style={{ background: group.color }} />
                <span className="text-white font-semibold text-sm">{group.category}</span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-default group"
                  >
                    <span
                      className="text-base leading-none flex items-center justify-center w-4 h-4"
                      style={{ color: skill.color }}
                    >
                      {skill.icon}
                    </span>
                    <span className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture highlight */}
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={10}
          className="mt-6 glass-card rounded-2xl p-6"
        >
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">Arquitetura & Boas Práticas</p>
          <div className="flex flex-wrap gap-2">
            {['SOLID', 'Clean Code', 'Controller/Service/Repository', 'Microsserviços', 'MVC', 'DDD (fundamentos)', 'JUnit', 'Testes unitários', 'E2E', 'Swagger/OpenAPI', 'SMTP transacional', 'JPA/Hibernate'].map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-lg text-xs bg-brand-500/[0.06] border border-brand-500/20 text-brand-300">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

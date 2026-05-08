import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="orb w-[600px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 text-center max-w-md">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4"
        >
          Erro 404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-black text-6xl md:text-8xl mb-4 leading-none"
          style={{ textShadow: '0 0 60px rgba(14,165,233,0.2)' }}
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-slate-400 text-lg mb-2"
        >
          Página não encontrada
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-slate-600 text-sm mb-10"
        >
          A rota que você acessou não existe. Verifique o endereço ou volte para o início.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/" className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
            <Home size={16} />
            Ir para o início
          </Link>
          <Link to="/projetos" className="outline-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
            <ArrowLeft size={16} />
            Ver projetos
          </Link>
        </motion.div>
      </div>
    </main>
  )
}

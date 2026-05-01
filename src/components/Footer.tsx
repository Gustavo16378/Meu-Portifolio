import { Github, Linkedin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="./photos/logo.jpeg"
            alt="GustavoDev logo"
            className="h-10 w-auto rounded-lg object-contain"
          />
        </div>

        <p className="text-slate-600 text-xs text-center">
          © 2026 Gustavo Dev · Desenvolvido com React + TypeScript + Tailwind
        </p>

        <div className="flex items-center gap-3">
          <a href="https://github.com/Gustavo16378" target="_blank" rel="noreferrer" aria-label="GitHub"
            className="text-slate-600 hover:text-white transition-colors">
            <Github size={16} />
          </a>
          <a href="https://linkedin.com/in/gustavo-barbosa-lima-341886278" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="text-slate-600 hover:text-white transition-colors">
            <Linkedin size={16} />
          </a>
          <a href="https://wa.me/5563991114551" target="_blank" rel="noreferrer" aria-label="WhatsApp"
            className="text-slate-600 hover:text-white transition-colors">
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}

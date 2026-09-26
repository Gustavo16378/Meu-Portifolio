import { useEffect, useRef } from 'react'
import type { SiteVideo as SiteVideoData } from '../data/projects'
import { prefersReducedMotion } from '../motion/reducedMotion'

interface SiteVideoProps {
  video: SiteVideoData
  label: string
  className?: string
}

/**
 * O site rodando. Não baixa nada antes da hora (preload none, só o poster), dá play quando
 * entra na tela e pausa quando sai. Em reduced-motion fica no poster.
 */
export function SiteVideo({ video, label, className = '' }: SiteVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // O React não garante o atributo muted no DOM; sem ele o navegador bloqueia o play automático.
    el.muted = true
    if (prefersReducedMotion()) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => undefined)
        } else {
          el.pause()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.pause()
    }
  }, [])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={video.poster}
      width={video.width}
      height={video.height}
      aria-label={label}
      className={`block h-full w-full object-cover object-top ${className}`}
    >
      {video.webm && <source src={video.webm} type="video/webm" />}
      <source src={video.mp4} type="video/mp4" />
    </video>
  )
}

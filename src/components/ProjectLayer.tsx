import type { CSSProperties } from 'react'
import type { Project } from '../data/projects'

export type AccentStyle = CSSProperties & Record<'--accent', string>

// Borda de 1px na cor de acento (compensada pela escala via --ring) e sombra suave.
export const frameBox =
  'relative size-full overflow-hidden bg-surface [box-shadow:0_0_0_var(--ring,1px)_var(--frame-edge),var(--shadow-frame)]'

// Anel do tamanho da borda, onde passa o brilho.
export const ringMask: CSSProperties = {
  inset: 'calc(var(--ring, 1px) * -1)',
  padding: 'var(--ring, 1px)',
  mask: 'linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)',
  WebkitMask: 'linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)',
  WebkitMaskComposite: 'xor',
}

interface LayerProps {
  project: Project
  kind: 'desktop' | 'mobile'
  playable: boolean
  /** No palco as camadas nascem apagadas e o controlador acende a do projeto atual; nos blocos cada frame é de um projeto só. */
  visible?: boolean
  layerRef?: (el: HTMLDivElement | null) => void
  videoRef?: (el: HTMLVideoElement | null) => void
}

/** Uma camada do frame: o print, ou o vídeo quando a mídia do projeto é vídeo e este frame é o que toca. */
export function ProjectLayer({ project, kind, playable, visible = false, layerRef, videoRef }: LayerProps) {
  const label = `${project.name} no ${kind === 'desktop' ? 'desktop' : 'celular'}`
  const print = project.prints[kind]
  const video = project.videos[kind]
  return (
    <div ref={layerRef} className={`absolute inset-0 ${visible ? '' : 'opacity-0'}`}>
      {project.media === 'video' && playable ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-label={label}
          className="block size-full object-cover object-top"
        />
      ) : project.media === 'video' ? (
        <img
          src={video.poster}
          alt={label}
          width={video.width}
          height={video.height}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-top"
        />
      ) : (
        <picture>
          <source
            srcSet={`${print.webpSmall} ${print.smallWidth}w, ${print.webp} ${print.width}w`}
            sizes={kind === 'desktop' ? '(min-width: 768px) 68vw, 96vw' : '(min-width: 768px) 20vw, 60vw'}
            type="image/webp"
          />
          <img
            src={print.png}
            alt={label}
            width={print.width}
            height={print.height}
            loading="lazy"
            decoding="async"
            className="block size-full object-cover object-top"
          />
        </picture>
      )}
    </div>
  )
}

import type { ProjectId } from '../data/projects'

/**
 * Trechos de scroll da seção de projetos, em alturas de tela.
 * hold: projeto parado pra olhar; trans: viagem até o próximo; end: fundo voltando pro preto no fim.
 * A altura da seção (Projects.tsx) e os marcadores seguem os mesmos números.
 */
export const SEGMENTS = {
  desktop: { hold: 1.2, trans: 0.7, end: 0.5 },
  mobile: { hold: 0.5, trans: 0.5, end: 0.4 },
} as const

export type Segments = (typeof SEGMENTS)[keyof typeof SEGMENTS]

/** Centro, largura e rotação de um frame, em px da tela. */
export interface FrameRect {
  cx: number
  cy: number
  w: number
  rot: number
}

export interface Composition {
  desk: FrameRect
  mob: FrameRect
  /** Qual frame tem o vídeo (só um toca); o outro mostra o poster. */
  hero: 'desktop' | 'mobile'
}

const DESK_RATIO = 1280 / 800
const MOB_RATIO = 390 / 844

/** Celular sobreposto no canto inferior direito do frame desktop, um pouco pra fora. */
function cornerOutside(d: FrameRect, share = 0.17): FrameRect {
  const dh = d.w / DESK_RATIO
  const w = d.w * share
  const h = w / MOB_RATIO
  return { cx: d.cx + d.w / 2 + d.w * 0.03 - w / 2, cy: d.cy + dh / 2 + dh * 0.1 - h / 2, w, rot: 0 }
}

/** Celular pequeno dentro do canto inferior direito (frame quase em tela cheia). */
function cornerInside(d: FrameRect, share = 0.11): FrameRect {
  const dh = d.w / DESK_RATIO
  const w = d.w * share
  const h = w / MOB_RATIO
  return { cx: d.cx + d.w / 2 - d.w * 0.025 - w / 2, cy: d.cy + dh / 2 - dh * 0.05 - h / 2, w, rot: 0 }
}

/** Composição de cada projeto no desktop, em px, a partir do tamanho do palco. */
function desktop(id: ProjectId, vw: number, vh: number): Composition {
  const fit = (shareW: number, shareH: number) => Math.min(vw * shareW, vh * shareH * DESK_RATIO)
  switch (id) {
    case 'stewer': {
      // Texto à esquerda, frame à direita.
      const w = fit(0.62, 0.7)
      const desk = { cx: vw * 0.96 - w / 2, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk), hero: 'desktop' }
    }
    case 'autoria': {
      // Frame à esquerda, mais largo; texto à direita.
      const w = fit(0.68, 0.72)
      const desk = { cx: vw * 0.05 + w / 2, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk, 0.15), hero: 'desktop' }
    }
    case 'monte-vinhedo': {
      // Frame gigante no centro, quase a tela toda.
      const w = fit(0.92, 0.86)
      const desk = { cx: vw * 0.5, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerInside(desk), hero: 'desktop' }
    }
    case 'torra': {
      // O celular é o protagonista, grande no centro; o desktop atrás, menor e inclinado.
      const mh = vh * 0.6
      const mob = { cx: vw * 0.5, cy: vh * 0.38, w: mh * MOB_RATIO, rot: 0 }
      const desk = { cx: vw * 0.5, cy: vh * 0.38, w: fit(0.44, 0.46), rot: 6 }
      return { desk, mob, hero: 'mobile' }
    }
    case 'cleane': {
      // Metade e metade: frame à esquerda, texto à direita.
      const w = fit(0.44, 0.72)
      const desk = { cx: vw * 0.27, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk, 0.2), hero: 'desktop' }
    }
  }
}

/** No mobile todos empilham igual: desktop (poster) em cima, celular com o vídeo embaixo, texto depois. */
function mobile(vw: number, vh: number): Composition {
  const left = vw * 0.12
  const dw = vw * 0.8
  const dh = dw / DESK_RATIO
  const desk = { cx: left + dw / 2, cy: vh * 0.1 + dh / 2, w: dw, rot: 0 }
  const mh = Math.min(vh * 0.32, vw * 0.7)
  const mob = { cx: left + dw / 2, cy: desk.cy + dh / 2 + vh * 0.02 + mh / 2, w: mh * MOB_RATIO, rot: 0 }
  return { desk, mob, hero: 'mobile' }
}

/** Qual frame tem o vídeo: no desktop, o desktop (a Torra é a exceção); no mobile, sempre o celular. */
export function heroOf(id: ProjectId, isDesktop: boolean): Composition['hero'] {
  return isDesktop && id !== 'torra' ? 'desktop' : 'mobile'
}

export function compose(id: ProjectId, vw: number, vh: number, isDesktop: boolean): Composition {
  return isDesktop ? desktop(id, vw, vh) : mobile(vw, vh)
}

/** Onde fica o texto de cada projeto no desktop. No mobile, todos embaixo. */
export const TEXT_PLACEMENT: Record<ProjectId, string> = {
  stewer: 'md:top-1/2 md:bottom-auto md:left-0 md:w-[30vw] md:-translate-y-1/2 md:pl-24',
  autoria: 'md:top-1/2 md:right-[3vw] md:bottom-auto md:left-auto md:w-[21vw] md:-translate-y-1/2 md:p-0',
  'monte-vinhedo':
    'md:top-[calc(50svh-min(92vw,137.6svh)*0.3125+3.5svh)] md:right-auto md:bottom-auto md:left-[calc((100vw-min(92vw,137.6svh))/2+2.4vw)] md:w-auto md:p-0',
  torra: 'md:right-auto md:bottom-[4svh] md:left-1/2 md:w-[44vw] md:-translate-x-1/2 md:p-0 md:text-center',
  cleane: 'md:top-1/2 md:right-[4vw] md:bottom-auto md:left-auto md:w-[40vw] md:-translate-y-1/2 md:p-0',
}

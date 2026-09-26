import type { ProjectId } from '../data/projects'

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
  /** Quais frames aparecem nesta composição. */
  deskOn: boolean
  mobOn: boolean
  /** Qual frame tem o vídeo quando a mídia é vídeo (só um toca); o outro mostra o poster. */
  hero: 'desktop' | 'mobile'
}

const DESK_RATIO = 1600 / 1000
const MOB_RATIO = 480 / 1039

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

/** Um frame escondido fica parado no centro, pequeno, pra aparecer dali se a próxima composição usar. */
const parked = (vw: number, vh: number, w: number): FrameRect => ({ cx: vw / 2, cy: vh / 2, w, rot: 0 })

function desktop(id: ProjectId, vw: number, vh: number): Composition {
  const fit = (shareW: number, shareH: number) => Math.min(vw * shareW, vh * shareH * DESK_RATIO)
  switch (id) {
    case 'stewer': {
      // Texto à esquerda, frame à direita.
      const w = fit(0.62, 0.7)
      const desk = { cx: vw * 0.96 - w / 2, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk), deskOn: true, mobOn: true, hero: 'desktop' }
    }
    case 'autoria': {
      // Frame à esquerda, mais largo; texto à direita.
      const w = fit(0.68, 0.72)
      const desk = { cx: vw * 0.05 + w / 2, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk, 0.15), deskOn: true, mobOn: true, hero: 'desktop' }
    }
    case 'monte-vinhedo': {
      // Frame gigante no centro, quase a tela toda.
      const w = fit(0.92, 0.86)
      const desk = { cx: vw * 0.5, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerInside(desk), deskOn: true, mobOn: true, hero: 'desktop' }
    }
    case 'torra': {
      // O celular é o protagonista, grande no centro; o desktop atrás, menor e inclinado.
      const mh = vh * 0.6
      const mob = { cx: vw * 0.5, cy: vh * 0.38, w: mh * MOB_RATIO, rot: 0 }
      const desk = { cx: vw * 0.5, cy: vh * 0.38, w: fit(0.44, 0.46), rot: 6 }
      return { desk, mob, deskOn: true, mobOn: true, hero: 'mobile' }
    }
    case 'cleane': {
      // Metade e metade: frame à esquerda, texto à direita.
      const w = fit(0.44, 0.72)
      const desk = { cx: vw * 0.27, cy: vh * 0.5, w, rot: 0 }
      return { desk, mob: cornerOutside(desk, 0.2), deskOn: true, mobOn: true, hero: 'desktop' }
    }
  }
}

/** Mobile: versão simplificada de cada composição, um frame só. */
function mobile(id: ProjectId, vw: number, vh: number): Composition {
  const deskH = (w: number) => w / DESK_RATIO
  switch (id) {
    case 'stewer': {
      // Print desktop em cima, texto embaixo.
      const w = vw * 0.84
      const desk = { cx: vw * 0.08 + w / 2, cy: vh * 0.14 + deskH(w) / 2, w, rot: 0 }
      return { desk, mob: parked(vw, vh, vw * 0.3), deskOn: true, mobOn: false, hero: 'desktop' }
    }
    case 'autoria': {
      // Print desktop grande, texto sobreposto na parte de baixo dele.
      const w = vw * 0.96
      const desk = { cx: vw / 2, cy: vh * 0.36, w, rot: 0 }
      return { desk, mob: parked(vw, vh, vw * 0.3), deskOn: true, mobOn: false, hero: 'desktop' }
    }
    case 'monte-vinhedo': {
      // Print quase em tela cheia (o do celular, que tem a proporção da tela), nome sobreposto.
      const w = Math.min(vw * 0.84, vh * 0.84 * MOB_RATIO)
      const mob = { cx: vw / 2, cy: vh / 2, w, rot: 0 }
      return { desk: parked(vw, vh, vw * 0.5), mob, deskOn: false, mobOn: true, hero: 'mobile' }
    }
    case 'torra': {
      // Print do celular grande no centro, texto embaixo.
      const h = vh * 0.56
      const mob = { cx: vw / 2, cy: vh * 0.08 + h / 2, w: h * MOB_RATIO, rot: 0 }
      return { desk: parked(vw, vh, vw * 0.5), mob, deskOn: false, mobOn: true, hero: 'mobile' }
    }
    case 'cleane': {
      // Texto em cima, print embaixo.
      const w = vw * 0.84
      const desk = { cx: vw * 0.08 + w / 2, cy: vh * 0.9 - deskH(w) / 2, w, rot: 0 }
      return { desk, mob: parked(vw, vh, vw * 0.3), deskOn: true, mobOn: false, hero: 'desktop' }
    }
  }
}

export function compose(id: ProjectId, vw: number, vh: number, isDesktop: boolean): Composition {
  return isDesktop ? desktop(id, vw, vh) : mobile(id, vw, vh)
}

/** Qual frame tem o vídeo. No mobile os vídeos desktop nunca carregam. */
export function heroOf(id: ProjectId, isDesktop: boolean): Composition['hero'] {
  if (isDesktop) return id === 'torra' ? 'mobile' : 'desktop'
  return 'mobile'
}

/** Como o texto de cada projeto aparece e onde fica. */
export interface TextLayout {
  /** Só nome e links, sobre o print (Monte Vinhedo). */
  overlay: { mobile: boolean; desktop: boolean }
  /** Sombra pra ler por cima do print. */
  shadow: { mobile: boolean; desktop: boolean }
  center: boolean
  className: string
  /** Altura do nome em contorno, escolhida pra não cruzar o texto. */
  name: string
}

export const TEXT_LAYOUT: Record<ProjectId, TextLayout> = {
  stewer: {
    overlay: { mobile: false, desktop: false },
    shadow: { mobile: false, desktop: false },
    center: false,
    className:
      // Mobile: logo abaixo do print (topo 14svh + altura 84vw/1,6).
      'inset-x-0 top-[calc(14svh+52.5vw+5svh)] px-4 pl-12 md:top-1/2 md:bottom-auto md:left-0 md:w-[30vw] md:-translate-y-1/2 md:pl-24',
    name: 'top-[28%] md:top-[84%]',
  },
  autoria: {
    overlay: { mobile: false, desktop: false },
    shadow: { mobile: true, desktop: false },
    center: false,
    className:
      'inset-x-0 top-[calc(36svh+18vw)] px-4 pl-10 md:top-1/2 md:right-[3vw] md:left-auto md:w-[21vw] md:-translate-y-1/2 md:p-0',
    name: 'top-[13%] md:top-[84%]',
  },
  'monte-vinhedo': {
    overlay: { mobile: true, desktop: true },
    shadow: { mobile: true, desktop: true },
    center: false,
    className:
      // Mobile: no canto de baixo do print (o topo dele já tem o título do site). Desktop: canto de cima.
      'bottom-[calc(50svh-min(181.8vw,84svh)/2+3svh)] left-[calc(50vw-min(84vw,38.8svh)/2+4vw)] right-[calc(50vw-min(84vw,38.8svh)/2+4vw)] md:top-[calc(50svh-min(92vw,137.6svh)*0.3125+3.5svh)] md:right-auto md:bottom-auto md:left-[calc((100vw-min(92vw,137.6svh))/2+2.4vw)] md:w-auto',
    name: 'top-[50%] md:top-[84%]',
  },
  torra: {
    overlay: { mobile: false, desktop: false },
    shadow: { mobile: false, desktop: false },
    center: true,
    className:
      'inset-x-0 bottom-[4svh] px-6 text-center md:right-auto md:bottom-[4svh] md:left-1/2 md:w-[44vw] md:-translate-x-1/2 md:p-0',
    name: 'top-[36%] md:top-[36%]',
  },
  cleane: {
    overlay: { mobile: false, desktop: false },
    shadow: { mobile: false, desktop: false },
    center: false,
    className:
      'inset-x-0 top-[11svh] px-4 pl-12 md:top-1/2 md:right-[4vw] md:left-auto md:w-[40vw] md:-translate-y-1/2 md:p-0',
    name: 'top-[72%] md:top-[84%]',
  },
}

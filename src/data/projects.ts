export type ProjectId = 'stewer' | 'autoria' | 'monte-vinhedo' | 'torra' | 'cleane'

export interface SiteVideo {
  /** Opcional: sem ele o navegador usa o MP4. */
  webm?: string
  mp4: string
  poster: string
  width: number
  height: number
}

export interface Print {
  webp: string
  /** Mesma imagem em largura menor, pro srcset. */
  webpSmall: string
  smallWidth: number
  png: string
  width: number
  height: number
}

/**
 * O que aparece dentro dos frames: print (imagem) ou video (o site rodando).
 * A infraestrutura de vídeo (carregar perto, um tocando por vez, fallback, só poster em conexão lenta) está pronta;
 * pra ligar, troque aqui ou em um projeto só.
 */
export type Media = 'print' | 'video'
export const DEFAULT_MEDIA: Media = 'print'

export interface ProjectSheet {
  /** Duas ou três linhas. */
  architecture: string
  decisions: [string, string, string]
  repo: { label: string; url: string }
  /** Aviso ao lado do link (ex.: código privado). */
  repoNote?: string
}

export interface Project {
  id: ProjectId
  name: string
  year: number
  kind: 'cliente' | 'conceito próprio'
  url: string
  /** Uma linha do que é. */
  line: string
  stack: string[]
  /** Cor de acento do ambiente (CSS var de tokens.css). */
  accent: string
  /** Fundo do ambiente (CSS var de tokens.css). */
  background: string
  media: Media
  /** Prints do site (public/prints/). */
  prints: { desktop: Print; mobile: Print }
  /** O site rodando, gravado em desktop e mobile (public/videos/). */
  videos: { desktop: SiteVideo; mobile: SiteVideo }
  sheet: ProjectSheet
}

const video = (id: string, kind: 'desktop' | 'mobile', width: number, height: number, webm: boolean): SiteVideo => ({
  webm: webm ? `/videos/${id}-${kind}.webm` : undefined,
  mp4: `/videos/${id}-${kind}.mp4`,
  poster: `/videos/${id}-${kind}-poster.jpg`,
  width,
  height,
})

// Os WebM mobile atuais decodificam com as primeiras linhas verdes; o mobile usa só o MP4 até serem reexportados.
const videos = (id: string): Project['videos'] => ({
  desktop: video(id, 'desktop', 1280, 800, true),
  mobile: video(id, 'mobile', 390, 844, false),
})

const prints = (id: string): Project['prints'] => ({
  desktop: {
    webp: `/prints/${id}-desktop.webp`,
    webpSmall: `/prints/${id}-desktop-800.webp`,
    smallWidth: 800,
    png: `/prints/${id}-desktop.png`,
    width: 1600,
    height: 1000,
  },
  mobile: {
    webp: `/prints/${id}-mobile.webp`,
    webpSmall: `/prints/${id}-mobile-240.webp`,
    smallWidth: 240,
    png: `/prints/${id}-mobile.png`,
    width: 480,
    height: 1039,
  },
})

const github = { label: 'github', url: 'https://github.com/Gustavo16378' }

// Ordem da seção 03: dourado, âmbar, vinho, laranja, verde.
export const projects: Project[] = [
  {
    id: 'stewer',
    name: 'Stewer Gabriel',
    year: 2025,
    kind: 'cliente',
    url: 'https://stewergabriel.com',
    line: 'Site de visagista e consultor de imagem em Palmas.',
    stack: ['react', 'typescript', 'tailwind', 'vite', 'cloudflare'],
    accent: 'var(--c-stewer)',
    background: 'var(--c-stewer-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('stewer'),
    videos: videos('stewer'),
    sheet: {
      architecture:
        'Site estático em React e TypeScript, empacotado com Vite e servido pelo Cloudflare Pages. O agendamento vai virar um app à parte: API em Quarkus com PostgreSQL e app em React Native com Expo, ainda em desenvolvimento.',
      decisions: [
        'Site estático no Cloudflare Pages: carrega rápido e não tem servidor pra manter.',
        'Tailwind com tokens de cor próprios, pro dourado e o preto ficarem iguais em todas as páginas.',
        'Agendamento fora do site, num sistema próprio, pro site continuar leve e o sistema crescer sem mexer nele.',
      ],
      repo: github,
      repoNote: 'código privado, projeto de cliente',
    },
  },
  {
    id: 'autoria',
    name: 'AUTORIA.',
    year: 2026,
    kind: 'conceito próprio',
    url: 'https://autoria-6kz.pages.dev',
    line: 'Concessionária de carros com fotos tratadas em pipeline próprio.',
    stack: ['react', 'typescript', 'playwright', 'rembg'],
    accent: 'var(--c-autoria)',
    background: 'var(--c-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('autoria'),
    videos: videos('autoria'),
    sheet: {
      architecture:
        'Front em React e TypeScript. As fotos dos carros passam por um pipeline antes de entrar no site: Playwright coleta as imagens e o rembg tira o fundo.',
      decisions: [
        'Tratamento de foto automatizado, pra trocar o estoque sem editar imagem na mão.',
        'Carros sem fundo, pro modelo ficar sozinho na tela e o layout mandar na composição.',
        'Imagens leves e carregadas sob demanda, pra página continuar rápida com muitas fotos.',
      ],
      repo: github,
    },
  },
  {
    id: 'monte-vinhedo',
    name: 'Monte Vinhedo',
    year: 2026,
    kind: 'conceito próprio',
    url: 'https://monte-vinhedo.pages.dev',
    line: 'Vinícola boutique de vinhos de altitude.',
    stack: ['react', 'gsap'],
    accent: 'var(--c-vinhedo)',
    background: 'var(--c-vinhedo-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('monte-vinhedo'),
    videos: videos('monte-vinhedo'),
    sheet: {
      architecture:
        'One page em React com animações em GSAP ligadas ao scroll. Publicado no Cloudflare Pages.',
      decisions: [
        'Animação presa ao scroll com ScrollTrigger, pra o ritmo seguir a leitura e voltar junto.',
        'Paleta vinho e rosé fechada em poucas cores, pra o site ter cara de rótulo.',
        'Imagens em WebP e carregadas sob demanda, pra as seções pesadas não travarem o celular.',
      ],
      repo: github,
    },
  },
  {
    id: 'torra',
    name: 'TORRA',
    year: 2026,
    kind: 'conceito próprio',
    url: 'https://torra-cafe.pages.dev',
    line: 'Cafeteria de torra própria.',
    stack: ['react', 'typescript', 'tailwind'],
    accent: 'var(--c-torra)',
    background: 'var(--c-torra-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('torra'),
    videos: videos('torra'),
    sheet: {
      architecture: 'Site em React e TypeScript com Tailwind, publicado no Cloudflare Pages.',
      decisions: [
        'Componentes pequenos e reaproveitados entre cardápio e página da loja.',
        'Tailwind com tokens de cor da marca, marrom e laranja, sem cor solta no código.',
        'Layout pensado primeiro pro celular, que é onde o cliente de cafeteria abre o site.',
      ],
      repo: github,
    },
  },
  {
    id: 'cleane',
    name: 'Cleane Barbosa',
    year: 2025,
    kind: 'cliente',
    url: 'https://cleanebarbosa.com.br',
    line: 'Site de psicanalista e terapeuta EFT.',
    stack: ['react', 'typescript', 'tailwind', 'cloudflare'],
    accent: 'var(--c-cleane)',
    background: 'var(--c-cleane-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('cleane'),
    videos: videos('cleane'),
    sheet: {
      architecture: 'Site institucional em React e TypeScript com Tailwind, servido pelo Cloudflare Pages.',
      decisions: [
        'Visual calmo e pouco movimento, porque quem chega ali quer confiança, não efeito.',
        'Contato direto pelo WhatsApp em todas as seções, sem formulário no meio do caminho.',
        'Site estático, rápido de abrir e sem servidor pra manter.',
      ],
      repo: github,
      repoNote: 'código privado, projeto de cliente',
    },
  },
]

export const projectById = (id: ProjectId): Project => {
  const p = projects.find((x) => x.id === id)
  if (!p) throw new Error(`projeto ${id} não existe`)
  return p
}

/** Outros projetos no ar (seção 04). Miniatura opcional: sem print, a lista mostra as iniciais. */
export interface OtherProject {
  name: string
  kind: 'cliente' | 'projeto em grupo'
  year: number
  /** O que é, em poucas palavras. */
  line: string
  stack: string[]
  url?: string
  thumb?: { webp: string; png: string; width: number; height: number }
}

export const otherProjects: OtherProject[] = [
  {
    name: 'Tina Aires',
    kind: 'cliente',
    year: 2025,
    line: 'site de neuropsicopedagoga, com SEO técnico completo',
    stack: ['react'],
    url: 'https://tinaaires.com.br',
  },
  {
    name: 'Suelen Pratas e Perfumaria',
    kind: 'cliente',
    year: 2025,
    line: 'loja de semijoias e perfumaria',
    stack: ['react'],
    url: 'https://suelen.pages.dev',
  },
  {
    name: 'ONG Arte de Amar',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'one page com animações em GSAP',
    stack: ['react', 'gsap'],
    url: 'https://arte-de-amar-site.pages.dev',
  },
  {
    name: 'FinControl',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'sistema de controle financeiro',
    stack: ['java', 'spring boot', 'postgresql'],
  },
  {
    name: 'Autômato celular',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'simulação de contaminação ambiental',
    stack: ['java'],
  },
]

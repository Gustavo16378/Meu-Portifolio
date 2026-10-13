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
  /** Linha de contexto: cidade e quando foi entregue. */
  city: string
  delivered: string
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
    city: 'Palmas, TO',
    delivered: 'entregue em 2025',
    url: 'https://stewergabriel.com',
    line: 'Site do visagista e consultor de imagem Stewer Gabriel.',
    stack: ['react', 'typescript', 'tailwind', 'vite', 'cloudflare pages'],
    accent: 'var(--c-stewer)',
    background: 'var(--c-stewer-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('stewer'),
    videos: videos('stewer'),
    sheet: {
      architecture:
        'Site estático em React e TypeScript, empacotado com Vite e publicado no Cloudflare Pages com domínio próprio (stewergabriel.com). O agendamento virou um projeto separado: a API em Quarkus com PostgreSQL e migrations em Flyway já está pronta; o app em React Native com Expo é a próxima etapa.',
      decisions: [
        'Site estático: abre rápido no celular e não tem servidor pra manter.',
        'Tailwind com tokens de cor próprios, pra o dourado e o preto da marca serem os mesmos em todas as páginas.',
        'Agendamento fora do site, num sistema próprio, pra o site continuar leve e o sistema crescer sem depender dele.',
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
    city: 'Palmas, TO',
    delivered: 'feito em 2026',
    url: 'https://autoria-6kz.pages.dev',
    line: 'Concessionária com as fotos dos carros tratadas por um pipeline automático.',
    stack: ['react', 'typescript', 'playwright', 'rembg'],
    accent: 'var(--c-autoria)',
    background: 'var(--c-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('autoria'),
    videos: videos('autoria'),
    sheet: {
      architecture:
        'Front em React e TypeScript. Antes de entrar no site, as fotos passam por um pipeline: o Playwright coleta as imagens e o rembg remove o fundo de cada carro.',
      decisions: [
        'Tratamento de imagem automatizado, pra atualizar o estoque sem abrir editor de foto.',
        'Carro sem fundo, pra o layout controlar a composição de cada tela.',
        'Imagens otimizadas e carregadas sob demanda, pra a página aguentar muitas fotos sem pesar.',
      ],
      repo: github,
    },
  },
  {
    id: 'monte-vinhedo',
    name: 'Monte Vinhedo',
    year: 2026,
    kind: 'conceito próprio',
    city: 'Palmas, TO',
    delivered: 'feito em 2026',
    url: 'https://monte-vinhedo.pages.dev',
    line: 'Vinícola boutique de vinhos de altitude.',
    stack: ['react', 'gsap', 'cloudflare pages'],
    accent: 'var(--c-vinhedo)',
    background: 'var(--c-vinhedo-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('monte-vinhedo'),
    videos: videos('monte-vinhedo'),
    sheet: {
      architecture:
        'One page em React com animações em GSAP sincronizadas com a rolagem pelo ScrollTrigger, publicada no Cloudflare Pages.',
      decisions: [
        'Animação presa à rolagem: avança e volta junto com a leitura.',
        'Paleta curta em vinho e rosé, com cara de rótulo.',
        'Imagens em WebP carregadas sob demanda, pra as seções pesadas não travarem o celular.',
      ],
      repo: github,
    },
  },
  {
    id: 'torra',
    name: 'TORRA',
    year: 2026,
    kind: 'conceito próprio',
    city: 'Palmas, TO',
    delivered: 'feito em 2026',
    url: 'https://torra-cafe.pages.dev',
    line: 'Cafeteria de torra própria, com cardápio completo e mapa da loja.',
    stack: ['react', 'typescript', 'tailwind', 'leaflet', 'cloudflare pages'],
    accent: 'var(--c-torra)',
    background: 'var(--c-torra-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('torra'),
    videos: videos('torra'),
    sheet: {
      architecture:
        'Site em React e TypeScript com Tailwind, publicado no Cloudflare Pages. Cardápio com 26 itens, mapa interativo em Leaflet com entrada animada até a loja, e fotos em tela cheia com movimento lento de câmera.',
      decisions: [
        'Animações só em transform e opacity, pra o movimento das fotos e o grão da imagem não pesarem no celular.',
        'Parallax por CSS com @supports, que funciona onde o navegador suporta e não quebra onde não suporta.',
        'Cores da marca em tokens, sem cor solta no código.',
      ],
      repo: github,
    },
  },
  {
    id: 'cleane',
    name: 'Cleane Barbosa',
    year: 2025,
    kind: 'cliente',
    city: 'Palmas, TO',
    delivered: 'entregue em 2025',
    url: 'https://cleanebarbosa.com.br',
    line: 'Site da psicanalista e terapeuta EFT Cleane Barbosa.',
    stack: ['react', 'typescript', 'tailwind', 'cloudflare pages'],
    accent: 'var(--c-cleane)',
    background: 'var(--c-cleane-bg)',
    media: DEFAULT_MEDIA,
    prints: prints('cleane'),
    videos: videos('cleane'),
    sheet: {
      architecture:
        'Site institucional em React e TypeScript com Tailwind, publicado no Cloudflare Pages com domínio próprio (cleanebarbosa.com.br).',
      decisions: [
        'Visual calmo e pouco movimento: quem procura terapia quer confiança, não efeito.',
        'Contato direto pelo WhatsApp em todas as seções, sem formulário no caminho.',
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

/** Print de um projeto da lista (public/prints-outros/), com versões menores pro srcset. */
export interface OtherPrint {
  webp: string
  png: string
  /** Largura -> arquivo, pro srcset. */
  sizes: [number, string][]
  width: number
  height: number
}

/** Outros projetos no ar (seção 04). Sem print, a miniatura mostra as iniciais. */
export interface OtherProject {
  id: string
  name: string
  kind: 'cliente' | 'projeto em grupo'
  year: number
  /** O que é, em poucas palavras (linha fechada). */
  line: string
  /** Dois ou três parágrafos (linha aberta). Placeholders com a intenção certa. */
  about: string[]
  /** Vazio quando ainda não sei a stack. */
  stack: string[]
  url?: string
  repo?: string
  prints?: { desktop: OtherPrint; mobile: OtherPrint }
}

const otherPrints = (id: string): OtherProject['prints'] => ({
  desktop: {
    webp: `/prints-outros/${id}-desktop.webp`,
    png: `/prints-outros/${id}-desktop.png`,
    sizes: [
      [320, `/prints-outros/${id}-desktop-320.webp`],
      [800, `/prints-outros/${id}-desktop-800.webp`],
      [1600, `/prints-outros/${id}-desktop.webp`],
    ],
    width: 1600,
    height: 1000,
  },
  mobile: {
    webp: `/prints-outros/${id}-mobile.webp`,
    png: `/prints-outros/${id}-mobile.png`,
    sizes: [
      [240, `/prints-outros/${id}-mobile-240.webp`],
      [480, `/prints-outros/${id}-mobile.webp`],
    ],
    width: 480,
    height: 1039,
  },
})

// Ordem da lista: a ONG primeiro (e aberta), porque é o design mais forte.
export const otherProjects: OtherProject[] = [
  {
    id: 'arte-de-amar',
    name: 'ONG Arte de Amar',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'one page da ONG Arte de Amar, de Palmas',
    about: [
      'Site da ONG Arte de Amar, que atende crianças e famílias em Palmas desde 2015. Apresenta o trabalho da organização e leva quem visita até a doação. Projeto em grupo, em que fiquei com o desenvolvimento: React, Vite e GSAP, com um fio verde contínuo que atravessa a página acompanhando a rolagem.',
    ],
    stack: ['react', 'vite', 'gsap'],
    url: 'https://arte-de-amar-site.pages.dev',
    prints: otherPrints('arte-de-amar'),
  },
  {
    id: 'tina-aires',
    name: 'Tina Aires',
    kind: 'cliente',
    year: 2025,
    line: 'site de neuropsicopedagoga, com SEO técnico completo',
    about: [
      'Site institucional da Tina Aires, neuropsicopedagoga em Porto Nacional, TO. O foco foi ser encontrado: robots.txt, sitemap, dados estruturados em JSON-LD e o domínio verificado no Search Console. Feito em React, leve no celular.',
    ],
    stack: ['react'],
    url: 'https://tinaaires.com.br',
    prints: otherPrints('tina-aires'),
  },
  {
    id: 'suelen',
    name: 'Suelen Pratas e Perfumaria',
    kind: 'cliente',
    year: 2025,
    line: 'loja de semijoias em prata 925 e perfumaria',
    about: [
      'Catálogo da Suelen Pratas e Perfumaria. Visual claro e editorial, com as peças em primeiro plano. Cada produto leva a conversa direto pro WhatsApp, onde a loja já vende.',
    ],
    stack: ['react'],
    url: 'https://suelen.pages.dev',
    prints: otherPrints('suelen'),
  },
  {
    id: 'automato-celular',
    name: 'Retomada (autômato celular)',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'simulação 2D de um acidente nuclear e da natureza retomando a cidade',
    about: [
      'Autômato celular em que a contaminação de um acidente nuclear se espalha pela cidade e, com o tempo, a vegetação retoma o espaço. Projeto em grupo: fiquei com o código, o grupo com o relatório e a apresentação. O motor é TypeScript puro, sem DOM, com a grade em Uint8Array e buffer duplo, testado com Vitest. A tela em Canvas tem controles de execução e cenário (acidente, sarcófago, vento), estatísticas ao vivo e exportação em CSV e PNG.',
    ],
    stack: ['typescript', 'vite', 'canvas', 'vitest'],
    prints: otherPrints('automato-celular'),
  },
  {
    id: 'fincontrol',
    name: 'FinControl',
    kind: 'projeto em grupo',
    year: 2026,
    line: 'sistema de controle financeiro',
    about: [
      'Sistema de controle financeiro, projeto em dupla. Back-end em Java com Quarkus, organizado em camadas (resource, service, repository), perfis de acesso por papel e erros no padrão Problem Details; front-end em Angular.',
    ],
    stack: ['java', 'quarkus', 'angular'],
    // Sem link no ar: só o botão de código (o back-end; o front fica em fincontrol-web).
    repo: 'https://github.com/Gustavo16378/fincontrol-api',
  },
]

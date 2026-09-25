export type ProjectId = 'stewer' | 'autoria' | 'monte-vinhedo' | 'torra' | 'cleane'

export interface Print {
  webp: string
  png: string
  width: number
  height: number
}

export interface ProjectSheet {
  /** Duas ou três linhas. */
  architecture: string
  decisions: [string, string, string]
  repo: { label: string; url: string }
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
  prints: { desktop: Print; mobile: Print }
  sheet?: ProjectSheet
}

const prints = (id: string): Project['prints'] => ({
  desktop: { webp: `/prints/${id}-desktop.webp`, png: `/prints/${id}-desktop.png`, width: 1600, height: 1000 },
  mobile: { webp: `/prints/${id}-mobile.webp`, png: `/prints/${id}-mobile.png`, width: 480, height: 1039 },
})

const github = { label: 'github', url: 'https://github.com/Gustavo16378' }

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
    background: 'var(--c-bg)',
    prints: prints('stewer'),
    sheet: {
      architecture:
        'Site estático em React e TypeScript, empacotado com Vite e servido pelo Cloudflare Pages. O agendamento vai virar um app à parte: API em Quarkus com PostgreSQL e app em React Native com Expo, ainda em desenvolvimento.',
      decisions: [
        'Site estático no Cloudflare Pages: carrega rápido e não tem servidor pra manter.',
        'Tailwind com tokens de cor próprios, pro dourado e o preto ficarem iguais em todas as páginas.',
        'Agendamento fora do site, num sistema próprio, pro site continuar leve e o sistema crescer sem mexer nele.',
      ],
      repo: github,
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
    prints: prints('autoria'),
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
    prints: prints('monte-vinhedo'),
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
    prints: prints('torra'),
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
    prints: prints('cleane'),
  },
]

export const projectById = (id: ProjectId): Project => {
  const p = projects.find((x) => x.id === id)
  if (!p) throw new Error(`projeto ${id} não existe`)
  return p
}

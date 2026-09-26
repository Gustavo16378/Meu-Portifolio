export type SectionId = 'abertura' | 'faco' | 'projetos' | 'outros' | 'processo' | 'historia' | 'contato'

export interface SectionInfo {
  id: SectionId
  /** Rótulo em minúsculas mostrado no HUD, na divisória e no rodapé da seção. */
  label: string
  /** Metadados em mono no rodapé da seção, depois do número e do rótulo. */
  meta: string[]
}

export const sections: SectionInfo[] = [
  { id: 'abertura', label: 'abertura', meta: ['full-stack', 'palmas, to'] },
  { id: 'faco', label: 'o que eu faço', meta: ['react', 'java', 'postgresql', 'cloudflare'] },
  { id: 'projetos', label: 'projetos', meta: ['5 projetos', '2025 a 2026'] },
  { id: 'outros', label: 'outros no ar', meta: ['clientes e projetos em grupo'] },
  { id: 'processo', label: 'como funciona', meta: ['4 passos', 'do briefing ao deploy'] },
  { id: 'historia', label: 'história', meta: ['palmas, to', 'desde os 16'] },
  { id: 'contato', label: 'contato', meta: ['gustavo@gustavodev.dev', '(63) 99111-4551'] },
]

export const sectionIndex = (id: SectionId): number => sections.findIndex((s) => s.id === id)

export const pad2 = (n: number): string => String(n).padStart(2, '0')

export type SectionId = 'abertura' | 'faco' | 'projetos' | 'outros' | 'processo' | 'historia' | 'contato'

export interface SectionInfo {
  id: SectionId
  /** Rótulo em minúsculas mostrado no HUD. */
  label: string
}

export const sections: SectionInfo[] = [
  { id: 'abertura', label: 'abertura' },
  { id: 'faco', label: 'o que eu faço' },
  { id: 'projetos', label: 'projetos' },
  { id: 'outros', label: 'outros no ar' },
  { id: 'processo', label: 'como funciona' },
  { id: 'historia', label: 'história' },
  { id: 'contato', label: 'contato' },
]

export const sectionIndex = (id: SectionId): number => sections.findIndex((s) => s.id === id)

export const pad2 = (n: number): string => String(n).padStart(2, '0')

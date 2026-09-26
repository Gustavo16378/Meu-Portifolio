/** Poses do personagem (public/personagem/gustavo-<pose>.webp/.png) com o tamanho do arquivo, pra reservar espaço. */
export const POSES = {
  acenando: [247, 440],
  'andando-direita': [250, 440],
  'andando-esquerda': [242, 440],
  apontando: [297, 440],
  'bracos-cruzados': [202, 440],
  cafe: [433, 440],
  comemorando: [289, 440],
  desenhando: [337, 440],
  digitando: [358, 433],
  dormindo: [519, 277],
  espiando: [180, 398],
  frente: [199, 440],
  lado: [178, 440],
  'olhando-cima': [221, 440],
  ombros: [391, 440],
  pensando: [212, 440],
  pulando: [288, 422],
  sentado: [365, 422],
} as const satisfies Record<string, readonly [number, number]>

export type Pose = keyof typeof POSES

export const poseSrc = (pose: Pose) => ({
  webp: `/personagem/gustavo-${pose}.webp`,
  png: `/personagem/gustavo-${pose}.png`,
})

/** Uma pose por passo da seção Como funciona. */
export const PROCESS_POSES: Pose[] = ['pensando', 'desenhando', 'digitando', 'comemorando']

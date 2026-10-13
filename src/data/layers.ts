import type { Pose } from './personagem'

/** Uma camada da seção 02: o que tem por trás de um site, de cima pra baixo. */
export interface Layer {
  id: 'tela' | 'api' | 'banco' | 'deploy'
  word: string
  /** Linha de log em mono embaixo da palavra. */
  log: string
  /** Projeto real de onde vem o cartão, e a stack dele. */
  project: string
  stack: string
  pose: Pose
}

export const LAYERS: Layer[] = [
  {
    id: 'tela',
    word: 'Tela',
    log: 'GET torra-cafe.pages.dev · 200',
    project: 'TORRA',
    stack: 'react · typescript · tailwind',
    pose: 'apontando',
  },
  {
    id: 'api',
    word: 'API',
    log: 'GET /ecommerce/produtos/1 · 200 OK',
    project: 'Ecommerce Café',
    stack: 'java 21 · quarkus',
    pose: 'sentado',
  },
  {
    id: 'banco',
    word: 'Banco',
    log: 'select … from produto · 4 linhas',
    project: 'Ecommerce Café',
    stack: 'postgresql · hibernate',
    pose: 'olhando-cima',
  },
  {
    id: 'deploy',
    word: 'Deploy',
    log: 'torra-cafe.pages.dev · no ar',
    project: 'TORRA',
    stack: 'cloudflare pages',
    pose: 'pulando',
  },
]

// Um parágrafo por camada.
export const LAYER_TEXTS = [
  'Cada site sai do zero: layout, tipografia e animação pensados pro projeto, em React e TypeScript. Nada de template.',
  'Por trás da tela vem a API. Escrevo em Java com Quarkus ou Spring Boot, com autenticação, validação e erros padronizados.',
  'Modelo o banco em PostgreSQL, com migrations versionadas, pra o sistema crescer sem quebrar o que já existe.',
  'E coloco no ar: domínio, HTTPS, SEO técnico e deploy automático a cada atualização.',
]
export const LAYER_TEXT_OF = [0, 1, 2, 3]

/**
 * Resposta de GET /ecommerce/produtos/1 no Ecommerce Café, com os dados do seed (DataInitializerService) e o
 * formato do ProdutoMapper.toEcommerceResponseDTO. Sem a descrição, por espaço. `mobile`: cabe no cartão do celular.
 */
export const API_RESPONSE: { line: string; mobile: boolean }[] = [
  { line: '{', mobile: true },
  { line: '  "id": 1,', mobile: true },
  { line: '  "nome": "Café Arábica Especial",', mobile: true },
  { line: '  "preco": 49.9,', mobile: true },
  { line: '  "torra": "MEDIA",', mobile: true },
  { line: '  "tamanhoEmbalagem": "250g",', mobile: false },
  { line: '  "materialEmbalagem": "Papel Kraft",', mobile: false },
  { line: '  "categorias": ["Café Especial", "Café Gourmet"],', mobile: false },
  { line: '  "tipoCafe": "GRAO",', mobile: true },
  { line: '  "estoqueDisponivel": 150', mobile: true },
  { line: '}', mobile: true },
]

/** Tabela produto do Ecommerce Café com os quatro cafés do seed (herança em tabela única, nomes em snake_case). */
export const DB_QUERY = 'select id, nome, preco, tipo_cafe from produto;'
export const DB_COLUMNS = ['id', 'nome', 'preco', 'tipo_cafe']
export const DB_ROWS = [
  ['1', 'Café Arábica Especial', '49.90', 'GRAO'],
  ['2', 'Café Robusta Tradicional', '32.50', 'MOIDO'],
  ['3', 'Café Blend Gourmet Premium', '89.90', 'CAPSULA'],
  ['4', 'Café Descafeinado Suave', '44.90', 'MOIDO'],
]

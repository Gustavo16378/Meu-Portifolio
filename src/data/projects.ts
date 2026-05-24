import React from 'react'
import {
  SiReact, SiTypescript, SiJavascript, SiTailwindcss, SiVite,
  SiSpring, SiNodedotjs, SiPostgresql, SiMysql,
  SiDocker, SiGit, SiGithub, SiCloudflare, SiFigma, SiPostman,
  SiRabbitmq, SiExpo, SiSwagger, SiStrapi, SiPhp, SiLaravel, SiAlpinedotjs,
  SiSentry, SiGithubactions,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'

export const techIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  'React':           { icon: React.createElement(SiReact),           color: '#61DAFB' },
  'React Native':    { icon: React.createElement(SiReact),           color: '#61DAFB' },
  'TypeScript':      { icon: React.createElement(SiTypescript),      color: '#3178C6' },
  'JavaScript':      { icon: React.createElement(SiJavascript),      color: '#F7DF1E' },
  'Tailwind':        { icon: React.createElement(SiTailwindcss),     color: '#06B6D4' },
  'Tailwind CSS':    { icon: React.createElement(SiTailwindcss),     color: '#06B6D4' },
  'Vite':            { icon: React.createElement(SiVite),            color: '#646CFF' },
  'Java':            { icon: React.createElement(FaJava),            color: '#ED8B00' },
  'Spring Boot':     { icon: React.createElement(SiSpring),          color: '#6DB33F' },
  'Node.js':         { icon: React.createElement(SiNodedotjs),       color: '#339933' },
  'PostgreSQL':      { icon: React.createElement(SiPostgresql),      color: '#4169E1' },
  'MySQL':           { icon: React.createElement(SiMysql),           color: '#4479A1' },
  'Docker':          { icon: React.createElement(SiDocker),          color: '#2496ED' },
  'Git':             { icon: React.createElement(SiGit),             color: '#F05032' },
  'GitHub':          { icon: React.createElement(SiGithub),          color: '#FFFFFF' },
  'GitHub Actions':  { icon: React.createElement(SiGithubactions),   color: '#2088FF' },
  'Cloudflare':      { icon: React.createElement(SiCloudflare),      color: '#F38020' },
  'Figma':           { icon: React.createElement(SiFigma),           color: '#F24E1E' },
  'Postman':         { icon: React.createElement(SiPostman),         color: '#FF6C37' },
  'RabbitMQ':        { icon: React.createElement(SiRabbitmq),        color: '#FF6600' },
  'Expo':            { icon: React.createElement(SiExpo),            color: '#FFFFFF' },
  'Swagger':         { icon: React.createElement(SiSwagger),         color: '#85EA2D' },
  'Strapi':          { icon: React.createElement(SiStrapi),          color: '#4945FF' },
  'PHP':             { icon: React.createElement(SiPhp),             color: '#777BB4' },
  'Laravel':         { icon: React.createElement(SiLaravel),         color: '#FF2D20' },
  'Alpine.js':       { icon: React.createElement(SiAlpinedotjs),     color: '#8BC0D0' },
  'Sentry':          { icon: React.createElement(SiSentry),          color: '#7B5EA7' },
  'Quarkus':         { icon: React.createElement('span', { className: 'font-bold text-[8px]' }, 'QK'), color: '#4695EB' },
  'SMTP':            { icon: React.createElement('span', { className: 'font-bold text-[8px]' }, 'SMTP'), color: '#0ea5e9' },
  'Lucide':          { icon: null, color: '#64748b' },
}

export type Status = 'live' | 'dev' | 'done'
export type Category = 'freelance' | 'personal'

export interface Project {
  slug: string
  title: string
  client: string
  category: Category
  status: Status
  statusLabel: string
  description: string
  longDescription: string
  stack: string[]
  gradient: string
  image?: string
  liveUrl?: string
  github?: string
  highlights: string[]
  hidden?: boolean
}

export const projects: Project[] = [
  {
    slug: 'cleo-terapeuta',
    title: 'Cléo Terapeuta',
    client: 'Cleane Barbosa — Psicanalista & Terapeuta EFT, Palmas TO',
    category: 'freelance',
    status: 'live',
    statusLabel: 'No ar',
    gradient: 'from-rose-400/20 to-amber-500/10',
    image: '/photos/cleane_site/mockuper.png',
    liveUrl: 'https://cleanebarbosa.com.br',
    description:
      'Site institucional para psicanalista com seções de serviços, palestras, depoimentos e pacotes. Design completo no Figma, compra de domínio, deploy e hospedagem na Cloudflare.',
    longDescription:
      'Projeto completo entregue para Cleane Barbosa, psicanalista e terapeuta EFT em Palmas, TO. O ciclo incluiu levantamento de requisitos, criação do design no Figma, desenvolvimento front-end e deploy na Cloudflare Pages com domínio próprio. O site apresenta seções de serviços, agenda de palestras, depoimentos de clientes e pacotes de atendimento, com foco em conversão e credibilidade.',
    stack: ['React', 'TypeScript', 'Tailwind', 'Lucide', 'Cloudflare'],
    highlights: [
      'Design do zero no Figma antes do código',
      'Deploy e hospedagem na Cloudflare Pages',
      'SEO otimizado para serviços de psicologia',
      'Formulário de contato integrado',
      'Totalmente responsivo — mobile e desktop',
    ],
  },
  {
    slug: 'stewer-gabriel',
    title: 'Stewer Gabriel',
    client: 'Visagista & Consultor de Imagem Masculina, Palmas TO',
    category: 'freelance',
    status: 'live',
    statusLabel: 'No ar',
    gradient: 'from-amber-300/20 to-yellow-600/10',
    image: '/photos/Stewer/mockuper.png',
    liveUrl: 'https://stewergabriel.com/',
    github: 'https://github.com/Gustavo16378/Stewer_Gabriel',
    description:
      'Site pessoal para visagista e consultor de imagem masculina. Design premium com tema escuro, tipografia serif elegante e identidade visual única.',
    longDescription:
      'Site pessoal para Stewer Gabriel, visagista e consultor de imagem masculina em Palmas, TO. O projeto tem identidade visual premium: tema escuro, tipografia serif elegante e uma estética sofisticada alinhada ao universo de moda e imagem masculina. Ciclo completo: wireframe, design no Figma, desenvolvimento React e deploy na Cloudflare.',
    stack: ['React', 'TypeScript', 'Tailwind', 'Vite', 'Cloudflare'],
    highlights: [
      'Design premium com tema escuro e tipografia serif',
      'Identidade visual exclusiva para o nicho de imagem masculina',
      'Ciclo completo: wireframe → design → código → deploy',
      'Animações suaves com Framer Motion',
      'Código-fonte disponível no GitHub',
    ],
  },
  {
    slug: 'ap-imoveis',
    title: 'AP Imóveis — Anivan & Pedro',
    client: 'Anivan Gomes & Pedro Henrique — Corretores de Imóveis, Palmas e Luzimangues',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-cyan-400/20 to-sky-600/10',
    description:
      'Site para a dupla de corretores Anivan Gomes e Pedro Henrique — 17 anos de experiência unindo-se à energia de uma nova geração. Foco em lotes acessíveis e imóveis residenciais em Palmas e Luzimangues.',
    longDescription:
      'Landing page institucional para a dupla de corretores de imóveis Anivan Gomes e Pedro Henrique, atuando em Palmas e Luzimangues. O projeto une a autoridade de 17 anos de mercado com a energia de uma nova geração, com foco em lotes acessíveis e imóveis residenciais. Design editorial sofisticado com tipografia serifada, identidade visual exclusiva e arquitetura de conteúdo pensada para gerar confiança e conversão.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    highlights: [
      'Design editorial com tipografia serifada e identidade visual própria',
      'Foco em conversão — lotes acessíveis e imóveis residenciais',
      'Responsivo e otimizado para SEO local',
      'Deploy na Cloudflare Pages com domínio próprio',
      'Atende Palmas e Luzimangues — TO',
    ],
  },
  {
    slug: 'isaias-souza',
    title: 'Isaias de Souza',
    client: 'Corretor de Imóveis — Imobiliária Ricanato, Palmas TO',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-violet-400/20 to-purple-600/10',
    description:
      'Site pessoal para corretor associado à Imobiliária Ricanato em Palmas, TO. Especialista em imóveis residenciais, alto padrão e lançamentos. Design dark premium com identidade visual forte.',
    longDescription:
      'Site pessoal para Isaias de Souza, corretor de imóveis associado à Imobiliária Ricanato em Palmas, TO. Especialista em imóveis residenciais, alto padrão e lançamentos, o projeto tem um design dark premium com identidade visual forte que posiciona Isaias como referência no mercado imobiliário tocantinense. Foco em transmitir autoridade, credibilidade e facilitar o contato direto com potenciais clientes.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    highlights: [
      'Design dark premium com identidade visual forte',
      'Posicionamento como referência no mercado imobiliário de Palmas',
      'Seções de especialidades: residencial, alto padrão e lançamentos',
      'Otimizado para SEO local no Tocantins',
      'Deploy na Cloudflare Pages',
    ],
  },
  {
    slug: 'ehl-eletro-hidro',
    title: 'EHL — Eletro Hidro Ltda',
    client: 'Eletro Hidro Ltda. — engenharia pesada desde 1998',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-sky-500/20 to-blue-600/10',
    image: '/photos/EHL_Site/mockuper.png',
    description:
      'Site institucional para empresa referência em engenharia pesada e infraestrutura no Brasil. 25+ anos de experiência, 200+ obras entregues, 800+ colaboradores. CMS integrado via Strapi para atualização autônoma de conteúdo.',
    longDescription:
      'Site institucional de grande porte para a EHL — Eletro Hidro Ltda., empresa fundada em 1998 e referência em engenharia pesada e infraestrutura no Brasil. Atua em rodovias, desenvolvimento urbano e grandes obras públicas, com 25+ anos de experiência, 200+ obras entregues e 800+ colaboradores. A arquitetura headless com Strapi permite que a equipe atualize obras, equipamentos e portfólio sem tocar no código. Design construído do zero no Figma antes do desenvolvimento.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Strapi', 'Cloudflare', 'Figma'],
    highlights: [
      'CMS headless com Strapi — conteúdo gerenciado pelo cliente',
      'Portfólio de obras e equipamentos via painel administrativo',
      'Design completo no Figma antes do desenvolvimento',
      'Arquitetura escalável para crescimento do conteúdo',
      'Deploy planejado para Cloudflare Pages',
    ],
  },
  {
    slug: 'robson-araujo',
    title: 'Robson Araújo Barbosa',
    client: 'Engenheiro Civil — 30+ anos de experiência em projetos e obras',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-stone-400/20 to-slate-600/10',
    description:
      'Site pessoal para engenheiro civil com mais de 30 anos de experiência em projetos residenciais e obras. Apresenta trajetória, portfólio e canais de contato com foco em credibilidade técnica.',
    longDescription:
      'Site pessoal para Robson Araújo Barbosa, engenheiro civil com mais de 30 anos de experiência em projetos residenciais e obras. O projeto apresenta sua trajetória profissional, portfólio de obras realizadas e canais de contato, com uma identidade visual que transmite credibilidade, autoridade técnica e solidez. Desenvolvido do zero com foco em posicionamento profissional e geração de leads qualificados.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    highlights: [
      'Design que transmite autoridade técnica e credibilidade',
      'Portfólio de projetos residenciais e obras realizadas',
      'Trajetória profissional de 30+ anos em destaque',
      'Canais de contato otimizados para conversão',
      'Deploy na Cloudflare Pages',
    ],
  },
  {
    slug: 'iepes-brasil',
    title: 'IEPES do Brasil',
    client: 'Instituto de Estudos Políticos, Econômicos e Sociais do Brasil',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-blue-400/20 to-indigo-600/10',
    description:
      'Site institucional para instituto educacional com foco em cursos livres e profissionais de negócios, economia e mercados. Apresenta estrutura de cursos, corpo docente e canais de inscrição.',
    longDescription:
      'Site institucional para o IEPES — Instituto de Estudos Políticos, Econômicos e Sociais do Brasil. O projeto apresenta a estrutura completa de cursos livres e profissionais nas áreas de negócios, economia e mercados, com seções para corpo docente, programas de formação e canais de inscrição. Design que transmite credibilidade acadêmica e facilita a jornada do aluno do interesse à matrícula.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    highlights: [
      'Estrutura completa de cursos livres e profissionais',
      'Seção de corpo docente e programas de formação',
      'Canais de inscrição otimizados para conversão',
      'Design que transmite credibilidade acadêmica',
      'Deploy na Cloudflare Pages',
    ],
  },
  {
    slug: 'tina-aires',
    title: 'Tina Aires — Terapeuta TRG',
    client: 'Tina Aires — Terapeuta TRG e Palestrante',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-pink-400/20 to-rose-600/10',
    description:
      'Site para terapeuta TRG e palestrante. Apresenta serviços terapêuticos, agenda de palestras e conteúdo sobre bem-estar, com design que transmite acolhimento e profissionalismo.',
    longDescription:
      'Site pessoal para Tina Aires, terapeuta TRG e palestrante. O projeto apresenta seus serviços terapêuticos, agenda de palestras e conteúdo sobre bem-estar com um design que une acolhimento e profissionalismo. A identidade visual foi pensada para criar conexão imediata com o público e transmitir segurança — elemento fundamental para serviços terapêuticos.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    highlights: [
      'Design acolhedor alinhado ao universo terapêutico',
      'Seções de serviços TRG, palestras e conteúdo sobre bem-estar',
      'Identidade visual que transmite confiança e conexão',
      'Responsivo e otimizado para SEO',
      'Deploy na Cloudflare Pages',
    ],
  },
  {
    slug: 'sistema-fht',
    title: 'Sistema FHT',
    client: 'Federação de Handebol do Tocantins — filiada à CBHb',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-yellow-400/20 to-orange-500/10',
    description:
      'Portal oficial da Federação de Handebol do Tocantins. Sistema completo com cadastro de atletas, equipes, competições, árbitros, notícias e transparência. Arquitetura robusta com front-end moderno e back-end em Java.',
    longDescription:
      'Maior projeto do portfólio — portal oficial da Federação de Handebol do Tocantins, filiada à CBHb. Sistema completo com módulos de cadastro de atletas, equipes, competições e árbitros, além de área de notícias e transparência institucional. O front-end utiliza React + TypeScript com React Router v6, hospedado no Cloudflare Pages. O back-end é construído em Java + Quarkus com JWT Auth, REST API e banco PostgreSQL. Armazenamento de mídia via Cloudflare R2. Infraestrutura profissional com CI/CD via GitHub Actions, monitoramento via Sentry e envio de e-mails transacionais.',
    stack: ['React', 'TypeScript', 'Java', 'Quarkus', 'PostgreSQL', 'Cloudflare', 'GitHub Actions', 'Sentry'],
    highlights: [
      'Sistema federativo completo — atletas, equipes, competições e árbitros',
      'Back-end Java + Quarkus com JWT Auth e REST API',
      'Banco PostgreSQL + Cloudflare R2 para armazenamento de mídia',
      'CI/CD via GitHub Actions com deploy automático',
      'Monitoramento de erros em produção via Sentry',
    ],
  },
  {
    slug: 'lcm-gestao-esportiva',
    title: 'LCM Gestão Esportiva',
    client: 'LCM Gestão Esportiva — referência em eventos esportivos no Tocantins',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-indigo-500/20 to-purple-600/10',
    image: '/photos/LCM_Site/mockuper.png',
    description:
      'Site institucional para a LCM — 14+ anos de atuação, 200+ eventos realizados, mais de 15 mil atletas movimentados pelo Tocantins. Identidade visual exclusiva para o universo esportivo. Ciclo completo: wireframe, design no Figma, desenvolvimento e deploy.',
    longDescription:
      'Site institucional para a LCM Gestão Esportiva, empresa com 14+ anos de atuação e 200+ eventos realizados que movimentaram mais de 15 mil atletas pelo Tocantins. O projeto tem identidade visual exclusiva para o universo esportivo — energética, moderna e profissional. Ciclo completo: wireframe, design no Figma, desenvolvimento e deploy na Cloudflare. Atenção: o tema atual está escuro e será migrado para tema claro em breve.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare', 'Figma'],
    highlights: [
      'Identidade visual exclusiva para o segmento esportivo',
      'Wireframe antes do design — fluxo de UX validado',
      'Design no Figma com aprovação do cliente',
      'Responsivo e otimizado para SEO',
      'Deploy na Cloudflare Pages',
    ],
  },
  {
    slug: 'orcamento-api',
    title: 'orcamento-api + notifications-api',
    client: 'DS Web Dev — Microserviços em produção',
    category: 'freelance',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-green-500/20 to-emerald-600/10',
    image: '/photos/orcamento-api.png',
    github: 'https://github.com/Gustavo16378',
    description:
      'API de orçamentos com CRUD completo, paginação, soft delete e arquitetura em camadas. Integrada a um microsserviço independente que dispara e-mails via SMTP.',
    longDescription:
      'Dois microsserviços independentes desenvolvidos para a DS Web Dev. A orcamento-api trata todo o ciclo de vida de orçamentos: criação, consulta, atualização, soft delete e paginação — arquitetura em camadas seguindo SOLID. A notifications-api é um microsserviço desacoplado responsável por disparar e-mails transacionais via SMTP sempre que um orçamento muda de estado. Comunicação entre os serviços via HTTP. Documentação automática com Swagger e ambiente containerizado com Docker.',
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'SMTP', 'Docker', 'Swagger'],
    highlights: [
      'Arquitetura de microsserviços desacoplados',
      'CRUD completo com paginação e soft delete',
      'Notificações via e-mail SMTP em microsserviço separado',
      'Documentação automática com Swagger/OpenAPI',
      'Ambiente 100% containerizado com Docker',
    ],
  },
  {
    slug: 'landing-acupuntura',
    title: 'Landing Page — Acupuntura',
    client: 'DS Web Dev — Entregue ao cliente final',
    category: 'freelance',
    status: 'done',
    statusLabel: 'Concluído',
    gradient: 'from-emerald-500/20 to-teal-600/10',
    image: '/photos/landingpage_site/mockuper.png',
    github: 'https://github.com/Gustavo16378/landing-php-laravel',
    description:
      'Landing page institucional para clínica de acupuntura. Desenvolvimento completo com backend Laravel, build moderno com Vite e estilização com Tailwind CSS 4.',
    longDescription:
      'Landing page desenvolvida para uma clínica de acupuntura como parte de um projeto freelance entregue pela DS Web Dev ao cliente final. O stack escolhido foi PHP + Laravel no backend, com Vite como bundler e Tailwind CSS 4 para a estilização — uma combinação moderna dentro do ecossistema PHP. Projeto finalizado e entregue com sucesso.',
    stack: ['PHP', 'Laravel', 'Tailwind CSS', 'Alpine.js', 'Vite'],
    highlights: [
      'Stack PHP/Laravel com Tailwind CSS 4 e Alpine.js',
      'Build moderno com Vite dentro do ecossistema PHP',
      'Design focado em conversão para clínica de saúde',
      'Projeto entregue ao cliente final pela DS Web Dev',
      'Código-fonte disponível no GitHub',
    ],
  },
  {
    slug: 'ecommerce-api',
    title: 'E-commerce API',
    client: 'Acadêmico — Tópicos em Programação I',
    category: 'personal',
    status: 'done',
    statusLabel: 'Concluído',
    gradient: 'from-orange-500/20 to-amber-600/10',
    github: 'https://github.com/Gustavo16378',
    description:
      'API de e-commerce em Java + Quarkus com mensageria assíncrona via RabbitMQ, documentação Swagger e ambiente 100% containerizado com Docker.',
    longDescription:
      'Projeto acadêmico desenvolvido para a disciplina de Tópicos em Programação I. API REST de e-commerce construída com Java + Quarkus, explorando um framework cloud-native de alta performance. A mensageria assíncrona via RabbitMQ permite processar pedidos sem bloquear a requisição principal. Toda a documentação de endpoints foi gerada automaticamente com Swagger, e o ambiente completo sobe com Docker Compose.',
    stack: ['Java', 'Quarkus', 'RabbitMQ', 'PostgreSQL', 'Docker', 'Swagger'],
    highlights: [
      'Quarkus — framework Java cloud-native de alta performance',
      'Mensageria assíncrona com RabbitMQ',
      'Documentação automática com Swagger/OpenAPI',
      'Ambiente completo com Docker Compose',
      'Projeto avaliado e aprovado em disciplina acadêmica',
    ],
  },
  {
    slug: 'app-tapaburaco',
    title: 'App Tapaburaco',
    client: 'Mobile — Projeto pessoal em desenvolvimento',
    category: 'personal',
    status: 'dev',
    statusLabel: 'Em desenvolvimento',
    gradient: 'from-rose-500/20 to-pink-600/10',
    description:
      'App mobile que conecta cidadãos à prefeitura para reporte de problemas urbanos. Design próprio com estrutura preparada para expansão multiplataforma.',
    longDescription:
      'App mobile civic tech que aproxima cidadãos da prefeitura para reporte de problemas urbanos como buracos, calçadas danificadas e iluminação defeituosa. O app permite que o cidadão fotografe o problema, marque a localização no mapa e acompanhe o status da solicitação. Construído com React Native + Expo para rodar nativamente em Android e iOS a partir de um único código-base.',
    stack: ['React Native', 'Expo', 'TypeScript'],
    highlights: [
      'App civic tech para reporte de problemas urbanos',
      'Localização por GPS com marcação no mapa',
      'Upload de fotos do problema diretamente no app',
      'React Native + Expo — um código para iOS e Android',
      'Design e UX pensados para acessibilidade cidadã',
    ],
  },
]

export const statusConfig: Record<Status, { color: string; bg: string }> = {
  live: { color: '#4ade80', bg: 'bg-green-500/10 border-green-500/30' },
  dev:  { color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30' },
  done: { color: '#60a5fa', bg: 'bg-blue-500/10 border-blue-500/30'  },
}

# PLAN.md · ordem de construção

Uma etapa por sessão do Claude Code. Cada etapa termina com `npm run dev` rodando e uma lista do que conferir no navegador. Só avançar com aprovação.

## Etapa 0 · Scaffold
Vite + React + TS + Tailwind. Fontes locais (Tanker, Synonym, Commit Mono) em `public/fonts` com @font-face. `tokens.css` com a paleta da SPEC. Lenis ligado. Grain e grade de fundo como componentes reutilizáveis. `index.html` com SEO e OG completos. Estrutura de pastas do CLAUDE.md. Copiar `assets/` do kit pra `public/`. Página em branco preta com o HUD nos quatro cantos (hora real, coordenadas, seção atual, status).
Conferir: fontes carregando, HUD atualizando a hora, scroll suave.

## Etapa 1 · Hero com física
Título Tanker gigante à esquerda com skew por velocidade de scroll, linha em Synonym, stack em mono. À direita, os cartões de foto (`gustavo-original.png`, `foto2.png`) como objetos físicos: flutuam, inclinam em 3D com o mouse (mola), arrastam e jogam com inércia e quique nas bordas (Draggable + Inertia), se espalham no scroll e voltam. Indicador `scroll` no rodapé. Hooks `useTilt`, `useScrollSkew`, `usePhotoCards` nascem aqui.
Conferir: dá vontade de ficar jogando os cartões; nada trava; mobile sem drag mas com inclinação e espalhamento.

## Etapa 2 · Cursor, preloader e menu
Cursor customizado (ponto lima + anel com inércia, cresce em links, some no mobile). Botões e links magnéticos (`useMagnetic`). Preloader digitando o nome (`Gustavo Lima`, apaga `Lima`, digita `Dev`), cortina subindo, só na primeira visita da sessão (sessionStorage). Menu overlay com itens em Tanker gigante e o atalho do recrutador, mecânica de portal do CLAUDE.md.
Conferir: preloader entre 2 e 2,5s, menu fecha com Esc e clique fora, scroll travado corretamente no iOS.

## Etapa 3 · Seção 02 e o primeiro projeto (Stewer)
Seção "O que eu faço" com glitch curto na entrada das linhas. Depois o projeto 1 completo: ambiente, objetos em linha com parallax, print no espelho, placa, ficha técnica em painel. Trilho lateral `01 / 05` aparecendo. Transição física no fim dele (objetos empurrados pra fora com o scroll, por enquanto pra preto). Navalha em pêndulo reagindo ao mouse.
Conferir: é o molde dos outros quatro. Aprovar só quando estiver certo.

## Etapa 4 · Os outros quatro projetos
Replicar o molde com os ambientes da SPEC (Autoria, Monte Vinhedo, Torra, Cleane). Fronteiras físicas entre eles (sai empurrado, entra caindo com mola), trilho preenchendo, cor sangrando. Grãos com gravidade na Torra, líquido balançando no Monte Vinhedo, folhas oscilando na Cleane. Dados em `data/projects.ts`.
Conferir: ritmo das cores, transição reversível, nada pesado.

## Etapa 5 · Resto da página
Outros projetos (lista com hover glitch), Como funciona (blocos com glitch), História (foto estática + linha do tempo), Contato (título montando em blocos, WhatsApp, footer). Painel do recrutador com CV em PDF (placeholder até o Gustavo mandar o PDF).
Conferir: seção atual no HUD acompanhando, todos os links.

## Etapa 6 · Mobile e reduced-motion
Passar seção por seção no mobile: HUD reduzido, cartões sem drag, projetos em scroll vertical com a mesma transição física (mais leve), menu, painéis. Testar `prefers-reduced-motion`.
Conferir no celular de verdade, não só no devtools.

## Etapa 7 · Performance e deploy
Lighthouse mobile ≥ 85. WebP nos prints, og.png 1200×630 gerado, sitemap e robots. Build e deploy no Cloudflare Pages. Trocar o placeholder da URL de produção.

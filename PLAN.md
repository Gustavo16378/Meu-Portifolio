# PLAN.md · ordem de construção

Uma etapa por sessão do Claude Code. Cada etapa termina com `npm run dev` rodando e uma lista do que conferir no navegador. Só avançar com aprovação.

## Etapa 0 · Scaffold
Vite + React + TS + Tailwind. Fontes locais (Tanker, Synonym, Commit Mono) em `public/fonts` com @font-face. `tokens.css` com a paleta da SPEC. Lenis ligado. Grain e grade de fundo como componentes reutilizáveis. `index.html` com SEO e OG completos. Estrutura de pastas do CLAUDE.md. Copiar `assets/` do kit pra `public/`. Página em branco preta com o HUD nos quatro cantos (hora real, coordenadas, seção atual, status).
Conferir: fontes carregando, HUD atualizando a hora, scroll suave.

## Etapa 1 · Hero com física
Título Tanker gigante à esquerda com skew por velocidade de scroll, linha em Synonym, stack em mono. À direita, os cartões de foto (`gustavo-original.png`, `foto2.png`) como objetos físicos: flutuam, inclinam em 3D com o mouse (mola), arrastam e jogam com inércia e quique nas bordas (Draggable + Inertia), se espalham no scroll e voltam. Jogado, o cartão fica onde parou; só volta ao lugar pelo scroll (sair do hero e voltar) ou se parar cobrindo o título. Indicador `scroll` no rodapé. Hooks `useTilt`, `useScrollSkew`, `usePhotoCards` nascem aqui.
Conferir: dá vontade de ficar jogando os cartões; nada trava; mobile sem drag mas com inclinação e espalhamento.

## Etapa 2 · Cursor, preloader e menu
Cursor customizado (ponto lima + anel com inércia, cresce em links, some no mobile). Botões e links magnéticos (`useMagnetic`). Preloader digitando o nome (`Gustavo Lima`, apaga `Lima`, digita `Dev`), cortina subindo, em todo carregamento da página. Menu overlay com itens em Tanker gigante e o atalho do recrutador, mecânica de portal do CLAUDE.md.
Conferir: preloader entre 2 e 2,5s, menu fecha com Esc e clique fora, scroll travado corretamente no iOS.

## Etapa 3 · Seção 02 e o primeiro projeto (Stewer)
Seção "O que eu faço" com glitch curto na entrada das linhas. Depois o projeto 1 completo: ambiente, objetos em linha com parallax, print no espelho, placa, ficha técnica em painel. Trilho lateral `01 / 05` aparecendo. Transição física no fim dele (objetos empurrados pra fora com o scroll, por enquanto pra preto). Navalha em pêndulo reagindo ao mouse.
Conferir: é o molde dos outros quatro. Aprovar só quando estiver certo.

## Etapa 4 · Os outros quatro projetos
Replicar o molde com os ambientes da SPEC (Autoria, Monte Vinhedo, Torra, Cleane). Fronteiras físicas entre eles (sai empurrado, entra caindo com mola), trilho preenchendo, cor sangrando. Grãos com gravidade na Torra, líquido balançando no Monte Vinhedo, folhas oscilando na Cleane. Dados em `data/projects.ts`.
Conferir: ritmo das cores, transição reversível, nada pesado.

## Etapa 4.1 · Projetos como site vivo (Bloco A)
Saem todos os objetos de cena dos cinco projetos (desenhos em linha, fotos de navalha e pente, lâmpadas, círculos de luz, montanhas); a pasta `objetos/` não é mais usada. Cada projeto vira o site vivo: frame grande (~65% da largura) sem chrome de navegador, borda de 1px na cor de ambiente e sombra suave, com vídeo do site rodando (`public/videos/`, muted, loop, playsinline, preload none, poster, play ao entrar na tela e pause ao sair). Mobile menor em vídeo no canto inferior direito. Placa à esquerda, parada. Física só no frame (mola na entrada, inclinação de 2 a 3 graus com o mouse, skew leve pelo scroll). Pin de ~120vh; no mobile pin curto e vídeos empilhados. Mantém cor de fundo por projeto, cor sangrando e trilho. Grain neutro, no máximo 3%, desligado nos projetos.
Conferir: dá tempo de ver o site rodando, vídeo toca e pausa na hora certa, nada além do site na cena.

## Etapa 4.1b · Composições e palco único
Palco único preso na seção de projetos. Cada projeto com composição própria (Stewer, AUTORIA, Monte Vinhedo, TORRA, Cleane, ver SPEC); os frames viajam entre elas com mola enquanto o vídeo troca. Nome em contorno deslizando atrás, varredura diagonal de cor, texto saindo pra cima e entrando de baixo em stagger. Vídeos: src só a uma tela de distância, um tocando por vez, descarregam ao sair, WebM com fallback MP4, no mobile só o vídeo do celular, só poster com botão "ver em movimento" em saveData, 2g/3g e reduced-motion.
Conferir: viagem dos frames, troca de vídeo, só um tocando, Lighthouse mobile acima de 85.

## Etapa 4.1c · Projetos em passos, prints e botões
Mídia por flag (`media: "print" | "video"`, padrão print) com a infraestrutura de vídeo pronta. Seção em passos com GSAP Observer: um gesto por projeto, cada troca uma timeline completa, gestos ignorados durante a troca, solta o scroll nas pontas; varredura de cor numa camada só (sem ficar pela metade). Composição própria no mobile. Luz radial na cor de acento atrás do frame, Stewer com fundo preto-dourado. Botões `ver no ar` preenchido e `ficha técnica` com borda, 44px, magnéticos; `menu` e `recrutador?` com borda no HUD. Nome em contorno deslizando sozinho, frame flutuando e brilho na borda a cada 8s.
Conferir: um gesto, um projeto; solta nas pontas; menu e ficha por cima; mobile com toque de verdade.

## Etapa 4.1d · Passos firmes
Um gesto vale um passo (rajada de wheel, swipe de 40px ou tecla), gestos durante a troca descartados, intervalo de 250ms (desktop) e 350ms (mobile). Troca de 1,1s numa timeline única, ida e volta simétricas com tweenTo. Entrada e saída da seção pela fronteira do palco, com tolerância de 12px.
Conferir: flick forte no trackpad anda um projeto só; ida e volta iguais; entra direto no último subindo a página.

## Etapa 4.2 · Personagem (Bloco B)
Componente Personagem com as poses de `personagem-gustavo-poses/` (copiadas pra `public/personagem/`), sempre pequeno, nos pontos definidos na SPEC: preloader, hero espiando, seção 02, Como funciona, História, Contato (dorme depois de 20s), ocioso atravessando o rodapé depois de 30s, e 404. Sem personagem dentro dos projetos. Em Como funciona, História e Contato ele entra já no lugar previsto; o conteúdo dessas seções vem na Etapa 5.
Conferir: tamanho discreto, entrada com mola, some no primeiro arrasto do hero, dorme no contato, walker some ao mexer.

## Etapa 4.3 · Testes (Bloco C)
Passar seção por seção no Chrome headless em 1440x900 e 390x844 e reportar preloader, hero, seção 02, projetos (vídeo, pin, cor, trilho), menu e ficha, HUD, personagem, reduced-motion, console e tempo de carregamento da seção de projetos.

## Etapa 5 · Resto da página
Outros projetos (lista com hover glitch), Como funciona (blocos com glitch e o personagem por passo), História (foto do capuz como cartão com tilt, linha do tempo, personagem com café), Contato (título digitado, e-mail e WhatsApp reais, footer, personagem acenando). Painel do recrutador com CV em PDF (placeholder até o Gustavo mandar o PDF), aberto pelo botão `recrutador?` do HUD (já existe desde a Etapa 3) e pelo do menu.
Conferir: seção atual no HUD acompanhando, todos os links.

## Etapa 6 · Mobile e reduced-motion
Passar seção por seção no mobile: HUD reduzido, cartões sem drag, projetos em scroll vertical com a mesma transição física (mais leve), menu, painéis. Testar `prefers-reduced-motion`.
Conferir no celular de verdade, não só no devtools.

## Etapa 7 · Performance e deploy
Lighthouse mobile ≥ 85. WebP nos prints, og.png 1200×630 gerado, sitemap e robots. Build e deploy no Cloudflare Pages. Trocar o placeholder da URL de produção.

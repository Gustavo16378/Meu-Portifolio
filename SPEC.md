# SPEC · novo portfólio gustavodev.dev

> Esta é a especificação de design e conteúdo do site. Leia inteira antes de qualquer tarefa. Regras de código e fluxo de trabalho estão em CLAUDE.md; ordem de construção em PLAN.md.

> O motion é o produto. Um frame parado deste site não diz nada. Nada de componente genérico, nada de layout que pareça template de portfólio de dev.

## O que é

Portfólio one page de Gustavo Barbosa Lima, desenvolvedor full-stack (front, back, APIs, apps) que programa desde os 16 anos, em Palmas, Tocantins. Serve a dois públicos: cliente de freela que quer ver que o site fica impressionante, e recrutador que quer stack, experiência e código em 30 segundos.

Referência de impacto (não de cópia): portfólios técnicos e futuristas com um objeto vivo no centro, transições que destroem e reconstroem o conteúdo, HUD com micro-informação, uma cor ácida sobre preto. A sensação buscada: "isso aqui é sistema rodando", não "isso aqui é uma página bonita".

## Regras que não se negociam

1. Nenhuma palavra que remeta a museu, galeria, exposição, sala, acervo, obra, curadoria, vitrine. Isso é vocabulário de planejamento. A pessoa sente o ambiente mudar, não lê que ele mudou.
2. Sem azul, em nenhum lugar.
3. Zero template. Nada de foto com código nos óculos, chips de tecnologia no hero, cards de skill com barrinha, grid de três colunas com ícone em cima.
4. Tipografia exclusiva deste site. Proibido: Fraunces, Inter, Cormorant, Space Grotesk, JetBrains Mono, Satoshi, Manrope, Geist. Nenhuma serifa neste site.
5. Sem seção de preço.
6. Textos normais, diretos, sem frase de efeito, sem tom de trailer de filme. Escrever como quem explica pra um amigo o que faz. O Gustavo vai reescrever tudo depois nas palavras dele, então os textos são placeholders com a intenção certa, não peças de retórica.
7. Mobile-first: no mobile os projetos continuam presos, com pin curto e os vídeos empilhados, mantendo a troca de cor; o resto da página é scroll vertical normal.
8. Performance: nada que trave celular médio. Partículas no máximo ~12k pontos no desktop, ~4k no mobile. Respeitar prefers-reduced-motion.

## Paleta base

- Fundo: preto quase puro `#070907`.
- Acento: verde-lima ácido `#C6F24E`. Ele é a cor do site: título de destaque, cursor, HUD, links ativos, linhas de grade, partículas da foto.
- Texto: osso `#E8E6DE`. Nunca branco puro.
- Apagado: cinza-verde `#6F756A` para HUD secundário, metadados e mono.
- Superfície: `#0E120F`, borda `#1C221D`.

Na seção de projetos, cada projeto traz a própria cor de fundo (ver abaixo). Fora dela, o site é preto e lima.

Grain fino e neutro (só tons de cinza, sem tingir com a cor do ambiente), no máximo 3% de opacidade, desligado dentro da seção de projetos. Uma grade de linhas 1px a 6% de opacidade no fundo do hero e do contato, lembrando papel milimetrado técnico.

## Tipografia

- Display: **Tanker** (Fontshare). Sans pesadíssima e estreita. Títulos gigantes, maiúsculas, tracking apertado. Alternativa se Tanker ficar pesada demais em texto médio: **Panchang** (Fontshare) nos pesos Bold/Extrabold.
- Texto: **Synonym** (Fontshare), Regular e Medium. Sans discreta, técnica.
- Mono: **Commit Mono**, para HUD, stack, ano, status, número de seção, botão do recrutador.

## HUD (elemento de identidade, presente em toda a página)

Nos quatro cantos, em mono pequeno e cinza-verde, informação que dá sensação de sistema ativo:
- canto superior esquerdo: `GUSTAVO BARBOSA LIMA` e abaixo `full-stack · palmas, to`
- canto superior direito: o atalho `recrutador?` em mono lima, ao lado a hora local em tempo real e as coordenadas de Palmas (`10°10'S 48°20'W`), e o botão `menu` na ponta
- canto inferior esquerdo: seção atual (`01 / 07 · abertura`) que atualiza no scroll
- canto inferior direito: `status: disponível para projetos` com um ponto lima piscando devagar

O HUD fica fixo; o conteúdo rola por baixo. No mobile, só o canto superior esquerdo e o inferior esquerdo.

Navegação: sem menu tradicional. Um botão `menu` em mono no topo direito que abre um overlay preto com os itens em Tanker gigante (projetos, como trabalho, história, contato) e o atalho `recrutador?`. Fechar com Esc ou clique fora. No mobile o botão `menu` continua visível (é a navegação) e o atalho `recrutador?` fica só dentro do menu.

## Preloader

Fundo preto, só isso na tela, sem log antes. Um cursor de texto fino em lima pisca. Em Tanker gigante, maiúsculas, digita `Gustavo Lima` letra por letra, faz uma pausa curta, apaga `Lima` com backspace letra por letra e digita `Dev` em lima (`Gustavo` fica em osso). Ritmo de digitação humano: intervalos levemente irregulares, com hesitação no começo de palavra; o backspace é um pouco mais rápido. O cursor fica aceso enquanto digita e pisca quando para. Pausa de meio segundo com o nome pronto, e a tela abre pro hero com uma cortina subindo (fade rápido em `prefers-reduced-motion`). O hero começa a entrar junto com a cortina. Total entre 2 e 2,5 segundos. Só na primeira visita da sessão.

## Estrutura da página

Numeração de seção em mono. Cada seção abre com um título em Tanker, direto, sem frase de efeito.

### 01 Abertura

Composição: à esquerda, título em Tanker gigante em duas ou três linhas, maiúsculas: `GUSTAVO` em osso e `DEV` em lima, ou `FULL-STACK` em osso com `DEV` em lima. Abaixo, uma linha em Synonym: "Sites, sistemas e APIs. Front e back, do design ao deploy." Abaixo, em mono: `react · typescript · java · spring · quarkus · postgresql`.

À direita, as fotos do Gustavo **naturais, sem tratamento de cor** (`assets/foto/gustavo-original.png` e `assets/foto/foto2.png`; `foto1.png` é opcional, é a do site antigo). Elas aparecem como **objetos físicos**: dois ou três cartões fotográficos com borda fina e leve sombra, empilhados de forma torta, que:
- flutuam devagar em repouso (leve oscilação, como se tivessem massa);
- inclinam em 3D seguindo o mouse (perspective + rotateX/rotateY, com mola, não instantâneo);
- podem ser **arrastados e jogados**: soltou, o cartão continua com inércia, quica nas bordas do hero e desacelera (GSAP Draggable + InertiaPlugin); onde parou, fica. Não existe retorno automático por tempo. A única exceção: se o cartão parar cobrindo o título, ele volta pro lugar com mola depois de um respiro;
- no scroll, os cartões se espalham pra fora da tela com velocidade proporcional ao scroll. Quando o hero sai inteiro da tela, os cartões jogados voltam pro lugar original sem ninguém ver, e ao subir de novo eles chegam arrumados;
- em mobile, sem drag: só a inclinação pelo giroscópio (se permitido) ou pelo toque, e o espalhamento no scroll.

Não usar partículas nem foto colorida de lima. A foto é a pessoa, o site é o que se move em volta dela.

Sem botão de "contratar" no hero. Um indicador `scroll` em mono no rodapé da seção, com uma linha fina que cresce e some.

### 02 O que eu faço

Duas colunas. Esquerda, título Tanker: `NÃO É SÓ A TELA`. Direita, texto em Synonym, três parágrafos curtos, normais: que ele desenha e constrói do zero, sem template; que back, API e banco fazem parte do trabalho dele, não só o front; que cada projeto tem identidade própria. Sem frases de impacto. Ao rolar, as linhas do texto entram com um efeito de glitch curto (deslocamento horizontal de 2 a 3 frames) e estabilizam.

### 03 Projetos (cinco, o site vivo)

Os cinco projetos ficam **um embaixo do outro**. Nunca um sobreposto ao outro, nunca em carrossel. O scroll é Lenis suave, sem pin da seção inteira: cada projeto tem o próprio palco preso.

**Cada projeto é o site vivo.** Nada além do site na cena: sem objetos, sem desenhos, sem luzes. Um frame grande, cerca de 65% da largura no desktop, sem chrome de navegador, só borda de 1px na cor de ambiente e sombra suave; dentro dele, um vídeo do site rodando. Ao lado, o mobile menor, também em vídeo, levemente sobreposto no canto inferior direito do frame. À esquerda, a placa: título em Tanker, uma linha, stack em mono, `ver no ar` e `ficha técnica`.

**Vídeos** em `videos-projetos/` (copiados pra `public/videos/`): `<projeto>-desktop.mp4/.webm`, `<projeto>-mobile.mp4/.webm` e os posters `<projeto>-desktop-poster.jpg` e `-mobile-poster.jpg`. Vídeo mudo, em loop, `playsinline`, `preload="none"` com poster; dá play quando o projeto entra na tela (IntersectionObserver) e pausa quando sai. Nada é baixado antes da hora. Em reduced-motion fica no poster.

**Física só no frame:** entra com mola, inclina 2 a 3 graus seguindo o mouse (com mola) e ganha skew leve pela velocidade do scroll, endireitando quando o scroll para. A placa fica parada.

**Freada.** Cada projeto fica preso (sticky) por cerca de 120vh no desktop: o frame assenta logo no começo e o resto do trecho é tempo de olhar o site rodando. No mobile, pin curto e os vídeos empilhados (desktop em cima, mobile embaixo, placa depois).

**O que conecta os cinco:** um trilho vertical fixo na lateral esquerda, em mono, visível só dentro da seção de projetos. Ele mostra `01 / 05`, `02 / 05`... e uma linha fina que se preenche em lima conforme você desce pelos cinco. Ao trocar de projeto, o número troca com um glitch curto. Cada projeto tem sua cor de fundo, e ela **sangra** na do próximo (faixa de ~30vh de degradê entre as duas cores). **Sem quebra em blocos**, sem destruição e reconstrução.

A placa é enxuta: nome, ano, tipo (cliente ou conceito próprio), uma linha do que é, stack em mono, `ver no ar` e `ficha técnica`. Nada de texto de conceito.

`ficha técnica` abre um painel lateral (portal no body, mesma mecânica do menu) com: arquitetura em duas ou três linhas, três decisões técnicas, link do repositório (com o aviso "código privado, projeto de cliente" quando for o caso), link do site. É a parte do recrutador.

Ordem e fundos:

1. **Stewer Gabriel** (2025, cliente) · stewergabriel.com · Visagista e consultor de imagem. Fundo preto, acento dourado apagado `#8A7A45`. Stack: React, TypeScript, Tailwind, Vite, Cloudflare. Ficha: app de agendamento em desenvolvimento (Quarkus + PostgreSQL, React Native/Expo). Código privado.
2. **AUTORIA.** (2026, conceito próprio) · autoria-6kz.pages.dev · Concessionária de carros com fotos tratadas em pipeline próprio. Fundo preto, acento âmbar-ouro `#C9A24A`. Stack: React, TypeScript, pipeline Playwright + rembg pra tratar fotos.
3. **Monte Vinhedo** (2026, conceito próprio) · monte-vinhedo.pages.dev · Vinícola boutique de vinhos de altitude. Fundo vinho profundo `#3A0F1E`, acento rosé `#C46A7A`. Stack: React, GSAP.
4. **TORRA** (2026, conceito próprio) · torra-cafe.pages.dev · Cafeteria de torra própria. Fundo marrom-café `#2A1B12`, acento laranja queimado `#D8843A`. Stack: React, TypeScript, Tailwind.
5. **Cleane Barbosa** (2025, cliente, primeira cliente) · cleanebarbosa.com.br · Psicanalista e terapeuta EFT. Fundo verde-oliva escuro `#1E2A1F`, acento verde-sálvia `#9BB79A`. O mais calmo: o frame entra e endireita sem passar do ponto. Stack: React, TypeScript, Tailwind, Cloudflare. Código privado.

Ritmo: dourado, âmbar, vinho, laranja, verde.

### 04 Outros projetos

Lista, visível sem clicar, logo depois do quinto projeto. Título Tanker: `OUTROS NO AR`. Cada linha: miniatura pequena (print, anexo quando houver), nome, tipo, ano, stack em mono, link. Hover: a linha inteira acende em lima e a miniatura ganha um glitch rápido. Estrutura preparada para crescer.

- Tina Aires (2025, cliente) · tinaaires.com.br · site institucional de neuropsicopedagoga, SEO técnico completo · React
- Suelen Pratas e Perfumaria (2025, cliente) · suelen.pages.dev · loja de semijoias e perfumaria · React
- ONG Arte de Amar (2026, projeto em grupo) · arte-de-amar-site.pages.dev · one page com GSAP · React
- FinControl (2026, projeto em grupo) · sistema acadêmico · Java, Spring Boot, PostgreSQL
- Autômato celular (2026, projeto em grupo) · simulação de contaminação ambiental

### 05 Como eu trabalho

Título Tanker: `COMO FUNCIONA`. Quatro passos em linha horizontal, numerados em mono, cada um com título curto e duas linhas de texto normal: conversa e briefing; identidade e design; construção (front, back, API, banco); deploy e acompanhamento. Os blocos entram um a um com o mesmo glitch curto da seção 02. Abaixo, uma linha: "Cada projeto tem escopo e orçamento próprios. O primeiro passo é uma conversa." e link `ir para o contato`.

### 06 História

Título Tanker: `DESDE OS 16`. Esquerda: a foto do Gustavo (`assets/foto/foto2.png`, natural, com o capuz), como cartão físico que inclina com o mouse. Direita: texto em Synonym, dois parágrafos normais: de Palmas, programa desde os 16, freelance desde 2024, faz site e sistema, o que busca hoje. Abaixo, linha do tempo em mono: `2024 – hoje · freelance próprio`, `nov 2025 – mai 2026 · DS Web Dev, freelance remoto`, `mar – jul 2026 · Platano Solution, suporte técnico`. Não mencionar faculdade.

### 07 Contato

Título Tanker gigante, uma palavra por linha: `VAMOS` / `CONVERSAR`. A última palavra em lima. Abaixo, e-mail e WhatsApp em texto grande e clicável, botão lima `chamar no WhatsApp`. Ao entrar na seção, o título monta a partir de blocos.

Footer autoral, uma faixa em mono: GitHub (github.com/Gustavo16378), LinkedIn (linkedin.com/in/gustavo-barbosa-lima-341886278), Instagram (@ogustavo_dev), e a stack completa: react · typescript · javascript · tailwind · node.js · java · spring boot · quarkus · postgresql · docker · cloudflare · react native/expo. Assinatura: `gustavodev.dev · palmas, to · feito do zero`.

## Atalho do recrutador

Botão `recrutador?` em mono no menu e no HUD superior direito (ao lado da hora). O texto é só esse, sem complemento. Abre um painel lateral sobre a página: uma linha de resumo, stack agrupada (front, back, mobile, infra) em mono, experiência em três linhas, links GitHub e LinkedIn, botão `baixar CV em PDF`. Esc ou clique fora fecha.

## Física e dinamismo (vale pro site inteiro)

Tudo que se move tem massa. Regras gerais:
- Nada chega no lugar em linha reta: entradas com mola (`back.out`, `elastic.out` leve) e overshoot pequeno.
- O scroll tem velocidade e a página sente: títulos e prints ganham skew/rotate proporcionais à velocidade (via Lenis `velocity`) e voltam a zero com mola quando o scroll para.
- Botões e links são magnéticos: o elemento se desloca alguns px em direção ao cursor quando ele chega perto, e volta com mola.
- O cursor tem inércia: o anel atrasa em relação ao ponto.
- Nos projetos, a física fica só no frame do site: entra com mola, inclina 2 a 3 graus com o mouse, skew leve pelo scroll.
- Os cartões de foto do hero são arrastáveis com inércia e quique.
- Listas e blocos entram com stagger, nunca todos de uma vez.
- Em `prefers-reduced-motion`, tudo isso vira fade simples.

Ferramentas: GSAP (ScrollTrigger, Draggable, InertiaPlugin, Physics2DPlugin, todos gratuitos desde o GSAP 3.13), Lenis para scroll e velocidade. Sem engine de física separada (matter.js) a menos que o GSAP não dê conta; avisar antes.

## Motion, resumo do que precisa existir

- Preloader digitando `Gustavo Lima`, apagando `Lima` e digitando `Dev`, com cortina subindo.
- Cartões de foto no hero com inclinação 3D, drag com inércia e quique, e espalhamento no scroll.
- Cursor customizado: ponto lima pequeno com um anel fino que atrasa; cresce em links. Sem texto dentro do cursor.
- Glitch curto na entrada de textos (seções 02 e 05) e no hover da lista (04).
- Projetos presos ~120vh (pin curto no mobile), com o site rodando em vídeo num frame grande que entra com mola; cor sangrando entre eles, trilho lateral acompanhando. Sem blocos.
- Skew por velocidade de scroll em títulos e nos frames dos projetos; botões magnéticos.
- HUD fixo com hora real e seção atual.
- Título do contato montando em blocos.
- Tudo com GSAP (ScrollTrigger, Draggable, Inertia, Physics2D) + Lenis.

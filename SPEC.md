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
7. Mobile-first: seções pinadas no desktop viram scroll vertical no mobile, mantendo a troca de ambiente e o canvas de partículas mais leve (menos pontos).
8. Performance: nada que trave celular médio. Partículas no máximo ~12k pontos no desktop, ~4k no mobile. Respeitar prefers-reduced-motion.

## Paleta base

- Fundo: preto quase puro `#070907`.
- Acento: verde-lima ácido `#C6F24E`. Ele é a cor do site: título de destaque, cursor, HUD, links ativos, linhas de grade, partículas da foto.
- Texto: osso `#E8E6DE`. Nunca branco puro.
- Apagado: cinza-verde `#6F756A` para HUD secundário, metadados e mono.
- Superfície: `#0E120F`, borda `#1C221D`.

Na seção de projetos, cada projeto traz a própria cor de ambiente (ver abaixo). Fora dela, o site é preto e lima.

Grain fino sobre tudo (noise sutil, opacidade baixa). Uma grade de linhas 1px a 6% de opacidade no fundo do hero e do contato, lembrando papel milimetrado técnico.

## Tipografia

- Display: **Tanker** (Fontshare). Sans pesadíssima e estreita. Títulos gigantes, maiúsculas, tracking apertado. Alternativa se Tanker ficar pesada demais em texto médio: **Panchang** (Fontshare) nos pesos Bold/Extrabold.
- Texto: **Synonym** (Fontshare), Regular e Medium. Sans discreta, técnica.
- Mono: **Commit Mono**, para HUD, stack, ano, status, número de seção, botão do recrutador.

## HUD (elemento de identidade, presente em toda a página)

Nos quatro cantos, em mono pequeno e cinza-verde, informação que dá sensação de sistema ativo:
- canto superior esquerdo: `GUSTAVO BARBOSA LIMA` e abaixo `full-stack · palmas, to`
- canto superior direito: hora local em tempo real e coordenadas de Palmas (`10°10'S 48°20'W`)
- canto inferior esquerdo: seção atual (`01 / 07 · abertura`) que atualiza no scroll
- canto inferior direito: `status: disponível para projetos` com um ponto lima piscando devagar

O HUD fica fixo; o conteúdo rola por baixo. No mobile, só o canto superior esquerdo e o inferior esquerdo.

Navegação: sem menu tradicional. Um botão `menu` em mono no topo direito que abre um overlay preto com os itens em Tanker gigante (projetos, como trabalho, história, contato) e o atalho `recrutador? 30 segundos`. Fechar com Esc ou clique fora.

## Preloader

Fundo preto, só isso na tela, sem log antes. Um cursor de texto fino em lima pisca. Em Tanker gigante, maiúsculas, digita `Gustavo Lima` letra por letra, faz uma pausa curta, apaga `Lima` com backspace letra por letra e digita `Dev` em lima (`Gustavo` fica em osso). Ritmo de digitação humano: intervalos levemente irregulares, com hesitação no começo de palavra; o backspace é um pouco mais rápido. O cursor fica aceso enquanto digita e pisca quando para. Pausa de meio segundo com o nome pronto, e a tela abre pro hero com uma cortina subindo (fade rápido em `prefers-reduced-motion`). O hero começa a entrar junto com a cortina. Total entre 2 e 2,5 segundos. Só na primeira visita da sessão.

## Estrutura da página

Numeração de seção em mono. Cada seção abre com um título em Tanker, direto, sem frase de efeito.

### 01 Abertura

Composição: à esquerda, título em Tanker gigante em duas ou três linhas, maiúsculas: `GUSTAVO` em osso e `DEV` em lima, ou `FULL-STACK` em osso com `DEV` em lima. Abaixo, uma linha em Synonym: "Sites, sistemas e APIs. Front e back, do design ao deploy." Abaixo, em mono: `react · typescript · java · spring · quarkus · postgresql`.

À direita, as fotos do Gustavo **naturais, sem tratamento de cor** (`assets/foto/gustavo-original.png` e `assets/foto/foto2.png`; `foto1.png` é opcional, é a do site antigo). Elas aparecem como **objetos físicos**: dois ou três cartões fotográficos com borda fina e leve sombra, empilhados de forma torta, que:
- flutuam devagar em repouso (leve oscilação, como se tivessem massa);
- inclinam em 3D seguindo o mouse (perspective + rotateX/rotateY, com mola, não instantâneo);
- podem ser **arrastados e jogados**: soltou, o cartão continua com inércia, quica nas bordas do hero e desacelera (GSAP Draggable + InertiaPlugin, com `bounds` no container);
- no scroll, os cartões se espalham pra fora da tela com velocidade proporcional ao scroll e voltam ao lugar quando se volta ao topo;
- em mobile, sem drag: só a inclinação pelo giroscópio (se permitido) ou pelo toque, e o espalhamento no scroll.

Não usar partículas nem foto colorida de lima. A foto é a pessoa, o site é o que se move em volta dela.

Sem botão de "contratar" no hero. Um indicador `scroll` em mono no rodapé da seção, com uma linha fina que cresce e some.

### 02 O que eu faço

Duas colunas. Esquerda, título Tanker: `NÃO É SÓ A TELA`. Direita, texto em Synonym, três parágrafos curtos, normais: que ele desenha e constrói do zero, sem template; que back, API e banco fazem parte do trabalho dele, não só o front; que cada projeto tem identidade própria. Sem frases de impacto. Ao rolar, as linhas do texto entram com um efeito de glitch curto (deslocamento horizontal de 2 a 3 frames) e estabilizam.

### 03 Projetos (cinco, com ambiente)

Os cinco projetos ficam **um embaixo do outro**, cada um ocupando a tela inteira (min-height 100vh). Nunca um sobreposto ao outro, nunca em carrossel. O scroll é normal (Lenis suave), sem pin da seção inteira; o pin, se houver, é só de elementos internos de cada projeto (o print, o objeto central) enquanto o conteúdo passa.

**O que conecta os cinco:** um trilho vertical fixo na lateral esquerda, em mono, visível só dentro da seção de projetos. Ele mostra `01 / 05`, `02 / 05`... e uma linha fina que se preenche em lima conforme você desce pelos cinco. Ao trocar de projeto, o número troca com um glitch curto. Além do trilho, a cor de fundo de cada projeto **sangra** na fronteira com o próximo (faixa de ~30vh de degradê entre as duas cores, controlada pelo scroll).

**Sem quebra em blocos, sem destruição e reconstrução aqui.** A transição entre projetos é **física**: os objetos em linha do projeto atual são empurrados pra fora da tela com velocidade proporcional ao scroll (ganham momento, giram um pouco, saem por cima), e os do próximo **caem** na cena com mola e quique leve (overshoot, `elastic`/`back` ease), parando nos lugares. O print desliza com skew proporcional à velocidade do scroll e endireita quando o scroll para. Tudo reversível: subir o scroll traz os objetos de volta pelo mesmo caminho.

Dentro de cada projeto: o print do site (desktop grande, mobile menor ao lado ou sobreposto no canto) integrado ao ambiente, os objetos em linha (wireframe, stroke fino de 1 a 1,5px, sem preenchimento, sempre no mesmo estilo nos cinco) com parallax em camadas, e a placa. A placa é enxuta: nome, ano, tipo (cliente ou conceito próprio), uma linha do que é, stack em mono, `ver no ar` e `ficha técnica`. Nada de texto de conceito.

`ficha técnica` abre um painel lateral (portal no body, mesma mecânica do menu) com: arquitetura em duas ou três linhas, três decisões técnicas, link do repositório, link do site. É a parte do recrutador.

Ordem e ambientes:

1. **Stewer Gabriel** (2025, cliente) · stewergabriel.com · Visagista e consultor de imagem. Ambiente: preto com dourado apagado `#8A7A45`. Objetos em linha: espelho retangular com lâmpadas ao redor acendendo uma a uma no scroll, navalha pendurada que balança como pêndulo e reage ao mouse passar perto, pente que desliza no balcão. O print aparece dentro do espelho. Stack: React, TypeScript, Tailwind, Vite, Cloudflare. Ficha: app de agendamento em desenvolvimento (Quarkus + PostgreSQL, React Native/Expo).
2. **AUTORIA.** (2026, conceito próprio) · autoria-6kz.pages.dev · Concessionária de carros como galeria. Ambiente: preto com âmbar-ouro `#C9A24A`. Objetos em linha: silhueta de carro em wireframe vista de frente, um farol que acende e varre a tela em cone de luz seguindo o mouse com atraso, reflexo no piso, o carro afunda de leve na suspensão quando o scroll para. O print aparece na parede iluminada pelo farol. Stack: React, TypeScript, pipeline Playwright + rembg pra tratar fotos.
3. **Monte Vinhedo** (2026, conceito próprio) · monte-vinhedo.pages.dev · Vinícola boutique de vinhos de altitude. Ambiente: vinho profundo `#3A0F1E` com rosé `#C46A7A`. Objetos em linha: garrafas em silhueta com parallax, taça em wireframe que enche conforme rola e cujo líquido balança quando o scroll muda de velocidade, linhas de contorno de montanha ao fundo. Stack: React, GSAP.
4. **TORRA** (2026, conceito próprio) · torra-cafe.pages.dev · Cafeteria de torra própria. Ambiente: marrom-café `#2A1B12` com laranja queimado `#D8843A`. Objetos em linha: xícara em wireframe com vapor animado (três curvas subindo), grãos que caem com gravidade e quicam no pires (Physics2D), um círculo grande de luz lateral. Stack: React, TypeScript, Tailwind.
5. **Cleane Barbosa** (2025, cliente, primeira cliente) · cleanebarbosa.com.br · Psicanalista e terapeuta EFT. Ambiente: verde-oliva escuro `#1E2A1F` com verde-sálvia `#9BB79A`. O mais calmo dos cinco: um círculo em linha que expande e contrai devagar (respiração), poltrona em wireframe, planta em linha cujas folhas oscilam como se tivesse vento leve. Tudo lento, é a única cena sem quique. Stack: React, TypeScript, Tailwind, Cloudflare.

Ritmo: dourado, âmbar, vinho, laranja, verde. Cada fronteira é uma troca de cena com peso: sai empurrado, entra caindo.

Prints em `assets/prints/<projeto>-desktop.png` e `<projeto>-mobile.png`.

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

Botão `recrutador? 30 segundos` em mono no menu e no HUD superior direito (ao lado da hora). Abre um painel lateral sobre a página: uma linha de resumo, stack agrupada (front, back, mobile, infra) em mono, experiência em três linhas, links GitHub e LinkedIn, botão `baixar CV em PDF`. Esc ou clique fora fecha.

## Física e dinamismo (vale pro site inteiro)

Tudo que se move tem massa. Regras gerais:
- Nada chega no lugar em linha reta: entradas com mola (`back.out`, `elastic.out` leve) e overshoot pequeno.
- O scroll tem velocidade e a página sente: títulos e prints ganham skew/rotate proporcionais à velocidade (via Lenis `velocity`) e voltam a zero com mola quando o scroll para.
- Botões e links são magnéticos: o elemento se desloca alguns px em direção ao cursor quando ele chega perto, e volta com mola.
- O cursor tem inércia: o anel atrasa em relação ao ponto.
- Os objetos em linha dos projetos reagem ao mouse (empurrão, balanço) e à gravidade quando faz sentido.
- Os cartões de foto do hero são arrastáveis com inércia e quique.
- Listas e blocos entram com stagger, nunca todos de uma vez.
- Em `prefers-reduced-motion`, tudo isso vira fade simples.

Ferramentas: GSAP (ScrollTrigger, Draggable, InertiaPlugin, Physics2DPlugin, todos gratuitos desde o GSAP 3.13), Lenis para scroll e velocidade. Sem engine de física separada (matter.js) a menos que o GSAP não dê conta; avisar antes.

## Motion, resumo do que precisa existir

- Preloader digitando `Gustavo Lima`, apagando `Lima` e digitando `Dev`, com cortina subindo.
- Cartões de foto no hero com inclinação 3D, drag com inércia e quique, e espalhamento no scroll.
- Cursor customizado: ponto lima pequeno com um anel fino que atrasa; cresce em links. Sem texto dentro do cursor.
- Glitch curto na entrada de textos (seções 02 e 05) e no hover da lista (04).
- Transição física entre os cinco projetos (objetos empurrados pra fora, próximos caindo com mola), cor sangrando, trilho lateral acompanhando. Sem blocos.
- Objetos em linha com parallax e reação ao mouse dentro de cada projeto.
- Skew por velocidade de scroll em títulos e prints; botões magnéticos.
- HUD fixo com hora real e seção atual.
- Título do contato montando em blocos.
- Tudo com GSAP (ScrollTrigger, Draggable, Inertia, Physics2D) + Lenis.

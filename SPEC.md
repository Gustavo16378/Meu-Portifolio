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
7. Mobile-first: no mobile os projetos continuam em passos (swipe), cada um com sua composição simplificada; o resto da página é scroll vertical normal.
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
- canto superior direito: o atalho `recrutador?` em mono lima com borda de 1px lima, ao lado a hora local em tempo real e as coordenadas de Palmas (`10°10'S 48°20'W`), e o botão `menu` na ponta, com borda de 1px e padding. Os dois têm que parecer clicáveis pra qualquer pessoa.
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

### 03 Projetos (cinco, em passos)

Os cinco projetos passam num **palco da altura da tela**, entre duas faixas de degradê (preto para a cor do primeiro, cor do último para preto). Nunca em carrossel.

**Scroll em passos.** A seção não tem altura de scroll interna: é uma tela (100svh) presa, e dentro dela o GSAP Observer é o único controle.
- Entrada: chegando por cima, ao encostar no topo do palco (tolerância de 12px, pra o scroll suave que desacelera não parar a 1px sem prender) o scroll nativo trava (Lenis `stop()`) e entra o primeiro projeto. Chegando por baixo, subindo a página, entra direto o último.
- Um gesto vale um passo, qualquer que seja a força. Gesto = uma rajada contínua de wheel (termina com 200ms sem eventos; a inércia do trackpad faz parte do mesmo gesto), um swipe (tolerância de 40px) ou uma tecla (setas, PageDown/PageUp, espaço; segurar a tecla não repete).
- Gestos durante a troca são descartados inteiros, e depois dela há um intervalo mínimo antes de aceitar o próximo: 250ms no desktop, 350ms no mobile.
- Saída: no primeiro projeto, gesto pra cima solta o scroll (Lenis `start()`) e a página sobe normal; no último, gesto pra baixo solta e a página continua.
- Suavidade: a troca dura 1,1s, com `power3.inOut` no movimento do frame e na varredura, e `power2.out` no texto. Todas as trocas vivem numa timeline única com uma etiqueta por projeto; ida e volta são a mesma animação, pra frente ou invertida com `tweenTo`, então ficam simétricas.
- Menu, ficha técnica e painel do recrutador abrem por cima com o scroll travado; enquanto estão abertos os gestos não são lidos, e ao fechar a seção continua presa no mesmo projeto.
- A navegação pelo menu atravessa o palco sem prender (ou prende nele, se o destino for projetos).

**Mídia.** Uma flag em `data/projects.ts` (`media: "print" | "video"`, padrão `print`) decide o que aparece nos frames. Hoje: os prints de `public/prints/` (desktop e mobile de cada projeto). A infraestrutura de vídeo fica pronta pra ligar depois (ver abaixo). Com print, não existe o botão `ver em movimento`.

**Cada projeto é o site.** Nada além do site na cena: sem objetos, sem desenhos. Dois frames sem chrome de navegador, só borda de 1px na cor de acento e sombra suave: o desktop e o mobile.

**Composição própria por projeto.** Os mesmos dois frames **viajam entre as composições com mola** (posição, tamanho e rotação, só via transform) enquanto a imagem troca no meio da viagem.

Desktop:
1. Stewer: texto à esquerda, frame à direita, celular sobreposto no canto inferior direito.
2. AUTORIA: frame à esquerda, mais largo; texto à direita.
3. Monte Vinhedo: frame gigante centralizado, quase a tela toda; só o nome, `ver no ar` e `ficha técnica` sobrepostos no canto superior esquerdo, com sombra.
4. TORRA: o celular é o protagonista, grande no centro; o desktop atrás, menor e inclinado 6 graus; texto centralizado embaixo.
5. Cleane: metade e metade, frame à esquerda, texto à direita.

Mobile (versão simplificada de cada uma, um frame só):
1. Stewer: print desktop em cima, texto logo abaixo.
2. AUTORIA: print desktop grande, texto sobreposto na parte de baixo dele, com sombra.
3. Monte Vinhedo: print do celular quase em tela cheia, nome e links sobrepostos no canto de baixo.
4. TORRA: print do celular grande no centro, texto embaixo.
5. Cleane: texto em cima, print embaixo.

**Atrás do frame:**
- Luz radial suave na cor de acento, opacidade baixa: acompanha o mouse devagar no desktop e fica fixa no frame principal no mobile. Troca de cor apagando e acendendo.
- Nome do projeto em Tanker gigante, só contorno de 1px na cor de acento, ocupando a largura toda, **deslizando sozinho, contínuo e lento**, mesmo sem scroll, e acelerando com a velocidade do scroll e a cada troca. Na troca, o nome sai por um lado e o próximo entra pelo outro. A altura dele muda por projeto pra não cruzar o texto.

**Troca de cor de fundo:** varredura diagonal. Uma camada só com a cor do próximo cobre a tela vindo do lado do gesto; no fim ela vira o fundo e some. Nunca fica pela metade.

**Texto:** o do projeto atual sai pra cima e o do próximo entra de baixo, com stagger.

**Botões que parecem botões:** `ver no ar` é preenchido na cor de acento do projeto, texto escuro, com seta; `ficha técnica` tem borda de 1px na cor de acento. Os dois com no mínimo 44px de altura e magnéticos.

**Física e vida só nos frames:** viajam com mola, flutuam de leve em repouso (2 a 3px, ciclo de 6s), inclinam 2 a 3 graus seguindo o mouse, skew leve pela velocidade do scroll, e um brilho fino atravessa a borda a cada 8s. Tilt, skew e flutuação ficam em wrappers com `will-change: transform`, nunca no `<video>`. Nada além disso.

**Vídeos (quando `media: "video"`):** arquivos em `videos-projetos/`, copiados pra `public/videos/`.
- `preload="none"` e poster sempre; o `src` só entra quando o palco está a uma tela de distância e só pro projeto atual e os vizinhos; sai quando se afasta.
- Só um vídeo toca por vez. Em cada projeto só um frame tem vídeo (o desktop, ou o celular na TORRA); o outro mostra o poster.
- WebM primeiro, MP4 de fallback. No mobile os vídeos desktop não carregam.
- Com economia de dados, conexão 2g/3g ou reduced-motion: só poster, com o botão `ver em movimento`.
- Meta: Lighthouse mobile acima de 85 com a seção completa.

**O que conecta os cinco:** um trilho vertical fixo na lateral esquerda, em mono, visível enquanto o palco está preso, com `01 / 05`... e uma linha fina que se preenche em lima até `05 / 05`. O número troca com glitch curto. **Sem quebra em blocos.**

A placa: nome, ano, tipo (cliente ou conceito próprio), uma linha do que é, stack em mono, `ver no ar` e `ficha técnica`. Nada de texto de conceito.

`ficha técnica` abre um painel lateral (portal no body, mesma mecânica do menu) com arquitetura em duas ou três linhas, três decisões técnicas, link do repositório (com o aviso "código privado, projeto de cliente" quando for o caso) e link do site. No mobile ocupa a tela e fecha no botão `fechar` ou com Esc.

Ordem e cores:

1. **Stewer Gabriel** (2025, cliente) · stewergabriel.com · Visagista e consultor de imagem. Fundo preto-dourado `#14110A`, acento dourado apagado `#8A7A45`. Stack: React, TypeScript, Tailwind, Vite, Cloudflare. Código privado.
2. **AUTORIA.** (2026, conceito próprio) · autoria-6kz.pages.dev · Concessionária de carros com fotos tratadas em pipeline próprio. Fundo preto, acento âmbar-ouro `#C9A24A`. Stack: React, TypeScript, Playwright + rembg.
3. **Monte Vinhedo** (2026, conceito próprio) · monte-vinhedo.pages.dev · Vinícola boutique de vinhos de altitude. Fundo vinho `#3A0F1E`, acento rosé `#C46A7A`. Stack: React, GSAP.
4. **TORRA** (2026, conceito próprio) · torra-cafe.pages.dev · Cafeteria de torra própria. Fundo marrom-café `#2A1B12`, acento laranja queimado `#D8843A`. Stack: React, TypeScript, Tailwind.
5. **Cleane Barbosa** (2025, cliente, primeira cliente) · cleanebarbosa.com.br · Psicanalista e terapeuta EFT. Fundo verde-oliva `#1E2A1F`, acento verde-sálvia `#9BB79A`. Stack: React, TypeScript, Tailwind, Cloudflare. Código privado.

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

## Personagem

Uma versão ilustrada do Gustavo, em 18 poses com fundo transparente (`personagem-gustavo-poses/gustavo-*.png`, servidas de `public/personagem/` em WebP com PNG de fallback; as três folhas originais não vão pro site). Componente `Personagem` recebe pose e tamanho.

Regras: sempre pequeno (120 a 220px de altura no desktop, 80 a 140px no mobile), nunca compete com o conteúdo, nunca intercepta clique. Entra com mola, flutua de leve em repouso (pausa fora da tela), troca de pose com um tranco curto. Em reduced-motion aparece parado, só com fade. **Nunca dentro da seção de projetos.**

Onde aparece:
- Preloader: `digitando`, no canto inferior esquerdo; sai junto com a cortina.
- Hero: `espiando`, saindo de trás da borda direita do primeiro cartão de foto (a faixa escura da imagem é a parede e se confunde com a borda do cartão). Aparece depois que os cartões assentam e some com fade na primeira vez que o usuário arrasta um cartão.
- 02 O que eu faço: `apontando`, embaixo do título, apontando pro texto.
- 05 Como funciona: uma pose por passo (`pensando`, `desenhando`, `digitando`, `comemorando`), cada uma entrando com fade e quique leve.
- 06 História: `cafe`, ao lado da linha do tempo.
- 07 Contato: `acenando` perto do botão do WhatsApp, com balanço lento; depois de 20 segundos sem interação, troca pra `dormindo`; qualquer interação acorda.
- Ocioso: depois de 30 segundos sem interação, ele atravessa o rodapé da tela com `andando-direita` e volta com `andando-esquerda`, e some assim que o usuário mexe (mouse, toque, teclado ou scroll). Não passa na seção de projetos nem no contato (lá ele já dorme).
- 404: `ombros` centralizado, com "não achei essa página" em Tanker e um link pra voltar. Qualquer caminho que não seja a home mostra essa página, com `noindex`.

As outras poses (`bracos-cruzados`, `frente`, `lado`, `olhando-cima`, `pulando`, `sentado`) ficam disponíveis no componente.

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
- Projetos em passos: palco preso, um gesto por projeto, cada troca uma timeline completa (frames viajando com mola entre as composições, varredura diagonal de cor, nome em contorno trocando, texto saindo pra cima e entrando de baixo); luz na cor de acento atrás do frame, nome deslizando sozinho, frame flutuando com brilho na borda; trilho lateral acompanhando. Sem blocos.
- Skew por velocidade de scroll em títulos e nos frames dos projetos; botões magnéticos.
- HUD fixo com hora real e seção atual.
- Título do contato montando em blocos.
- Personagem pequeno nos pontos definidos, com mola na entrada e flutuação leve; atravessa o rodapé quando o usuário fica parado.
- Tudo com GSAP (ScrollTrigger, Draggable, Inertia, Physics2D) + Lenis.

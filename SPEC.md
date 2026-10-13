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

- Fundo: preto esverdeado `#0B0F0C`.
- Acento: verde-lima ácido `#C6F24E`. Ele é a cor do site: título de destaque, cursor, HUD, links ativos, linhas de grade.
- Texto principal: osso `#F2F0E8`. Nunca branco puro.
- Texto secundário e mono: cinza-verde `#A9AFA3` (HUD secundário, metadados, legendas).
- Superfície: `#0E120F`, borda `#2A312B`.

Legibilidade: todo texto secundário com contraste mínimo de 4.5:1 sobre o fundo em que está (inclusive as cores dos projetos). Texto corrido com no mínimo 17px no desktop e 16px no mobile.

Na seção de projetos, cada projeto traz a própria cor de fundo (ver abaixo). Fora dela, o site é preto e lima.

Grain fino e neutro (só tons de cinza, sem tingir com a cor do ambiente), no máximo 3% de opacidade, desligado dentro da seção de projetos. Uma grade de linhas 1px a 5% de opacidade no fundo de todas as seções, lembrando papel milimetrado técnico.

**Camadas de cada seção** (menos minimalista, mais camada):
- número da seção em Tanker gigante, só contorno de 1px, apagado, no canto (01, 02...);
- a grade de fundo;
- uma linha divisória de 1px no topo, com o número e o nome da seção em mono no meio (não vai na primeira);
- metadados em mono no rodapé da seção, acima da faixa do HUD (ex.: `02 / 07 · o que eu faço · react · java · postgresql · cloudflare`), definidos em `data/sections.ts`. No celular só número e nome, numa linha (`02 / 07 · o que eu faço`): o resto não cabe em 390px e invadia o conteúdo. Toda seção tem folga embaixo (128px no celular) pra essa linha não encostar em texto ou botão.

## Tipografia

- Display: **Tanker** (Fontshare). Sans pesadíssima e estreita. Títulos gigantes, maiúsculas, tracking apertado. Alternativa se Tanker ficar pesada demais em texto médio: **Panchang** (Fontshare) nos pesos Bold/Extrabold.
- Texto: **Synonym** (Fontshare), Regular e Medium. Sans discreta, técnica.
- Mono: **Commit Mono**, para HUD, stack, ano, status, número de seção, botão do recrutador.

## HUD (elemento de identidade, presente em toda a página)

Nos quatro cantos, em mono pequeno e cinza-verde, informação que dá sensação de sistema ativo:
- canto superior esquerdo: `GUSTAVO BARBOSA LIMA` e abaixo `full-stack · palmas, to`. É um botão: rola pro topo com Lenis (o cursor mostra que é clicável).
- canto superior direito: o atalho `recrutador?` em mono lima com borda de 1px lima, ao lado a hora local em tempo real e as coordenadas de Palmas (`10°10'S 48°20'W`), e o botão `menu` na ponta, com borda de 1px e padding. Os dois têm que parecer clicáveis pra qualquer pessoa.
- canto inferior esquerdo: seção atual (`01 / 07 · abertura`) que atualiza no scroll
- canto inferior direito: `status: disponível para projetos` com um ponto lima piscando devagar

O HUD fica fixo; o conteúdo rola por baixo. Pra não misturar com o conteúdo, os cantos ficam sobre duas faixas (topo e pé da tela) com `backdrop-filter: blur(12px)` e degradê do fundo pro transparente (84px no topo, 64px no pé; no celular 76px e 64px). Nada do conteúdo começa por baixo dessas faixas: as seções têm padding-top suficiente e as composições dos projetos respeitam a margem do HUD. No mobile, o canto superior esquerdo, o inferior esquerdo, o botão `menu` no canto superior direito e o `recrutador?` no canto inferior direito (no alcance do polegar, com fundo escuro e desfoque próprios pra o conteúdo que passa por baixo não cruzar o texto); os dois botões têm 44px de altura. Cabe em 360px com folga (84px entre o rótulo da seção e o botão no pior caso). O HUD vem antes do conteúdo no DOM: é o primeiro Tab da página.

Navegação: sem menu tradicional. Um botão `menu` em mono no topo direito que abre um overlay preto com os itens em Tanker gigante (projetos, como funciona, história, contato) e o atalho `recrutador?`. Fechar com Esc ou clique fora. No mobile o botão `menu` continua visível (é a navegação) e o atalho `recrutador?` fica no canto inferior direito do HUD e também no menu.

## Preloader

Fundo preto, só isso na tela, sem log antes. Um cursor de texto fino em lima pisca. Em Tanker gigante, maiúsculas, digita `Gustavo Lima` letra por letra, faz uma pausa curta, apaga `Lima` com backspace letra por letra e digita `Dev` em lima (`Gustavo` fica em osso). Ritmo de digitação humano: intervalos levemente irregulares, com hesitação no começo de palavra; o backspace é um pouco mais rápido. O cursor fica aceso enquanto digita e pisca quando para. Pausa de 300ms com o nome pronto, e a tela abre pro hero com uma cortina subindo (fade rápido em `prefers-reduced-motion`). O hero começa a entrar junto com a cortina. Com a rede rápida tudo leva uns 1,5 segundo. A cortina só sobe com o essencial do hero carregado (Tanker, Synonym e Commit Mono, e as duas fotos dos cartões já decodificadas): com a rede lenta o nome termina inteiro e o cursor fica piscando até lá, com um teto de 10 segundos pra nunca prender a página. Roda em todo carregamento da página, inclusive ao atualizar. Por trás dele o hero e as fontes carregam desde o primeiro frame: o título já está pintado (e conta como a maior pintura da página) quando a cortina começa a subir; só nesse instante ele se esconde e entra com mola.

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

Título Tanker `NÃO É SÓ A TELA` e, logo abaixo, um palco da altura da tela em quatro passos: TELA, API, BANCO e DEPLOY. Ele usa o mesmo mecanismo do palco de projetos (`src/motion/steppedStage.ts`): prende ao encostar no topo, um gesto vale um passo (wheel, swipe, tecla), por baixo entra direto no último passo já montado, segura a inércia e a barra do iOS, e nas pontas solta a página. Ida e volta são a mesma timeline. Dados em `data/layers.ts`.

- **Cartões com física:** uma pilha de cartões como os de foto da abertura (borda fina, sombra, legenda em mono). A cada passo o cartão da frente sai voando com mola pra uma pilha menor, acima, e revela o de trás em tamanho cheio: o print do site, a resposta da API em JSON, a tabela do banco e o domínio no ar.
- **Projetos reais, marcados:** cada cartão traz uma etiqueta pequena com o projeto de onde vem. Tela e deploy são da TORRA (print e `torra-cafe.pages.dev`, em mono minúsculo); API e banco são do Ecommerce Café (a resposta de `GET /ecommerce/produtos/1` e a tabela `produto` com os quatro cafés do seed). São projetos separados: a etiqueta deixa claro que um não é o back-end do outro. Nada na tela cita a disciplina de onde o Ecommerce Café saiu.
- **Palavra da camada:** a palavra do passo atual em Tanker gigante entra em contorno lima e enche de lima; embaixo, uma linha de log em mono (ex.: `GET /ecommerce/produtos/1 · 200 OK`) e o projeto com a stack.
- **Texto:** três parágrafos curtos e normais, um de cada vez: design e front feitos do zero, sem template (tela); back-end, API e banco (API e banco); deploy, com domínio, hospedagem, SEO e acompanhamento (deploy).
- **Personagem:** um só, que troca de pose a cada passo com o tranco curto: `apontando` (tela), `sentado` (API), `olhando-cima` (banco) e `pulando` (deploy).
- No celular a palavra e o log vêm em cima, os cartões no meio e o texto embaixo; no desktop os cartões ficam à esquerda. Em reduced-motion o passo troca com um fade simples.

### 03 Projetos (cinco, em passos)

Os cinco projetos passam num **palco da altura da tela**, entre duas faixas de degradê (preto para a cor do primeiro, cor do último para preto). Nunca em carrossel.

**Scroll em passos.** A seção não tem altura de scroll interna: é uma tela (100svh) presa, e dentro dela o GSAP Observer é o único controle.
- Entrada: chegando por cima, ao encostar no topo do palco (tolerância de 12px, pra o scroll suave que desacelera não parar a 1px sem prender) o scroll nativo trava (Lenis `stop()`) e entra o primeiro projeto. Chegando por baixo, subindo a página, entra direto o último, já montado: enquanto o palco está inteiro fora da tela, ele fica preparado no projeto pelo qual vai entrar (o último por baixo, o primeiro por cima), então nunca se vê a troca nem um flash de outro projeto. Se o gesto passou da fronteira (flick), o palco desliza até encostar com o Lenis em vez de pular.
- Nenhuma seção vizinha aparece durante uma troca: a saída só acontece com a troca terminada e o intervalo cumprido, e aí o Lenis é liberado e a página segue com o gesto.
- Um gesto vale um passo, qualquer que seja a força. O wheel tem detecção própria (não depende do mouse se mover; a escuta fica ligada sempre que a seção está ativa):
  - um gesto termina quando passam 120ms sem evento, quando a força volta a crescer depois de estar caindo (dedo empurrou de novo enquanto a inércia ainda chegava) ou quando o sentido inverte;
  - o passo sai no primeiro evento em que o gesto acumula 30px; o resto do gesto é descartado;
  - delta em linhas (Firefox) ou páginas é convertido pra pixels.
- Toque: um toque vale no máximo um passo, com tolerância de 40px. Teclado: setas, PageDown/PageUp e espaço; segurar a tecla não repete.
- Gestos que começam durante a troca, no intervalo depois dela (250ms no desktop, 350ms no mobile) ou na chegada à seção são descartados inteiros, até o fim de verdade do gesto: a cauda da inércia do trackpad nunca conta como gesto novo.
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
3. Monte Vinhedo: frame gigante centralizado, quase a tela toda (33px de folga da faixa do HUD); só o nome, `ver no ar` e `ficha técnica` sobrepostos no canto inferior esquerdo, com sombra (o canto de cima é onde o print tem o próprio título).
4. TORRA: o celular é o protagonista, grande no centro; o desktop atrás, menor e inclinado 6 graus; texto centralizado embaixo, terminando a 72px do pé (acima da faixa do HUD).
5. Cleane: metade e metade, frame à esquerda, texto à direita.

Mobile (versão simplificada de cada uma, um frame só). Regra pros cinco: a composição inteira cabe em 100svh, print e texto juntos, sem espaço morto e sem entrar nas faixas do HUD. O texto é medido na página e o bloco (print, espaço e texto) é centralizado na área livre, reduzindo o print quando precisa:
1. Stewer: print desktop em cima, texto logo abaixo.
2. AUTORIA: print desktop grande (88vw, fora do trilho), texto logo abaixo (sobreposto ficava ilegível sobre o carro claro).
3. Monte Vinhedo: print do celular quase em tela cheia, nome e links sobrepostos no canto de baixo.
4. TORRA: print do celular grande no centro, texto embaixo.
5. Cleane: texto em cima, print logo abaixo dos botões, o bloco inteiro centralizado na área livre, dentro da tela.

**No celular (até 767px, toque).** O mesmo palco preso, com os mesmos passos pelo Observer e as mesmas animações e transições. O que muda é só o que o toque e o iOS pedem:
- Enquanto o palco está preso, nada de fora dele aparece. Ele tem 100svh e fundo opaco; atrás dele, um fundo fixo na cor do projeto atual, com a mesma varredura diagonal (mesmo centro, mesmo tempo), cobre o resto da tela: no iOS, com a barra recolhida, a tela é mais alta que 100svh e sobrava uma faixa embaixo mostrando o degradê seguinte. As seções vizinhas ficam escondidas (`visibility: hidden`) até o Lenis ser liberado, e o palco fica com `touch-action: none`.
- Entrada e saída com a mesma lógica do desktop: por baixo entra no último projeto já montado (preparado enquanto o palco está inteiro fora da tela, ou já na montagem se ela acontece com a página abaixo dele); por cima, no primeiro; o encaixe desliza se o gesto passou da fronteira. O adiamento de salto do teclado não vale pro toque: um flick rápido prende na hora.
- A inércia do dedo continua depois de prender (no iOS nenhum JS consegue parar): o palco volta pro lugar a cada passo dela em vez de soltar. Só um salto de mais de uma tela e meia (busca na página) solta.
- Swipe: um passo por gesto, tolerância de 40px, e 350ms de intervalo depois de cada troca (na chegada, contados depois do encaixe). Gesto que começa durante a troca ou no intervalo é descartado inteiro. Ida e volta são a mesma timeline: a volta percorre o mesmo caminho da ida, ao contrário, com o scroll travado o tempo todo.
- Nas pontas, o swipe que solta empurra a página 40% da tela quando o dedo sai, e as vizinhas voltam antes dela andar.
- Barra de endereço: ela muda a altura da janela a cada scroll, mas o palco (100svh) não muda, então nada é reconstruído e a troca em andamento segue inteira. A cada resize os gatilhos da página são recalculados (`ScrollTrigger.refresh()`, depois da troca terminar). Só uma mudança real no tamanho do palco (rotação) reconstrói, e nunca no meio de uma troca.

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

**O que conecta os cinco:** um trilho vertical fixo na lateral esquerda, em mono, visível enquanto o palco está preso, com `01 / 05`... e uma linha fina que se preenche em lima até `05 / 05`. O número troca com glitch curto. **Sem quebra em blocos.** No desktop ele fica no meio da altura da tela; no celular fica na metade de baixo (começa em 54svh), ao lado do texto, porque no meio caía sobre a borda dos prints largos do Stewer e do AUTORIA.

A placa: linha de contexto (cliente ou conceito próprio, cidade, ano de entrega, ex.: `cliente · Palmas, TO · entregue em 2025`), nome, uma linha do que é, stack em mono, `ver no ar` e `ficha técnica`. Nada de texto de conceito.

`ficha técnica` abre um painel lateral (portal no body, mesma mecânica do menu) com arquitetura em duas ou três linhas, três decisões técnicas, link do repositório (com o aviso "código privado, projeto de cliente" quando for o caso) e link do site. No mobile ocupa a tela e fecha no botão `fechar` (no topo e, no celular, também no pé do painel, os dois com 44px) ou com Esc. Todo painel reabre no topo, os links têm 44px de alvo, e enquanto um painel está aberto a página (`#root`) fica inerte: o Tab não sai do painel e o foco volta pra quem abriu ao fechar.

Ordem e cores:

1. **Stewer Gabriel** (2025, cliente) · stewergabriel.com · Visagista e consultor de imagem. Fundo preto-dourado `#14110A`, acento dourado apagado `#8A7A45`. Stack: React, TypeScript, Tailwind, Vite, Cloudflare. Código privado.
2. **AUTORIA.** (2026, conceito próprio) · autoria-6kz.pages.dev · Concessionária de carros com fotos tratadas em pipeline próprio. Fundo preto, acento âmbar-ouro `#C9A24A`. Stack: React, TypeScript, Playwright + rembg.
3. **Monte Vinhedo** (2026, conceito próprio) · monte-vinhedo.pages.dev · Vinícola boutique de vinhos de altitude. Fundo vinho `#3A0F1E`, acento rosé `#C46A7A`. Stack: React, GSAP.
4. **TORRA** (2026, conceito próprio) · torra-cafe.pages.dev · Cafeteria de torra própria. Fundo marrom-café `#2A1B12`, acento laranja queimado `#D8843A`. Stack: React, TypeScript, Tailwind.
5. **Cleane Barbosa** (2025, cliente, primeira cliente) · cleanebarbosa.com.br · Psicanalista e terapeuta EFT. Fundo verde-oliva `#1E2A1F`, acento verde-sálvia `#9BB79A`. Stack: React, TypeScript, Tailwind, Cloudflare. Código privado.

Ritmo: dourado, âmbar, vinho, laranja, verde.

### 04 Outros projetos

Lista logo depois do quinto projeto, visível sem clicar. Título Tanker: `OUTROS NO AR`. Dados em `otherProjects` no `data/projects.ts`, prontos pra crescer.

**Linha fechada:** miniatura real do print desktop (16:10, uns 160px de largura no desktop; sem print, as iniciais do projeto em mono), nome em Tanker, uma linha do que é, metadados em mono (tipo, ano, stack), link e um `+`. No celular o endereço vira só a seta. Hover: a miniatura cresce um pouco e dá um glitch rápido, e a linha acende em lima.

**Linha aberta:** clicar em qualquer ponto da linha abre; só uma aberta por vez; clicar de novo ou Esc fecha. A abertura não anima altura (regra do CLAUDE.md: só transform e opacity): o layout muda de uma vez e as linhas de baixo deslizam com mola da posição antiga pra nova (FLIP), e o conteúdo entra com fade. Dentro: o print desktop grande à esquerda e o mobile menor ao lado; à direita, dois ou três parágrafos normais sobre o projeto (o que é, o que foi feito, decisões técnicas), a stack completa em mono, `ver no ar` como botão preenchido e `código` com borda quando houver repositório. No celular, imagem em cima e texto embaixo.

Prints em `prints-outros/` (`<projeto>-desktop.png` e `-mobile.png`), servidos de `public/prints-outros/` em WebP com versões menores pro srcset.

Ordem (a ONG vem primeiro e já aberta, porque é o design mais forte; as outras fechadas):
- ONG Arte de Amar (2026, projeto em grupo) · arte-de-amar-site.pages.dev · one page de ONG de Palmas, com preloader e um fio verde contínuo em GSAP · React, GSAP
- Tina Aires (2025, cliente) · tinaaires.com.br · neuropsicopedagoga em Porto Nacional, site institucional com SEO técnico completo (robots, sitemap, JSON-LD, Search Console) · React
- Suelen Pratas e Perfumaria (2025, cliente) · suelen.pages.dev · semijoias em prata 925 e perfumaria, editorial claro, catálogo que leva a venda pro WhatsApp · React
- Autômato celular (2026, projeto em grupo) · simulação 2D de acidente nuclear, contaminação e retomada da natureza, com controles de execução e cenário · stack a definir
- FinControl (2026, projeto em grupo) · sistema de controle financeiro · Java, Spring Boot, PostgreSQL · sem imagem por enquanto (iniciais)

Na tela nunca aparece "faculdade" nem "vitrine": a ONG é "projeto em grupo" e a Suelen tem "catálogo".

### 05 Como funciona

Título Tanker: `COMO FUNCIONA`. Quatro passos em linha horizontal (empilhados no celular), numerados em mono, cada um com o personagem na pose do passo, título curto e duas linhas de texto normal: conversa; identidade e design; construção (front, back, API, banco); deploy e acompanhamento. Os blocos entram um a um com o mesmo glitch curto da seção 02. Abaixo, uma linha: "Cada projeto tem escopo e orçamento próprios. O primeiro passo é uma conversa." e o botão `ir para o contato`, que rola até o contato.

### 06 História

Título Tanker: `DESDE OS 16`. Esquerda: a foto do Gustavo (`assets/foto/foto2.png`, natural, com o capuz), como cartão físico que inclina com o mouse. Direita: texto em Synonym, dois parágrafos normais: de Palmas, programa desde os 16, freelance desde 2024, faz site e sistema, o que busca hoje. Abaixo, linha do tempo em mono, com o personagem tomando café ao lado: `2024 a hoje · freelance próprio`, `nov 2025 a mai 2026 · DS Web Dev, freelance remoto`, `mar a jul 2026 · Platano Solution, suporte técnico` (datas com "a", sem traço). Dados em `data/timeline.ts`. Não mencionar faculdade.

### 07 Contato

Título Tanker gigante, uma palavra por linha: `VAMOS` / `CONVERSAR?`, a última palavra em lima. Ao entrar na seção o título é digitado letra por letra, no mesmo ritmo do preloader, com o cursor de texto lima (em reduced-motion aparece pronto). Abaixo, e-mail e WhatsApp em texto grande e clicável e o botão lima `chamar no WhatsApp`, com o personagem acenando ao lado.

Contato (em `data/contact.ts`, o mesmo em todo lugar: contato, painel do recrutador, rodapé e JSON-LD): e-mail `gustavo@gustavodev.dev`; WhatsApp `(63) 99111-4551`, link `https://wa.me/5563991114551?text=Oi%20Gustavo`.

Footer autoral, uma faixa em mono: GitHub (github.com/Gustavo16378), LinkedIn (linkedin.com/in/gustavo-barbosa-lima-341886278), Instagram (@ogustavo_dev), e a stack completa: react · typescript · javascript · tailwind · node.js · java · spring boot · quarkus · postgresql · docker · cloudflare · react native/expo. Também o e-mail. Assinatura: `gustavodev.dev · palmas, to · feito do zero`.

## Personagem

Uma versão ilustrada do Gustavo, em 18 poses com fundo transparente (`personagem-gustavo-poses/gustavo-*.png`, servidas de `public/personagem/` em WebP com PNG de fallback; as três folhas originais não vão pro site). Componente `Personagem` recebe pose e tamanho.

Regras: sempre pequeno (120 a 220px de altura no desktop, 80 a 140px no mobile), nunca compete com o conteúdo, nunca intercepta clique. Entra com mola, flutua de leve em repouso (pausa fora da tela), troca de pose com um tranco curto. Em reduced-motion aparece parado, só com fade. **Nunca dentro da seção de projetos.**

Onde aparece:
- Preloader: `digitando`, no canto inferior esquerdo; sai junto com a cortina.
- Hero: `espiando`, saindo de trás da borda direita do primeiro cartão de foto (a faixa escura da imagem é a parede e se confunde com a borda do cartão). Aparece depois que os cartões assentam e some com fade na primeira vez que o usuário arrasta um cartão.
- 02 O que eu faço: um por passo do palco, trocando de pose: `apontando`, `sentado`, `olhando-cima` e `pulando`.
- 05 Como funciona: uma pose por passo (`pensando`, `desenhando`, `digitando`, `comemorando`), cada uma entrando com fade e quique leve.
- 06 História: `cafe`, ao lado da linha do tempo.
- 07 Contato: `acenando` perto do botão do WhatsApp, com balanço lento; depois de 20 segundos sem interação, troca pra `dormindo`; qualquer interação acorda.
- Ocioso: depois de 30 segundos sem interação, ele atravessa o rodapé da tela com `andando-direita` e volta com `andando-esquerda`, e some assim que o usuário mexe (mouse, toque, teclado ou scroll). Não passa na seção de projetos nem no contato (lá ele já dorme).
- 404: `ombros` centralizado, com "não achei essa página" em Tanker e um link pra voltar. Qualquer caminho que não seja a home mostra essa página, com `noindex`.

As outras poses (`bracos-cruzados`, `frente`, `lado`, `olhando-cima`, `pulando`, `sentado`) ficam disponíveis no componente.

## Atalho do recrutador

Botão `recrutador?` em mono no menu e no HUD: no desktop no canto superior direito (ao lado da hora), no celular no canto inferior direito. O texto é só esse, sem complemento. Abre um painel lateral sobre a página (portal no body, mesma mecânica do menu e da ficha): uma linha de resumo, stack agrupada (front, back, mobile, infra) em mono (`data/stack.ts`), experiência em três linhas (a mesma linha do tempo da História), links GitHub e LinkedIn, WhatsApp, e-mail, e dois botões de CV em PDF: `CV (PT)`, que baixa `public/cv-gustavo-lima.pdf`, e `CV (EN)`, que baixa `public/cv-gustavo-lima-en.pdf` (lista em `data/contact.ts`). Esc ou clique fora fecha. Do menu, o atalho fecha o menu e abre o painel.

## Física e dinamismo (vale pro site inteiro)

Tudo que se move tem massa. Regras gerais:
- Nada chega no lugar em linha reta: entradas com mola (`back.out`, `elastic.out` leve) e overshoot pequeno.
- O scroll tem velocidade e a página sente: títulos e prints ganham skew/rotate proporcionais à velocidade (via Lenis `velocity`) e voltam a zero com mola quando o scroll para.
- Botões e links são magnéticos, de leve: dentro de 80px em volta do botão ele segue o cursor (gsap.quickTo, 0.6s, power3) até no máximo 6px em cada eixo, e ao sair volta ao centro com elastic.out(1, 0.5) em 0.8s. Com o cursor em cima, scale de no máximo 1.02. O transform desses elementos é só do GSAP; mudança de cor ou borda no hover fica em transição CSS de cor, nunca de transform. Vale pra placa dos projetos, menu, recrutador? e links do menu.
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
- Glitch curto na entrada de textos (seção 05) e no hover da lista (04).
- Seção 02 em passos (mesmo mecanismo do palco de projetos): pilha de cartões que voam com mola, palavra da camada enchendo de lima, log em mono, personagem trocando de pose.
- Projetos em passos (desktop e celular): palco preso, um gesto por projeto, cada troca uma timeline completa (frames viajando com mola entre as composições, varredura diagonal de cor, nome em contorno trocando, texto saindo pra cima e entrando de baixo); luz na cor de acento atrás do frame, nome deslizando sozinho, frame flutuando com brilho na borda; trilho lateral acompanhando. Sem blocos. No celular, enquanto preso, fundo fixo na cor do palco e vizinhas escondidas.
- Skew por velocidade de scroll em títulos e nos frames dos projetos; botões magnéticos.
- HUD fixo com hora real e seção atual.
- Navegação (menu, nome no HUD, `ir para o contato`): a seção de destino recebe o foco no fim da rolagem, sem rolar de novo.
- Contato: o personagem vive numa caixa de tamanho fixo; dormir não mexe no layout.
- `public/og.png` (1200x630) gerado com a cara do site: nome em Tanker, linha em Synonym e a foto no cartão.
- Título do contato digitado, como o preloader.
- Personagem pequeno nos pontos definidos, com mola na entrada e flutuação leve; atravessa o rodapé quando o usuário fica parado.
- Tudo com GSAP (ScrollTrigger, Draggable, Inertia, Physics2D) + Lenis.

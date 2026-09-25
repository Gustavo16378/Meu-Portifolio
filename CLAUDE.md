# CLAUDE.md · gustavodev.dev (novo portfólio)

Leia SPEC.md (design e conteúdo) e PLAN.md (ordem de construção) antes de qualquer tarefa. Trabalhe uma etapa do PLAN.md por vez e pare pra aprovação no navegador antes de seguir.

## Stack
- React 18 + TypeScript + Vite + Tailwind CSS. Deploy em Cloudflare Pages.
- Motion: GSAP 3.13+ com ScrollTrigger, Draggable, InertiaPlugin, Physics2DPlugin e SplitText (todos gratuitos desde o 3.13; registrar com `gsap.registerPlugin`). Lenis para scroll suave e leitura de velocidade. Sem Three.js, sem matter.js, a menos que o GSAP não dê conta; avisar antes de trocar.
- Fontes: Tanker, Synonym (Fontshare, via @font-face local em `public/fonts`, nunca CDN) e Commit Mono. Nenhuma serifa. Nada de Inter, Fraunces, Space Grotesk, JetBrains Mono.
- Ícones: Lucide, só quando indispensável.

## Estrutura
```
src/
  components/   um arquivo por seção (Hero, Manifesto, Projects, ProjectStewer... , Others, Process, Story, Contact) + Hud, Cursor, Preloader, Menu, RecruiterPanel, TechSheet
  motion/       hooks e utilitários de GSAP/Lenis (useLenis, useSplitReveal, useMagnetic, useTilt, useScrollSkew, usePhotoCards)
  data/         projects.ts (os cinco + os outros), stack.ts, timeline.ts
  styles/       tokens.css (cores como CSS vars), fonts.css, globals.css
public/fonts, public/prints, public/foto
```
Cores só via CSS vars definidas em tokens.css. Nunca hex solto em componente.

## Regras de código
- Mobile-first: só `min-width` nas media queries. Nada de `overflow: hidden` no body pra travar scroll; usar `position: fixed; top: -scrollY` (iOS).
- Menu, ficha técnica e painel do recrutador: `ReactDOM.createPortal` no body, estilos inline pra posição, z-index overlay 9998 / painel 9999, fechado = `opacity: 0` + `pointerEvents: none` (fica no DOM), Esc e clique no overlay fecham. Transição sempre com propriedades explícitas (`transition-[transform,opacity]`), nunca `transition-all`. `-webkit-backdrop-filter` junto de `backdrop-filter`.
- Animações só em `transform` e `opacity`. Nada que anime `top/left/width/height`.
- Todo ScrollTrigger com `scrub` onde a SPEC diz "controlado pelo scroll, reversível". Matar triggers no unmount (`ctx.revert()` com `gsap.context`).
- `prefers-reduced-motion`: desliga partículas (mostra a foto estática), glitch e quebra em blocos; mantém fades simples.
- Performance: um `gsap.ticker` só, nada de `setInterval` pra animar; matar Draggable/Inertia no unmount; pausar animações contínuas (pêndulo, grãos, respiração) fora da viewport com ScrollTrigger `onToggle`. Lighthouse mobile ≥ 85 em performance antes do deploy.
- Imagens: prints em WebP com fallback PNG, `loading="lazy"` fora do hero, `width/height` sempre.
- Sem `any`. Sem console.log no commit.

## SEO e preview de link (desde o primeiro commit)
No `index.html`: title, description, canonical, OG (title, description, type, url, image 1200×630 em `public/og.png`), Twitter Card `summary_large_image`, lang="pt-BR", theme-color `#070907`. URL de produção como placeholder `https://gustavodev.dev/` até o deploy. `robots.txt` e `sitemap.xml` em `public`.

## Textos
Os textos da SPEC são placeholders com a intenção certa. Escrever normal, direto, sem frase de efeito, sem tom de trailer. Nunca usar travessão (—) em texto de tela; usar vírgula, ponto ou dois-pontos. O Gustavo reescreve depois. Nunca escrever na tela palavras como museu, galeria, exposição, sala, acervo, obra, vitrine, curadoria. Nunca mencionar faculdade ou semestre.

## Fluxo
1. Ler SPEC.md e PLAN.md.
2. Executar só a etapa pedida. Se a etapa pede algo que a SPEC contradiz, perguntar antes.
3. Rodar `npm run dev`, listar o que foi feito e o que conferir no navegador, parar.
4. Commit por etapa, mensagem curta em português (`feat: hero com partículas`).

# gustavodev.dev

Portfólio de Gustavo Barbosa Lima, desenvolvedor full-stack em Palmas, TO. One page em React 18, TypeScript, Vite e Tailwind, com GSAP (ScrollTrigger, Observer, Draggable, Inertia) e Lenis.

## Rodar

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc + vite build, gera dist/
npm run preview   # serve o dist/ pra conferir o build
```

## Deploy

Cloudflare Pages, projeto `meu-portifolio`, build `npm run build` com saída em `dist`. Cada push publica uma versão; a branch de produção é a que responde em gustavodev.dev.

## Onde está cada coisa

- `src/components`: um arquivo por seção, mais HUD, menu, painéis e personagem.
- `src/motion`: GSAP, Lenis e o palco em passos (`steppedStage.ts`), usado pelos projetos e pela seção 02.
- `src/data`: projetos, camadas da seção 02, stack, linha do tempo e contato.
- `src/styles`: cores em `tokens.css` (único lugar com cor literal), fontes e estilos globais.
- `public`: fontes, fotos, prints, personagem, CVs, og.png, robots.txt e sitemap.xml.

Os originais em alta (prints, poses do personagem, vídeos, fotos) ficam fora do repositório, em `C:\Users\Gustavo\Documents\gustavodev-originais`.

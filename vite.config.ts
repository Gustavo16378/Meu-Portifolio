import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Build: o CSS do site (uns 9 KB com gzip) vai dentro do index.html em vez de um arquivo à parte. Tira a requisição
 * que bloqueava a primeira pintura e deixa as cores e a Tanker disponíveis pro preloader estático desde o início.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        for (const [name, asset] of Object.entries(ctx.bundle)) {
          if (asset.type !== 'asset' || !name.endsWith('.css')) continue
          const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${name.replace(/[.]/g, '\\.')}"[^>]*>`)
          if (!tag.test(html)) continue
          html = html.replace(tag, () => `<style>${String(asset.source)}</style>`)
          delete ctx.bundle[name]
        }
        return html
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineCss()],
})

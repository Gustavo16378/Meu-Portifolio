import { getLenis } from './useLenis'

let locks = 0
let savedY = 0

export function isScrollLocked(): boolean {
  return locks > 0
}

/**
 * Trava o scroll sem overflow: hidden (que falha no iOS): o body vira fixed
 * deslocado pela posição atual, e o Lenis para. Chamadas aninhadas são contadas.
 */
export function lockScroll(): void {
  locks += 1
  if (locks > 1) return
  savedY = window.scrollY
  getLenis()?.stop()
  const s = document.body.style
  s.position = 'fixed'
  s.top = `-${savedY}px`
  s.left = '0'
  s.right = '0'
  s.width = '100%'
}

export function unlockScroll(): void {
  if (locks === 0) return
  locks -= 1
  if (locks > 0) return
  const s = document.body.style
  s.position = ''
  s.top = ''
  s.left = ''
  s.right = ''
  s.width = ''
  window.scrollTo(0, savedY)
  const lenis = getLenis()
  if (lenis) {
    // Com o body fixo a página tinha a altura da tela; sem medir de novo o Lenis corta o scroll em 0.
    lenis.resize()
    lenis.start()
    lenis.scrollTo(savedY, { immediate: true, force: true })
  }
}

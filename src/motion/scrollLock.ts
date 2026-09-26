import { getLenis } from './useLenis'
import { ScrollTrigger } from './gsap'

let locks = 0
let savedY = 0
let frozen: HTMLElement[] = []
let paused: ScrollTrigger[] = []
let holds = 0
const lockListeners = new Set<(locked: boolean) => void>()

/** Avisa quando uma camada (menu, ficha) trava ou destrava o scroll. */
export function onLockChange(cb: (locked: boolean) => void): () => void {
  lockListeners.add(cb)
  return () => {
    lockListeners.delete(cb)
  }
}

/**
 * Segura o Lenis parado sem mexer no body (palco de projetos preso). Menu e ficha
 * podem abrir e fechar por cima que o Lenis continua parado até soltar.
 */
export function holdScroll(): void {
  holds += 1
  getLenis()?.stop()
}

export function releaseScroll(): void {
  if (holds === 0) return
  holds -= 1
  if (holds === 0 && locks === 0) getLenis()?.start()
}

/**
 * Com o body fixo nada rola, e um palco sticky volta pro lugar natural (some da tela).
 * Antes de travar, cada sticky vira relative no mesmo deslocamento em que estava preso.
 */
function freezeSticky(): void {
  frozen = Array.from(document.querySelectorAll<HTMLElement>('[data-sticky]')).filter(
    (el) => getComputedStyle(el).position === 'sticky' && el.parentElement,
  )
  const offsets = frozen.map((el) => el.getBoundingClientRect().top - (el.parentElement?.getBoundingClientRect().top ?? 0))
  frozen.forEach((el, i) => {
    el.style.position = 'relative'
    el.style.top = `${offsets[i]}px`
  })
}

function releaseSticky(): void {
  frozen.forEach((el) => {
    el.style.position = ''
    el.style.top = ''
  })
  frozen = []
}

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
  // Com o body fixo o scrollY vira 0; sem isso toda animação com scrub voltaria ao começo por trás do painel.
  paused = ScrollTrigger.getAll()
  paused.forEach((st) => st.disable(false))
  freezeSticky()
  getLenis()?.stop()
  const s = document.body.style
  s.position = 'fixed'
  s.top = `-${savedY}px`
  s.left = '0'
  s.right = '0'
  s.width = '100%'
  lockListeners.forEach((cb) => cb(true))
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
  releaseSticky()
  window.scrollTo(0, savedY)
  const lenis = getLenis()
  if (lenis) {
    // Com o body fixo a página tinha a altura da tela; sem medir de novo o Lenis corta o scroll em 0.
    lenis.resize()
    if (holds === 0) lenis.start()
    lenis.scrollTo(savedY, { immediate: true, force: true })
  }
  paused.forEach((st) => st.enable(false))
  paused = []
  lockListeners.forEach((cb) => cb(false))
}

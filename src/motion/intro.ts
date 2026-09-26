/** Sinal de "a abertura terminou": o preloader dispara, o hero espera por ele pra entrar. */

let done = false
const waiting = new Set<() => void>()

export function finishIntro(): void {
  if (done) return
  done = true
  waiting.forEach((cb) => cb())
  waiting.clear()
}

/** Roda `cb` quando a abertura terminar (na hora, se já terminou). Retorna o cancelamento. */
export function onIntroDone(cb: () => void): () => void {
  if (done) {
    cb()
    return () => undefined
  }
  waiting.add(cb)
  return () => {
    waiting.delete(cb)
  }
}


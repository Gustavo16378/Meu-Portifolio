import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { lockScroll, unlockScroll } from '../motion/scrollLock'

/** Aberto/fechado de uma camada sobre a página, travando o scroll junto. Abrir ou fechar duas vezes não faz nada. */
export function useOverlayState(): { open: boolean; show: () => void; hide: () => void } {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)

  const show = useCallback(() => {
    if (openRef.current) return
    openRef.current = true
    lockScroll()
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    unlockScroll()
    setOpen(false)
  }, [])

  return { open, show, hide }
}

/**
 * Comportamento de diálogo: fechado fica inerte (fora do tab), aberto leva o foco pra dentro,
 * Esc fecha, e ao fechar o foco volta pra quem abriu.
 */
// Painéis abertos: enquanto houver um, a página (#root) fica inerte e o Tab não sai do painel.
let openPanels = 0
const syncPageInert = () => {
  const root = document.getElementById('root')
  if (root) root.inert = openPanels > 0
}

export function useDialog(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
): void {
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    panel.inert = !open
    if (open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      panel.scrollTop = 0
      openPanels += 1
      syncPageInert()
      initialFocusRef.current?.focus({ preventScroll: true })
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
        openPanels -= 1
        syncPageInert()
      }
    }
    returnFocus.current?.focus({ preventScroll: true })
    returnFocus.current = null
  }, [open, onClose, panelRef, initialFocusRef])
}

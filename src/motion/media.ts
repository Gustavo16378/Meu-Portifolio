/**
 * Condições pro gsap.matchMedia. O matchMedia só roda a função quando alguma condição bate,
 * então `any` (sempre verdadeira) garante que o mobile sem reduced-motion também entra.
 */
export const MEDIA = {
  any: 'all',
  desktop: '(min-width: 768px)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

interface GridBackdropProps {
  className?: string
}

const fade = 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)'

/** Grade de papel milimetrado: linhas de 1px em lima a 6%, esmaecendo nas bordas. */
export function GridBackdrop({ className = '' }: GridBackdropProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: 'var(--grid-size) var(--grid-size)',
        backgroundPosition: 'center center',
        maskImage: fade,
        WebkitMaskImage: fade,
      }}
    />
  )
}

'use client'

export function LandingBackgrounds() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 18%, rgba(58,169,190,0.14), transparent 32%), radial-gradient(circle at 80% 12%, rgba(111,200,181,0.12), transparent 30%), radial-gradient(circle at 50% 70%, rgba(58,169,190,0.08), transparent 45%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    </>
  )
}

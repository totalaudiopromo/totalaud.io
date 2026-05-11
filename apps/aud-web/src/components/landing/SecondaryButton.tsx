import Link from 'next/link'

// Secondary button
export function SecondaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        background: 'transparent',
        color: '#F7F8F9',
        borderRadius: '60px',
        fontSize: '15px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        textDecoration: 'none',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
        e.currentTarget.style.background = 'rgba(58, 169, 190, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}

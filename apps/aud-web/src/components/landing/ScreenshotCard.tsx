import Image from 'next/image'

// macOS chrome screenshot card (matches TAP landing page effect)
export function ScreenshotCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position: 'relative', marginTop: '24px' }}>
      {/* Cyan glow behind screenshot */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          borderRadius: '24px',
          opacity: 0.3,
          filter: 'blur(24px)',
          background:
            'radial-gradient(ellipse at center, rgba(14, 116, 144, 0.25), transparent 70%)',
        }}
      />
      <div
        style={{
          overflow: 'hidden',
          borderRadius: '12px',
          backgroundColor: 'rgba(20, 20, 24, 0.95)',
          padding: '6px',
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.25), 0 8px 20px -8px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Window chrome -- macOS traffic lights */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 10px',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ff5f57',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#febc2e',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#28c840',
            }}
          />
        </div>
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '0 0 8px 8px',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

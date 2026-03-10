import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'totalaud.io - Calm creative workspace for independent artists'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // We can load custom fonts here if we wanted, but for speed/simplicity
  // we'll rely on system fonts or standard sans-serif which aligns with the clean aesthetic

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0B0C',
          backgroundImage: 'radial-gradient(circle at 50% 10%, #1a1d21 0%, #0A0B0C 50%)',
          position: 'relative',
        }}
      >
        {/* Glow Effects - Satori friendly radial gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(58, 169, 190, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-100px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(58, 169, 190, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
        >
          {/* Logo / Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            {/* Simple CSS Logo representation since we can't easily import SVG here without fs */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(58, 169, 190, 0.3)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '4px solid #fff',
                  borderRadius: '50%',
                }}
              />
            </div>

            {/* Satori friendly gradient text via SVG */}
            <svg width="420" height="90" viewBox="0 0 420 90" style={{ margin: 0, padding: 0 }}>
              <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="75"
                fontSize="80"
                fontWeight="600"
                letterSpacing="-0.03em"
                fill="url(#textGradient)"
                style={{ fontFamily: 'monospace' }}
              >
                totalaud.io
              </text>
            </svg>
          </div>

          <p
            style={{
              fontSize: '32px',
              color: '#9CA3AF',
              fontWeight: 400,
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              margin: '20px 0 0',
            }}
          >
            One calm workspace for everything that matters to independent artists.
          </p>

          <div
            style={{
              marginTop: '60px',
              display: 'flex',
              gap: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                color: '#3AA9BE',
              }}
            >
              <div
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3AA9BE' }}
              />
              Scout
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                color: '#3AA9BE',
              }}
            >
              <div
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3AA9BE' }}
              />
              Plan
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                color: '#3AA9BE',
              }}
            >
              <div
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3AA9BE' }}
              />
              Pitch
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

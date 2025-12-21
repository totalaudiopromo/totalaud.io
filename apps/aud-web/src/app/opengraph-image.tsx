/* eslint-disable @next/next/no-img-element */
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
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            background: 'rgba(58, 169, 190, 0.15)',
            filter: 'blur(120px)',
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
            background: 'rgba(58, 169, 190, 0.1)',
            filter: 'blur(120px)',
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

            <h1
              style={{
                fontSize: '80px',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.03em',
                margin: 0,
                padding: 0,
                background: 'linear-gradient(to right, #fff, #9CA3AF)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              totalaud.io
            </h1>
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
            One calm workspace for everything that matter to independent artists.
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

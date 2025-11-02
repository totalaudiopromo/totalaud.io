/**
 * Share Page Layout with Metadata
 * Phase 14.7: SEO and Open Graph tags
 */

import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { sceneId: string } }): Promise<Metadata> {
  const { sceneId } = params

  // Fetch scene data for metadata
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

  try {
    const response = await fetch(`${baseUrl}/api/canvas/public?shareId=${sceneId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Scene not found')
    }

    const data = await response.json()
    const title = `signal — ${data.title || 'untitled'} | totalaud.io`
    const description = data.artist
      ? `${data.artist}'s signal${data.goal ? ` for ${data.goal}` : ''}`
      : 'shared signal from totalaud.io'

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        url: `${baseUrl}/share/${sceneId}`,
        title,
        description,
        images: [`${baseUrl}/api/og/scene/${sceneId}`],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${baseUrl}/api/og/scene/${sceneId}`],
      },
    }
  } catch (error) {
    return {
      title: 'shared signal | totalaud.io',
      description: 'view shared signal from totalaud.io',
    }
  }
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

/**
 * Texture Management
 * Handles loading and fallback for theme textures
 */

export interface TextureAsset {
  id: string
  path: string
  loaded: boolean
}

const textureCache = new Map<string, boolean>()

/**
 * Check if a texture file exists
 */
export async function textureExists(path: string): Promise<boolean> {
  // Check cache first
  if (textureCache.has(path)) {
    return textureCache.get(path)!
  }

  try {
    const response = await fetch(path, { method: 'HEAD' })
    const exists = response.ok
    textureCache.set(path, exists)
    return exists
  } catch {
    textureCache.set(path, false)
    return false
  }
}

/**
 * Get texture URL with fallback
 */
export async function getTextureUrl(
  primaryPath: string | undefined,
  fallback: 'noise' | 'gradient' | 'none' = 'none'
): Promise<string | null> {
  if (!primaryPath) {
    return getFallbackTexture(fallback)
  }

  const exists = await textureExists(primaryPath)
  if (exists) {
    return primaryPath
  }

  console.warn(`Texture not found: ${primaryPath}, using fallback`)
  return getFallbackTexture(fallback)
}

/**
 * Generate fallback texture
 */
function getFallbackTexture(type: 'noise' | 'gradient' | 'none'): string | null {
  if (type === 'none') return null

  if (type === 'noise') {
    // Return data URL for procedural noise
    return generateNoiseDataUrl()
  }

  if (type === 'gradient') {
    // Return CSS gradient
    return 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)'
  }

  return null
}

/**
 * Generate a noise texture as data URL
 */
function generateNoiseDataUrl(size: number = 256): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''

  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255
    data[i] = noise     // R
    data[i + 1] = noise // G
    data[i + 2] = noise // B
    data[i + 3] = 30    // A (low opacity)
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

/**
 * Preload textures for a theme
 */
export async function preloadTextures(texturePaths: (string | undefined)[]): Promise<void> {
  const validPaths = texturePaths.filter(Boolean) as string[]
  
  const promises = validPaths.map(path => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        textureCache.set(path, true)
        resolve()
      }
      img.onerror = () => {
        textureCache.set(path, false)
        resolve()
      }
      img.src = path
    })
  })

  await Promise.all(promises)
}

/**
 * Generate CSS for procedural grid texture
 */
export function generateGridTexture(
  color: string,
  spacing: number = 20,
  lineWidth: number = 1
): string {
  return `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${spacing - lineWidth}px,
      ${color} ${spacing - lineWidth}px,
      ${color} ${spacing}px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent ${spacing - lineWidth}px,
      ${color} ${spacing - lineWidth}px,
      ${color} ${spacing}px
    )
  `.trim()
}


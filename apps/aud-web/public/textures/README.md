# Texture Assets

This directory contains texture overlays for different OS themes.

## File Naming Convention

Textures should be named according to their theme:
- `ascii-*.png` - ASCII Terminal textures
- `xp-*.png` - Windows XP textures
- `aqua-*.png` - Mac OS Aqua textures
- `ableton-*.png` - Ableton Mode textures
- `punk-*.png` - Punk Zine textures

## Texture Types

### Overlays (Full-screen effects)
- `crt-scanlines.png` - CRT monitor scanline effect
- `plastic-gloss.png` - Glossy plastic surface
- `brushed-metal.png` - Brushed aluminum texture
- `paper-noise.png` - Subtle paper grain
- `xerox-grit.png` - Photocopier grain/halftone

### Patterns (Tiled backgrounds)
- `terminal-noise.png` - Static/noise for terminal
- `gui-reflections.png` - GUI element reflections
- `aqua-reflection.png` - Water/glass reflection
- `waveform-subtle.png` - Audio waveform pattern
- `torn-paper.png` - Torn/ripped paper edges

## Format

- **Size**: 1920x1080 recommended for overlays
- **Format**: PNG with alpha channel
- **Optimization**: Use TinyPNG or similar to keep file sizes < 500KB
- **Opacity**: Most textures should be semi-transparent (20-40% opacity)

## Fallback

If a texture is missing, the app will:
1. Try to load from this directory
2. Fall back to CSS-generated texture
3. Continue without texture overlay

## Adding Custom Textures

To add your own textures:
1. Save PNG files to this directory
2. Reference them in theme config: `textures.overlay = 'your-texture.png'`
3. Textures are loaded dynamically from `/textures/[filename]`


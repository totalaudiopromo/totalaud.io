# Texture Assets

This directory contains custom texture overlays for TotalAud.io themes.

## Required Textures

### ASCII Terminal
- `scanline.png` - CRT scanline overlay (1920x1080, low opacity horizontal lines)
- `noise-dark.png` - Dark noise pattern (512x512 tileable)

### Windows XP Studio
- `plastic-gloss.png` - Blue plastic gloss texture (2048x2048)

### Mac OS Retro (Aqua)
- `brushed-metal.png` - Brushed aluminum texture (2048x2048)

### Punk Zine
- `xerox-grit.png` - Photocopy texture with grain (2048x2048)
- `torn-paper.png` - Torn paper edge overlay (2048x2048)

## How to Generate

All textures should be:
- **Custom-made** (not copyrighted)
- **PNG format** with transparency where appropriate
- **Tileable** for patterns
- **Optimized** (<500KB each)

You can generate these using:
- Photoshop / GIMP filters
- Substance Designer
- Procedural generation scripts
- Your own photography (paper, metal, etc.)

## Fallback

If textures are missing, the app will use procedural CSS fallbacks:
- Scanlines → CSS repeating-linear-gradient
- Noise → Canvas-generated noise
- Grid → CSS background patterns

## Legal

⚠️ **Important**: Only use textures you've created or have proper license for.
Never use textures extracted from copyrighted software (Windows, macOS, Ableton, etc.)

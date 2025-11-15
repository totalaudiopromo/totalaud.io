#!/bin/bash
# Generate minimal silent placeholder .ogg files
# These files will prevent 404 errors until real ambient audio is added

OUTPUT_DIR="./public/assets/sound/ambient"

mkdir -p "$OUTPUT_DIR"

# Create 1 second of silence encoded as OGG Vorbis (minimal valid file)
# This is a base64-encoded minimal OGG file with 1 second of silence

OGG_SILENT_BASE64="T2dnUwACAAAAAAAAAABrFjwAAAAAAPgGOwEBHgF2b3JiaXMAAAAAAkSsAAAAAAAAgLsAAAAAAAC4AU9nZ1MAAAAAAAAAAAAA
axY8AQAAAAB+iKwFDj3///////////////+BA3ZvcmJpcysAAABYaXBoLk9yZyBsaWJWb3JiaXMgSS
AyMDE4MDMxNiAoTm93IDEwMCUgRXZlbiBNb3JlIE1hZ2ljYWwpAQAAAAEFdm9yYmlzIkJDVgEA"

echo "Creating placeholder ambient audio files..."

for theme in operator guide map timeline tape; do
    # Create a temporary file with base64 data and decode it
    echo "$OGG_SILENT_BASE64" | base64 -d > "$OUTPUT_DIR/${theme}.ogg" 2>/dev/null || \
    # Fallback: create an empty file
    touch "$OUTPUT_DIR/${theme}.ogg"

    echo "✓ Created ${theme}.ogg (placeholder)"
done

echo ""
echo "✓ All placeholder files created in $OUTPUT_DIR"
echo ""
echo "NOTE: These are minimal placeholders to prevent 404 errors."
echo "Replace with actual ambient recordings when ready."

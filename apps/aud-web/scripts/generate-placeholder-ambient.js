#!/usr/bin/env node
/**
 * Generate Placeholder Ambient Audio Files
 *
 * Creates simple sine wave .ogg files for each theme using ffmpeg.
 * These are temporary placeholders until real ambient audio is added.
 *
 * Usage: node scripts/generate-placeholder-ambient.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Theme configurations from ambient.ts
const themes = [
  { id: 'operator', frequency: 220, duration: 8 },
  { id: 'guide', frequency: 440, duration: 12 },
  { id: 'map', frequency: 330, duration: 10 },
  { id: 'timeline', frequency: 480, duration: 4 },
  { id: 'tape', frequency: 280, duration: 16 },
];

const outputDir = path.join(__dirname, '../public/assets/sound/ambient');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✓ Created directory: ${outputDir}`);
}

// Check if ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('✗ ffmpeg not found. Please install ffmpeg:');
  console.error('  macOS: brew install ffmpeg');
  console.error('  Linux: sudo apt-get install ffmpeg');
  process.exit(1);
}

console.log('Generating placeholder ambient audio files...\n');

themes.forEach(({ id, frequency, duration }) => {
  const outputPath = path.join(outputDir, `${id}.ogg`);

  try {
    // Generate sine wave with fade in/out for smooth looping
    // -f lavfi: Use libavfilter virtual input device
    // aevalsrc: Generate audio from expression
    // -af afade: Apply fade in/out
    const command = `ffmpeg -y -f lavfi -i "aevalsrc=sin(${frequency}*2*PI*t):d=${duration}" \
      -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${duration - 0.5}:d=0.5,volume=0.3" \
      -c:a libvorbis -q:a 4 "${outputPath}"`;

    execSync(command, { stdio: 'ignore' });
    console.log(`✓ Generated ${id}.ogg (${frequency}Hz sine wave, ${duration}s)`);
  } catch (error) {
    console.error(`✗ Failed to generate ${id}.ogg:`, error.message);
  }
});

console.log('\n✓ All placeholder ambient files generated!');
console.log('\nThese are simple sine wave placeholders.');
console.log('Replace with real ambient recordings later.\n');

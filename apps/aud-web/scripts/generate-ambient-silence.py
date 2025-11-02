#!/usr/bin/env python3
"""
Generate Minimal Silent OGG Vorbis Files

Creates proper silent .ogg files for ambient audio placeholders.
Requires: numpy, scipy (usually pre-installed on macOS)
"""

import os
import numpy as np
from scipy.io import wavfile
import subprocess
import sys

# Theme durations from ambient.ts config
themes = {
    'operator': 8,
    'guide': 12,
    'map': 10,
    'timeline': 4,
    'tape': 16,
}

output_dir = './public/assets/sound/ambient'
os.makedirs(output_dir, exist_ok=True)

# Generate silent WAV files then convert to OGG
sample_rate = 44100  # CD quality

print("Generating silent ambient audio files...\n")

for theme_id, duration in themes.items():
    wav_path = f"/tmp/{theme_id}_temp.wav"
    ogg_path = f"{output_dir}/{theme_id}.ogg"

    try:
        # Create silent audio data
        samples = int(sample_rate * duration)
        silence = np.zeros(samples, dtype=np.int16)

        # Write WAV file
        wavfile.write(wav_path, sample_rate, silence)

        # Check if ffmpeg is available
        try:
            # Convert WAV to OGG using ffmpeg (silent)
            subprocess.run(
                ['ffmpeg', '-y', '-i', wav_path, '-c:a', 'libvorbis', '-q:a', '1', ogg_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            print(f"✓ Generated {theme_id}.ogg ({duration}s silence)")
        except (FileNotFoundError, subprocess.CalledProcessError):
            print(f"✗ ffmpeg not found, skipping {theme_id}.ogg")
            # Clean up temp file
            if os.path.exists(wav_path):
                os.remove(wav_path)
            continue

        # Clean up temp WAV file
        if os.path.exists(wav_path):
            os.remove(wav_path)

    except Exception as e:
        print(f"✗ Failed to generate {theme_id}.ogg: {e}")

print("\n✓ Placeholder ambient files generated!")
print("\nNOTE: These are silent placeholders.")
print("Replace with actual ambient recordings when ready.\n")

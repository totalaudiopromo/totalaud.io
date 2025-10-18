# Sound Assets

This directory contains audio files for UI feedback and theme-specific sounds.

## File Structure

Sounds are organized by theme:
- `ascii/` - Terminal beeps and typing
- `xp/` - Windows XP sounds
- `aqua/` - Mac OS sounds  
- `ableton/` - DAW-style sounds
- `punk/` - Punk/DIY sounds

## Sound Types

### Boot Sounds (Theme entry)
- `beep-sequence.mp3` - ASCII boot sequence
- `xp-startup.mp3` - Windows XP startup sound
- `mac-chime.mp3` - Mac startup chime
- `sequencer-start.mp3` - Ableton sequencer click
- `tape-start.mp3` - Tape deck start

### Ambient Loops (Optional background)
- `typing-soft.mp3` - Soft keyboard typing
- `vinyl-hiss.mp3` - Record player noise
- `synth-pad.mp3` - Soft synthesizer pad
- `tape-hiss.mp3` - Cassette tape noise

### Click/Interaction Sounds
- `mechanical-key.mp3` - Mechanical keyboard click
- `xp-click.mp3` - Windows XP click sound
- `aqua-pop.mp3` - Mac OS Aqua pop
- `clip-trigger.mp3` - Ableton clip trigger
- `stamp-press.mp3` - Rubber stamp sound

## Format

- **Format**: MP3 (best compatibility) or OGG
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps (sufficient for UI sounds)
- **Length**: < 1 second for clicks, < 3 seconds for boots
- **Volume**: Normalized to -12dB to -6dB

## Fallback

If sound files are missing, the app uses Web Audio API to generate synthetic tones.

## Credits

All sounds should be:
- Royalty-free or open-source
- Properly attributed in app credits
- Under 100KB per file when possible


# Ambient Soundscapes - Audio File Specifications

Phase 13.0: FlowCore Studio Aesthetics

## Required Audio Files

All files should be `.ogg` format (Opus codec) for web compatibility.

### 1. operator.ogg
- **Duration**: 8 seconds (seamless loop)
- **Character**: Square wave ambient, terminal-like, digital
- **LUFS**: -20
- **Vibe**: Minimal, focused, precise typing atmosphere
- **Reference**: Blade Runner terminal rooms, SSH session background

### 2. guide.ogg
- **Duration**: 12 seconds (seamless loop)
- **Character**: Soft sine pad, warm and inviting
- **LUFS**: -18
- **Vibe**: Friendly, approachable, gentle encouragement
- **Reference**: Cozy coffee shop ambient, warm studio

### 3. map.ogg
- **Duration**: 10 seconds (seamless loop)
- **Character**: Triangle wave sonar pings, spatial precision
- **LUFS**: -22
- **Vibe**: Strategic, blueprint-like, architect's desk
- **Reference**: Radar ping, submarine sonar, mission control

### 4. timeline.ogg
- **Duration**: 4 seconds (seamless loop)
- **Character**: Sawtooth pulse at 120 BPM (500ms per beat)
- **LUFS**: -19
- **Vibe**: Rhythmic, temporal, sequencer running
- **Reference**: DAW metronome, tape transport, clock ticking

### 5. tape.ogg
- **Duration**: 16 seconds (seamless loop)
- **Character**: Warm sine with vinyl crackle, lo-fi texture
- **LUFS**: -20
- **Vibe**: Nostalgic, warm, human touch, studio warmth
- **Reference**: Cassette tape hiss, vinyl surface noise, analog warmth

## Production Notes

- All loops must be **seamless** (no clicks at loop point)
- Export at **48kHz / 24-bit** before Ogg conversion
- Use **-18 to -22 LUFS** for comfortable background listening
- Test with `prefers-reduced-motion` - ambient should respect this
- Cross-fade duration: 600-800ms between theme switches

## Integration

These files are loaded and managed by:
- `apps/aud-web/src/design/core/sounds/ambient.ts` - AmbientPlayer class
- Respects global mute toggle (⌘M)
- Auto-disabled if `prefers-reduced-motion: reduce`

## Placeholder Status

🚧 **PLACEHOLDER FILES NEEDED** - These .ogg files must be created by audio designer.

For development testing, the AmbientPlayer gracefully handles missing files with console warnings.

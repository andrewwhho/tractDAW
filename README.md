ROADMAP:

1. Sound assets and Sample loader
  - select drum and one shot sounds (one shots tuned to C4)
  - implement `SampleLoader.ts` to fetch and decode files via `audioContext.decodeAudioData()`
    - add fallback or backup so app plays even if external assets are offline

2. Audio Engine Core
  - Implement `LookaheadScheduler.ts`
    - 25ms timer interval checking 100ms into the future against `audioContext.currentTime`
    - Calculates 16th note step intervals based on BPM $\Delta t = \frac{60}{\text{BPM} \times 4}$
  - Implement `VoiceManager.ts`
    - Drum one shot scheduling with `AudioBufferSourceNode`
    - Melodic pitch transportation using semitone formula $\text{playbackRate} = 2^{\frac{\text{MIDI} - 60}{12}}
    - anti click volume envelopes
  - Connect `AudioEngine.ts`
    - Master volume node, audio context unlock oin first user interaction, and start/stop methods

4. Mixer Bus and Audio Effects

5. State Store and Visual Play head sync

6. Channel Rack and Main Sequencer UI

7. Piano Roll and Mixer drawer

8. Standalone app polish and portfolio integration

ROADMAP:

1. Sound assets and Sample loader
  - select drum and one shot sounds (one shots tuned to C4)
  - implement `SampleLoader.ts` to fetch and decode files via `audioContext.decodeAudioData()`
    - add fallback or backup so app plays even if external assets are offline

2. Audio Engine Core
  - Implement `LookaheadScheduler.ts`
    - 25ms timer interval checking 100ms into the future against `audioContext.currentTime`
    - Calculates 16th note step intervals based on BPM $\delta t = \frac{60}{\text{BPM} \times 4}$

4. Mixer Bus and Audio Effects

5. State Store and Visual Play head sync

6. Channel Rack and Main Sequencer UI

7. Piano Roll and Mixer drawer

8. Standalone app polish and portfolio integration

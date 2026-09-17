# tractDAW: Engineering Roadmap & Specifications

A lightweight, sample-accurate 10-track mini web DAW built with pure vanilla Web Audio API, React 19, and TypeScript. Designed to run both as a standalone hardware groovebox web app and as an embedded draggable window within the portfolio desktop environment.

---

## Technical Specifications & Mathematical Foundations

### 1. 16th-Note Lookahead Timing Interval
The sequencer operates on a 16-step grid (1 bar of 16th notes). The duration of a single 16th-note step $\Delta t_{\text{step}}$ in seconds is given by:

$$\Delta t_{\text{step}} = \frac{60}{\text{BPM} \times 4}$$

* **Lookahead Interval ($t_{\text{interval}}$):** $25\text{ ms}$
* **Schedule-Ahead Window ($t_{\text{ahead}}$):** $100\text{ ms}$

### 2. Melodic Pitch Transposition Formula
Melodic one-shots (tuned to root $C_4$, MIDI note 60) are repitched across a 2–3 octave range using the exponential equal-temperament playback rate formula:

$$\text{playbackRate} = 2^{\frac{\Delta \text{semitones}}{12}} = 2^{\frac{\text{MIDI} - 60}{12}}$$

$$\text{Frequency Ratio Reference:}\quad C_3 \ (48) \rightarrow 0.5 \times, \quad C_4 \ (60) \rightarrow 1.0 \times, \quad C_5 \ (72) \rightarrow 2.0 \times$$

### 3. Audio Node Routing Topology

$$\text{Source Node} \longrightarrow \text{Track Gain} \longrightarrow \text{3-Band EQ} \longrightarrow \begin{cases} \text{Master Bus} \longrightarrow \text{Destination} \\ \text{Reverb Send Bus} \longrightarrow \text{ConvolverNode} \longrightarrow \text{Master Bus} \end{cases}$$

---

## Development Roadmap

### Phase 1: Sound Assets & Sample Loader
* **Drums (7 One-Shots):** Kick, Snare, Clap, Closed Hat, Open Hat, Tom/808, Perc/Shaker.
* **Melodic (3 One-Shots @ $C_4$):** Grand Piano, Rhodes Electric Piano, 808 Sub-Bass.
* **SampleLoader:** Decodes `.wav` buffers into cached `AudioBuffer` maps with offline/algorithmic fallbacks.

### Phase 2: Core Audio Engine & Lookahead Clock
* **LookaheadScheduler:** Decouples the 25ms timer interval from the non-blocking hardware audio clock (`audioContext.currentTime`).
* **VoiceManager:** Sample-accurate one-shot triggers and pitch-shifted melodic notes with anti-click release envelopes.
* **AudioEngine:** Master coordinator, browser autoplay policy resume, and global lifecycle hooks.

### Phase 3: Mixer Bus & Audio Effects
* **3-Band EQ:** Serial BiquadFilter cascade:
  * Low Shelf: $200\text{ Hz}$, gain $\pm 12\text{ dB}$
  * Peaking Mid: $1.5\text{ kHz}$, $Q = 1.0$, gain $\pm 12\text{ dB}$
  * High Shelf: $8.0\text{ kHz}$, gain $\pm 12\text{ dB}$
* **Reverb Bus:** Native `ConvolverNode` with a zero-dependency algorithmic stereo noise-decay impulse response.

### Phase 4: Decoupled State & Visual Synchronization
* **Zustand Store (`dawStore.ts`):** Reactive state for BPM, active steps, track parameters, and presets.
* **rAF Visual Playhead:** `requestAnimationFrame` loop polling hardware playback time to illuminate steps at 60fps without triggering React component re-renders.

### Phase 5: Channel Rack & Main Sequencer UI
* **Fixed Dimensions:** $860\text{px} \times 540\text{px}$ hardware console footprint.
* **Transport Bar:** Play, Stop, BPM scrubber (60–200 BPM), Master Volume, FX Drawer toggle.
* **Channel Rack Grid:** 10 track rows $\times$ 16 step buttons with 4-beat color groupings (beats 1 & 3 dark, beats 2 & 4 light).

### Phase 6: Melodic Piano Roll & Mixer Drawer
* **Piano Roll Modal:** 2–3 octave vertical keyboard ($C_3$ to $B_5$) with a 16-step trigger matrix.
* **Mixer Drawer:** Parametric EQ knobs and Reverb send/decay sliders.

### Phase 7: Standalone Polish & Portfolio Window Integration
* **Standalone Mode:** Centered hardware groovebox viewport with global keyboard shortcuts (`Space` = Play/Stop).
* **Portfolio Mode:** Integration inside `<WindowPane id="daw">` with auto-suspension of `AudioContext` on window close.

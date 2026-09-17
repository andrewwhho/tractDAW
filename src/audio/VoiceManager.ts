import { VoiceTriggerOptions } from '../types';

interface ActiveVoice {
  gainNode: GainNode;
  source: AudioBufferSourceNode;
}

/**
 * VoiceManager handles triggering Web Audio hardware voices at exact timestamps.
 * Supports:
 *  - Unpitched drum one-shots
 *  - Equal-temperament pitch transposition (2^(Δ/12))
 *  - Anti-click release volume envelopes
 *  - Monophonic choke groups ("Cut Itself") for 808s and basslines
 */
export class VoiceManager {
  private audioCtx: AudioContext;
  private activeChokedVoices: Map<string, ActiveVoice> = new Map();

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Triggers a voice at an exact hardware audio timestamp.
   */
  public triggerVoice(
    buffer: AudioBuffer,
    destination: AudioNode,
    playbackTime: number,
    options?: VoiceTriggerOptions
  ): AudioBufferSourceNode {
    const rootNote = options?.rootNote ?? 60;
    const targetNote = options?.midiNote;
    const gain = options?.gain ?? 1.0;
    const chokeKey = options?.chokeKey;

    // 1. Handle Monophonic Choking ("Cut Itself")
    if (options?.shouldChoke && chokeKey) {
      const existingVoice = this.activeChokedVoices.get(chokeKey);
      if (existingVoice) {
        // Quick 10ms ramp-down to prevent mud and eliminate speaker pops
        existingVoice.gainNode.gain.cancelScheduledValues(playbackTime);
        existingVoice.gainNode.gain.setValueAtTime(existingVoice.gainNode.gain.value, playbackTime);
        existingVoice.gainNode.gain.linearRampToValueAtTime(0.0001, playbackTime + 0.01);
        existingVoice.source.stop(playbackTime + 0.012);
        this.activeChokedVoices.delete(chokeKey);
      }
    }

    // 2. Create the AudioBufferSourceNode
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;

    // 3. Apply Pitch Transposition Formula: playbackRate = 2^((MIDI - 60) / 12)
    if (targetNote !== undefined) {
      const semitones = targetNote - rootNote;
      const rate = Math.pow(2, semitones / 12);
      source.playbackRate.setValueAtTime(rate, playbackTime);
    }

    // 4. Create dedicated note GainNode for anti-click volume envelope
    const noteGain = this.audioCtx.createGain();
    noteGain.gain.setValueAtTime(gain, playbackTime);

    // Optional duration clamping with micro fade-out
    if (options?.duration && options.duration > 0) {
      const stopTime = playbackTime + options.duration;
      const fadeStartTime = Math.max(playbackTime, stopTime - 0.015);
      noteGain.gain.setValueAtTime(gain, fadeStartTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
      source.stop(stopTime);
    }

    // 5. Connect Signal Chain: Source -> NoteGain -> Track Destination
    source.connect(noteGain);
    noteGain.connect(destination);

    // 6. Schedule Start Time
    source.start(playbackTime);

    // 7. Register Choke Voice
    if (options?.shouldChoke && chokeKey) {
      const voiceRecord: ActiveVoice = { gainNode: noteGain, source };
      this.activeChokedVoices.set(chokeKey, voiceRecord);

      source.onended = () => {
        if (this.activeChokedVoices.get(chokeKey)?.source === source) {
          this.activeChokedVoices.delete(chokeKey);
        }
      };
    }

    return source;
  }

  /**
   * Immediately stops and cleans up all active voices (e.g., when transport Stop is pressed).
   */
  public stopAllVoices(stopTime?: number): void {
    const time = stopTime ?? this.audioCtx.currentTime;
    for (const [key, voice] of this.activeChokedVoices.entries()) {
      try {
        voice.gainNode.gain.cancelScheduledValues(time);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, time);
        voice.gainNode.gain.linearRampToValueAtTime(0.0001, time + 0.01);
        voice.source.stop(time + 0.012);
      } catch (_) {
        // Voice might already be finished
      }
      this.activeChokedVoices.delete(key);
    }
  }
}


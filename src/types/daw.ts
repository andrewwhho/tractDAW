/**
 * DAW Core Domain Types & Data Models
 */

export type TrackType = 'drum' | 'melodic';

export type DrumSoundKey = 
  | 'kick'
  | 'snare'
  | 'hihat_closed'
  | 'hihat_open'
  | 'clap'
  | 'perc';

export type MelodicSoundKey = 
  | 'piano_c4'
  | 'rhodes_c4'
  | 'bass_c4';

export type SampleKey = DrumSoundKey | MelodicSoundKey;

export interface NoteTrigger {
  midiNote: number; // 60 = C4
  velocity: number; // 0.0 - 1.0
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  sampleKey: SampleKey;
  volume: number;       // 0.0 - 1.0 (or dB)
  pan: number;          // -1.0 to 1.0
  isMuted: boolean;
  isSoloed: boolean;
  reverbSend: number;   // 0.0 - 1.0
  steps: boolean[];     // Fixed 16-step grid triggers
  pitches: number[];    // MIDI note per step (default 60 for C4)
}

export interface EQSettings {
  lowGain: number;      // -12dB to +12dB
  midGain: number;      // -12dB to +12dB
  highGain: number;     // -12dB to +12dB
}

export interface ReverbSettings {
  decay: number;        // Seconds (e.g. 1.5)
  mix: number;          // Dry/Wet ratio 0.0 - 1.0
  enabled: boolean;
}

export interface SequencerState {
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;   // 16
}

export interface ScheduledStepEvent {
  stepIndex: number;
  playbackTime: number;
}


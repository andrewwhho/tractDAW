/**
 * DAW Core Domain Types & Data Models
 */

export type TrackType = 'drum' | 'melodic';

export type SampleCategory = 
  | 'kicks'
  | 'snares'
  | 'claps'
  | 'hihats_closed'
  | 'hihats_open'
  | 'percussion'
  | 'extras'
  | 'keys'
  | 'synths'
  | '808s'
  | 'bass';

export interface SampleMetadata {
  id: string;               // e.g. 'kick_808', 'piano_grand'
  name: string;             // e.g. '808 Sub Kick', 'Grand Piano'
  category: SampleCategory;
  type: TrackType;
  url: string;              // Path to .wav or .mp3
  isDefault?: boolean;      // Belongs to the 10 eager-loaded default kit tracks
  rootMidiNote?: number;    // Root pitch for melodic samples (default: 60 = C4)
}

export interface VoiceTriggerOptions {
  midiNote?: number;     // Target pitch (e.g. 60 = C4, 63 = D#4)
  rootNote?: number;     // Sample root pitch (default: 60)
  gain?: number;         // Note velocity / gain (default: 1.0)
  shouldChoke?: boolean; // Cut previous note on this voice (e.g. for 808s)
  chokeKey?: string;     // Unique identifier for the voice choke group
  duration?: number;     // Optional note length in seconds
}

export interface Track {
  id: string;          // e.g. 'track_0', 'track_1'
  name: string;        // e.g. 'Kick 1', 'Snare 1', 'Spinz 808'
  type: TrackType;     // 'drum' | 'melodic'
  sampleId: string;    // ID in SampleCatalog (e.g. 'kick_1', '808_1')
  volume: number;      // 0.0 to 1.0 (default 0.8)
  isMuted: boolean;
  isSoloed: boolean;
  steps: boolean[];    // Array of active triggers (e.g. 64 elements for 16 beats / 4 bars)
  pitches: number[];   // Array of MIDI note numbers (default 60 = C4)
  notes?: number[][];  // Multi-note polyphony / chords per step (e.g. [60, 64, 67] for C-E-G)
}


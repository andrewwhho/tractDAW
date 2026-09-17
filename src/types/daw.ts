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


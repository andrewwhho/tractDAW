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
  | 'keys'
  | 'synths'
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


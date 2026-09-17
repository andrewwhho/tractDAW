import { create } from 'zustand';
import { Track, EQSettings, ReverbSettings } from '../types';

export interface DAWStoreState {
  // Sequencer & Global Transport
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  masterVolume: number;

  // Track Matrix (Up to 10 tracks)
  tracks: Track[];

  // Active Piano Roll Modal (track ID or null)
  activePianoRollTrackId: string | null;

  // Effects & Processing
  masterEQ: EQSettings;
  reverb: ReverbSettings;

  // Actions (Signatures only - logic to be implemented)
  setBpm: (bpm: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentStep: (step: number) => void;
  setMasterVolume: (volume: number) => void;
  toggleStep: (trackId: string, stepIndex: number) => void;
  setStepPitch: (trackId: string, stepIndex: number, midiNote: number) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackMute: (trackId: string, isMuted: boolean) => void;
  setTrackSolo: (trackId: string, isSoloed: boolean) => void;
  setTrackReverbSend: (trackId: string, send: number) => void;
  openPianoRoll: (trackId: string) => void;
  closePianoRoll: () => void;
  setMasterEQ: (eq: Partial<EQSettings>) => void;
  setReverb: (reverb: Partial<ReverbSettings>) => void;
}

/**
 * Zustand Store Skeleton for tractDAW.
 * Non-blocking state container decoupled from AudioContext hardware clock.
 */
export const useDAWStore = create<DAWStoreState>((_set) => ({
  bpm: 120,
  isPlaying: false,
  currentStep: 0,
  masterVolume: 0.8,
  tracks: [],
  activePianoRollTrackId: null,
  masterEQ: {
    lowGain: 0,
    midGain: 0,
    highGain: 0,
  },
  reverb: {
    decay: 1.5,
    mix: 0.25,
    enabled: true,
  },

  // SKELETON ACTION STUBS
  setBpm: () => {},
  setIsPlaying: () => {},
  setCurrentStep: () => {},
  setMasterVolume: () => {},
  toggleStep: () => {},
  setStepPitch: () => {},
  setTrackVolume: () => {},
  setTrackMute: () => {},
  setTrackSolo: () => {},
  setTrackReverbSend: () => {},
  openPianoRoll: () => {},
  closePianoRoll: () => {},
  setMasterEQ: () => {},
  setReverb: () => {},
}));


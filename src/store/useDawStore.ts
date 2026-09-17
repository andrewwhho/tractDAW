import { create } from "zustand";
import { AudioEngine } from "../audio/AudioEngine";
import { Track } from "../types";
import { SAMPLE_CATALOG } from "../audio/SampleCatalog";

// Helper to construct a 64-step track pattern
export const createTrack = (
  id: string,
  name: string,
  type: "drum" | "melodic",
  sampleId: string,
  activeIndices: number[],
  pitchesMap: Record<number, number> = {},
  volume = 0.8
): Track => {
  const steps = new Array(64).fill(false);
  const pitches = new Array(64).fill(60);
  activeIndices.forEach((idx) => {
    if (idx >= 0 && idx < 64) {
      steps[idx] = true;
    }
  });
  Object.entries(pitchesMap).forEach(([idxStr, note]) => {
    const idx = parseInt(idxStr, 10);
    if (idx >= 0 && idx < 64) {
      pitches[idx] = note;
    }
  });
  return {
    id,
    name,
    type,
    sampleId,
    volume,
    isMuted: false,
    isSoloed: false,
    steps,
    pitches,
  };
};

// 4-Bar (16 Beats / 64 Steps) Initial Demo Groove
export const INITIAL_TRACKS: Track[] = [
  createTrack(
    "track_kick",
    "Kick 1",
    "drum",
    "kick_1",
    [0, 6, 10, 16, 22, 26, 28, 32, 38, 42, 48, 54, 58, 60],
    {},
    0.9
  ),
  createTrack(
    "track_snare",
    "Snare 1",
    "drum",
    "snare_1",
    [4, 12, 20, 28, 36, 44, 52, 60, 62],
    {},
    0.8
  ),
  createTrack(
    "track_clap",
    "Clap 1",
    "drum",
    "clap_1",
    [8, 24, 40, 56],
    {},
    0.8
  ),
  createTrack(
    "track_hat",
    "Closed Hat",
    "drum",
    "hihat_closed_1",
    [
      0, 2, 4, 6, 8, 10, 12, 14,
      16, 18, 20, 22, 24, 26, 27, 28, 30,
      32, 34, 36, 38, 40, 42, 43, 44, 46,
      48, 50, 52, 54, 56, 58, 59, 60, 61, 62, 63,
    ],
    {},
    0.7
  ),
  createTrack(
    "track_openhat",
    "Open Hat",
    "drum",
    "hihat_open_1",
    [6, 22, 38, 54],
    {},
    0.75
  ),
  createTrack(
    "track_perc",
    "Perc 1",
    "drum",
    "perc_1",
    [11, 27, 43, 59],
    {},
    0.75
  ),
  createTrack(
    "track_808",
    "Spinz 808",
    "melodic",
    "808_1",
    [0, 6, 10, 14, 16, 22, 26, 30, 32, 38, 42, 46, 48, 54, 58, 61],
    {
      0: 60,  // C4
      6: 63,  // D#4
      10: 65, // F4
      14: 67, // G4
      16: 60, // C4
      22: 63, // D#4
      26: 65, // F4
      30: 70, // A#4
      32: 68, // G#4
      38: 65, // F4
      42: 63, // D#4
      46: 62, // D4
      48: 60, // C4
      54: 63, // D#4
      58: 67, // G4
      61: 68, // G#4
    },
    0.9
  ),
  createTrack(
    "track_synth",
    "Synth Stab",
    "melodic",
    "synth_1",
    [0, 8, 16, 24, 32, 40, 48, 56],
    {
      0: 60,  // C4
      8: 63,  // D#4
      16: 60, // C4
      24: 67, // G4
      32: 68, // G#4
      40: 65, // F4
      48: 60, // C4
      56: 63, // D#4
    },
    0.65
  ),
];

export interface DawState {
  // Engine Reference
  engine: AudioEngine | null;
  isReady: boolean;
  isPlaying: boolean;

  // Transport & Audio State
  bpm: number;
  masterVolume: number;
  activeStep: number;

  // Track State (Capped at 10 max)
  tracks: Track[];
  activePitches: Record<string, number>;

  // Container View Mode
  containerMode: "fullscreen" | "windowpane";

  // Actions
  setEngine: (engine: AudioEngine) => void;
  setIsReady: (ready: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveStep: (step: number) => void;
  setContainerMode: (mode: "fullscreen" | "windowpane") => void;
  togglePlay: () => Promise<void>;
  setBpm: (bpm: number) => void;
  setMasterVolume: (volume: number) => void;
  toggleStep: (trackIndex: number, stepIndex: number) => void;
  setStepPitch: (trackIndex: number, stepIndex: number, midiNote: number) => void;
  removeStep: (trackIndex: number, stepIndex: number) => void;
  setTrackVolume: (trackIndex: number, volume: number) => void;
  toggleMute: (trackIndex: number) => void;
  toggleSolo: (trackIndex: number) => void;
  setTrackSample: (trackIndex: number, sampleId: string) => Promise<void>;
  addTrack: (sampleId: string) => Promise<void>;
  deleteTrack: (trackIndex: number) => void;
  auditionTrack: (trackIndex: number, midiNote?: number) => void;
  setActivePitch: (trackId: string, pitch: number) => void;
  clearAll: () => void;
  reloadDemo: () => void;
}

export const useDawStore = create<DawState>((set, get) => ({
  engine: null,
  isReady: false,
  isPlaying: false,
  bpm: 130,
  masterVolume: 0.8,
  activeStep: -1,
  tracks: INITIAL_TRACKS,
  activePitches: {
    track_808: 60,
    track_synth: 60,
  },
  containerMode: "fullscreen",

  setEngine: (engine) => set({ engine }),
  setIsReady: (isReady) => set({ isReady }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setContainerMode: (containerMode) => set({ containerMode }),

  togglePlay: async () => {
    const { engine, isReady, isPlaying } = get();
    if (!engine || !isReady) return;

    if (isPlaying) {
      engine.stop();
      set({ isPlaying: false, activeStep: -1 });
    } else {
      await engine.play();
      set({ isPlaying: true });
    }
  },

  setBpm: (newBpm) => {
    const clamped = Math.max(60, Math.min(240, newBpm));
    get().engine?.setBpm(clamped);
    set({ bpm: clamped });
  },

  setMasterVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    get().engine?.setMasterVolume(clamped);
    set({ masterVolume: clamped });
  },

  toggleStep: (trackIndex, stepIndex) => {
    const { tracks, engine } = get();
    const track = tracks[trackIndex];
    if (!track) return;

    const newSteps = [...track.steps];
    newSteps[stepIndex] = !newSteps[stepIndex];

    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, steps: newSteps } : t
    );

    engine?.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  setStepPitch: (trackIndex, stepIndex, midiNote) => {
    const { tracks, engine } = get();
    const track = tracks[trackIndex];
    if (!track) return;

    const newSteps = [...track.steps];
    const newPitches = [...track.pitches];
    newSteps[stepIndex] = true;
    newPitches[stepIndex] = midiNote;

    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, steps: newSteps, pitches: newPitches } : t
    );

    engine?.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  removeStep: (trackIndex, stepIndex) => {
    const { tracks, engine } = get();
    const track = tracks[trackIndex];
    if (!track) return;

    const newSteps = [...track.steps];
    newSteps[stepIndex] = false;

    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, steps: newSteps } : t
    );

    engine?.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  setTrackVolume: (trackIndex, volume) => {
    const { tracks, engine } = get();
    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, volume } : t
    );

    engine?.setTrackVolume(trackIndex, volume);
    set({ tracks: updatedTracks });
  },

  toggleMute: (trackIndex) => {
    const { tracks, engine } = get();
    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, isMuted: !t.isMuted } : t
    );

    engine?.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  toggleSolo: (trackIndex) => {
    const { tracks, engine } = get();
    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex ? { ...t, isSoloed: !t.isSoloed } : t
    );

    engine?.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  setTrackSample: async (trackIndex, sampleId) => {
    const { tracks, engine } = get();
    const meta = SAMPLE_CATALOG.find((s) => s.id === sampleId);
    if (!meta || !engine) return;

    await engine.setTrackSample(trackIndex, sampleId);

    const updatedTracks = tracks.map((t, idx) =>
      idx === trackIndex
        ? { ...t, sampleId: meta.id, name: meta.name, type: meta.type }
        : t
    );

    engine.setTracks(updatedTracks);
    set({ tracks: updatedTracks });
  },

  addTrack: async (sampleId) => {
    const { tracks, engine } = get();
    if (!engine || tracks.length >= 10) return;

    const meta = SAMPLE_CATALOG.find((s) => s.id === sampleId);
    if (!meta) return;

    const newTrack = await engine.addTrack(meta);
    if (newTrack) {
      set({ tracks: [...tracks, newTrack] });
    }
  },

  deleteTrack: (trackIndex) => {
    const { tracks, engine } = get();
    if (tracks.length <= 1) return;

    engine?.removeTrack(trackIndex);
    set({ tracks: tracks.filter((_, idx) => idx !== trackIndex) });
  },

  auditionTrack: (trackIndex, midiNote) => {
    get().engine?.auditionTrackStep(trackIndex, midiNote);
  },

  setActivePitch: (trackId, pitch) => {
    set((state) => ({
      activePitches: {
        ...state.activePitches,
        [trackId]: pitch,
      },
    }));
  },

  clearAll: () => {
    const { tracks, engine } = get();
    const cleared = tracks.map((t) => ({
      ...t,
      steps: new Array(64).fill(false),
    }));

    engine?.setTracks(cleared);
    set({ tracks: cleared });
  },

  reloadDemo: () => {
    const { engine } = get();
    const clone = INITIAL_TRACKS.map((t) => ({
      ...t,
      steps: [...t.steps],
      pitches: [...t.pitches],
    }));

    engine?.setTracks(clone);
    set({ tracks: clone });
  },
}));


import { SampleMetadata } from '../types';

export const SAMPLE_CATALOG: SampleMetadata[] = [
  // --- DRUMS: KICKS ---
  { id: 'kick_1', name: 'Kick 1', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 1.wav', isDefault: true },
  { id: 'kick_2', name: 'Kick 2', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 3.wav' },
  { id: 'kick_3', name: 'Kick 3', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 5.wav' },

  // --- DRUMS: SNARES ---
  { id: 'snare_1', name: 'Snare 1', category: 'snares', type: 'drum', url: '/audio/samples/drums/snares/Snare 1.wav', isDefault: true },
  { id: 'snare_2', name: 'Snare 2', category: 'snares', type: 'drum', url: '/audio/samples/drums/snares/Snare 3.wav' },
  { id: 'snare_3', name: 'Snare 3', category: 'snares', type: 'drum', url: '/audio/samples/drums/snares/1exposed snare.wav' },
  { id: 'snare_4', name: 'Snare 4', category: 'snares', type: 'drum', url: '/audio/samples/drums/snares/dp filter snare.wav' },
  { id: 'snare_5', name: 'Snare 5', category: 'snares', type: 'drum', url: '/audio/samples/drums/snares/[SAINT6] Chop Snare 2.wav' },

  // --- DRUMS: CLAPS ---
  { id: 'clap_1', name: 'Clap 1', category: 'claps', type: 'drum', url: '/audio/samples/drums/claps/Clap - Classic.wav', isDefault: true },
  { id: 'clap_2', name: 'Clap 2', category: 'claps', type: 'drum', url: '/audio/samples/drums/claps/Clap - Dirty.wav' },
  { id: 'clap_3', name: 'Clap 3', category: 'claps', type: 'drum', url: '/audio/samples/drums/claps/Clap - Slap.wav' },

  // --- DRUMS: HIHATS (CLOSED) ---
  { id: 'hihat_closed_1', name: 'Closed Hi-Hat 1', category: 'hihats_closed', type: 'drum', url: '/audio/samples/drums/hi hats/RS Closed Hat 1.wav', isDefault: true },
  { id: 'hihat_closed_2', name: 'Closed Hi-Hat 2', category: 'hihats_closed', type: 'drum', url: '/audio/samples/drums/hi hats/RS Closed Hat 2.wav' },
  { id: 'hihat_closed_3', name: 'Closed Hi-Hat 3', category: 'hihats_closed', type: 'drum', url: '/audio/samples/drums/hi hats/Bourne Hi-hat.wav' },
  { id: 'hihat_closed_4', name: 'Closed Hi-Hat 4', category: 'hihats_closed', type: 'drum', url: '/audio/samples/drums/hi hats/HH - 02 @PRODPUNK.wav' },

  // --- DRUMS: HIHATS (OPEN) ---
  { id: 'hihat_open_1', name: 'Open Hi-Hat 1', category: 'hihats_open', type: 'drum', url: '/audio/samples/drums/open hats/open hat (Jaws).wav', isDefault: true },
  { id: 'hihat_open_2', name: 'Open Hi-Hat 2', category: 'hihats_open', type: 'drum', url: '/audio/samples/drums/open hats/[SAINT6] Open Hat 1.wav' },

  // --- DRUMS: PERCUSSION ---
  { id: 'perc_1', name: 'Percussion 1', category: 'percussion', type: 'drum', url: '/audio/samples/drums/percs/Perc 2.wav', isDefault: true },
  { id: 'perc_2', name: 'Percussion 2', category: 'percussion', type: 'drum', url: '/audio/samples/drums/percs/Perc 14.wav' },

  // --- DRUMS: EXTRAS ---
  { id: 'vox_1', name: 'Extra 1', category: 'extras', type: 'drum', url: '/audio/samples/drums/extras/aye jerk chant.wav', isDefault: true },
  { id: 'vox_2', name: 'Extra 2', category: 'extras', type: 'drum', url: '/audio/samples/drums/extras/[ACD] - LilJon Hi.wav' },

  // --- MELODIC: KEYS ---
  { id: 'keys_1', name: 'Keys 1', category: 'keys', type: 'melodic', url: '/audio/samples/melodics/piano/[ keys ] luv 1shots  (3).wav', rootMidiNote: 60, isDefault: true },
  { id: 'keys_2', name: 'Keys 2', category: 'keys', type: 'melodic', url: '/audio/samples/melodics/piano/[ keys ] luv 1shots  (5).wav', rootMidiNote: 60 },
  { id: 'keys_3', name: 'Keys 3', category: 'keys', type: 'melodic', url: '/audio/samples/melodics/piano/[ keys ] luv 1shots  (7).wav', rootMidiNote: 60 },
 
  // --- MELODIC: SYNTHS ---
  { id: 'synth_1', name: 'Synth 1', category: 'synths', type: 'melodic', url: '/audio/samples/melodics/synths/[ keys ] luv 1shots  (2).wav', rootMidiNote: 60 , isDefault: true },
  { id: 'synth_2', name: 'Synth 2', category: 'synths', type: 'melodic', url: '/audio/samples/melodics/synths/[ keys ] luv 1shots  (4).wav', rootMidiNote: 60 },
  { id: 'synth_3', name: 'Synth 3', category: 'synths', type: 'melodic', url: '/audio/samples/melodics/synths/[ keys ] luv 1shots  (6).wav', rootMidiNote: 60 },

  // --- MELODIC: BASS ---
  { id: 'bass_1', name: 'Bass 1', category: 'bass', type: 'melodic', url: '/audio/samples/melodics/bass/[ keys ] luv 1shots  (1).wav', rootMidiNote: 60 , isDefault: true },

  // --- MELODIC: EXTRAS ---
  { id: '808_1', name: '808 1', category: '808s', type: 'melodic', url: '/audio/samples/melodics/808s/Official Spinz808.wav', rootMidiNote: 60 , isDefault: true },
  { id: '808_2', name: '808 2', category: '808s', type: 'melodic', url: '/audio/samples/melodics/808s/808 - sr25.wav', rootMidiNote: 60 },
  { id: '808_2', name: '808 2', category: '808s', type: 'melodic', url: '/audio/samples/melodics/808s/Stop Breathing 808 !6.wav', rootMidiNote: 60 },
  { id: '808_2', name: '808 2', category: '808s', type: 'melodic', url: '/audio/samples/melodics/808s/ZAY 808.wav', rootMidiNote: 60 }

];

export const DEFAULT_KIT_SAMPLES = SAMPLE_CATALOG.filter((s) => s.isDefault);

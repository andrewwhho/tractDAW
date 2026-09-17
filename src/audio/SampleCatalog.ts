import { SampleMetadata } from '../types';

export const SAMPLE_CATALOG: SampleMetadata[] = [
  // --- DRUMS: KICKS ---
  { id: 'kick_808', name: '808 Sub Kick', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kick_808.wav', isDefault: true },
  { id: 'kick_acoustic', name: 'Punchy Acoustic', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kick_acoustic.wav' },
  { id: 'kick_vintage', name: 'Vintage Vinyl Kick', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kick_vintage.wav' },
  { id: 'kick_trap', name: 'Hard Trap Kick', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kick_trap.wav' },
  { id: 'kick_lofi', name: 'Lo-Fi Thud', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kick_lofi.wav' }
];

export const DEFAULT_KIT_SAMPLES = SAMPLE_CATALOG.filter((s) => s.isDefault);
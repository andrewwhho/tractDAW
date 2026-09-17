import { SampleMetadata } from '../types';

export const SAMPLE_CATALOG: SampleMetadata[] = [
  // --- DRUMS: KICKS ---
  { id: 'kick_1', name: 'Kick 1', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 1.wav', isDefault: true },
  { id: 'kick_2', name: 'Kick 2', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 3.wav' },
  { id: 'kick_3', name: 'Kick 3', category: 'kicks', type: 'drum', url: '/audio/samples/drums/kicks/RS Kick 5.wav' },
];

export const DEFAULT_KIT_SAMPLES = SAMPLE_CATALOG.filter((s) => s.isDefault);

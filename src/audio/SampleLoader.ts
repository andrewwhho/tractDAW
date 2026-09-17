import { SampleKey } from '../types';

/**
 * Handles fetching and decoding audio assets into cached AudioBuffers.
 * Logic implementation to follow in subsequent phase.
 */
export class SampleLoader {
  private audioCtx: AudioContext;
  private bufferCache: Map<SampleKey, AudioBuffer> = new Map();

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  public async loadSample(_key: SampleKey, _url: string): Promise<AudioBuffer> {
    // SKELETON: Fetching and decodeAudioData to be implemented
    throw new Error('Method not implemented.');
  }

  public async loadAllDefaultSamples(): Promise<void> {
    // SKELETON: Batch load drum and melodic samples to be implemented
    throw new Error('Method not implemented.');
  }

  public getBuffer(_key: SampleKey): AudioBuffer | undefined {
    return this.bufferCache.get(_key);
  }

  public hasBuffer(_key: SampleKey): boolean {
    return this.bufferCache.has(_key);
  }
}


import { DEFAULT_KIT_SAMPLES } from './SampleCatalog';

/**
 * Handles fetching, decoding, and caching audio assets into Web Audio AudioBuffers.
 */
export class SampleLoader {
  private audioCtx: AudioContext;
  private bufferCache: Map<string, AudioBuffer> = new Map();

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Fetches and decodes an individual audio file into an AudioBuffer.
   * Returns the cached buffer if it has already been loaded.
   */
  public async loadSample(id: string, url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(id)) {
      return this.bufferCache.get(id)!;
    }

    try {
      // Encode URL to handle spaces in filenames safely
      const encodedUrl = encodeURI(url);
      const response = await fetch(encodedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText} for URL: ${url}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      this.bufferCache.set(id, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.error(`Failed to load sample [${id}] from '${url}':`, err);
      throw err;
    }
  }

  /**
   * Concurrently loads all default kit samples.
   */
  public async loadAllDefaultSamples(): Promise<Map<string, AudioBuffer>> {
    await Promise.all(
      DEFAULT_KIT_SAMPLES.map((sample) => this.loadSample(sample.id, sample.url))
    );
    return this.bufferCache;
  }

  /**
   * Synchronously retrieves a cached AudioBuffer by sound ID.
   */
  public getBuffer(id: string): AudioBuffer | undefined {
    return this.bufferCache.get(id);
  }

  /**
   * Checks whether a sample has already been decoded and cached.
   */
  public hasBuffer(id: string): boolean {
    return this.bufferCache.has(id);
  }

  /**
   * Returns the entire cache map of loaded AudioBuffers.
   */
  public getAllBuffers(): Map<string, AudioBuffer> {
    return this.bufferCache;
  }
}

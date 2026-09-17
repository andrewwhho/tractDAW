import { DEFAULT_KIT_SAMPLES, SAMPLE_CATALOG } from './SampleCatalog';

/**
 * Handles fetching, decoding, and caching audio assets into Web Audio AudioBuffers.
 * Lazy loading strategy:
 *   - Tier 1: Eager concurrent loading of the default kit.
 *   - Tier 2: Background lazy preloading during browser idle cycles.
 * Includes algorithmic synthesis fallbacks and instantaneous one-shot auditioning.
 */
export class SampleLoader {
  private audioCtx: AudioContext;
  private bufferCache: Map<string, AudioBuffer> = new Map();

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Fetches and decodes an individual audio file into an AudioBuffer.
   * If the file fails to fetch or decode, generates a procedural fallback.
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

      // If Vite returns an HTML page (SPA 404 fallback), throw so we use synthetic fallback
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`File not found on disk (server returned HTML): ${url}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      this.bufferCache.set(id, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn(`⚠️ [${id}] failed to load from '${url}'. Generating synthetic fallback...`);
      const fallbackBuffer = this.createSyntheticFallback(id);
      this.bufferCache.set(id, fallbackBuffer);
      return fallbackBuffer;
    }
  }

  /**
   * Generates a procedural synthetic audio buffer if an audio file fails to load.
   */
  private createSyntheticFallback(id: string): AudioBuffer {
    const meta = SAMPLE_CATALOG.find((s) => s.id === id);
    const category = meta?.category || 'kicks';
    const isMelodic = meta?.type === 'melodic';

    const sampleRate = this.audioCtx.sampleRate;
    const duration = isMelodic ? 1.0 : (category === 'hihats_closed' ? 0.08 : 0.35);
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = this.audioCtx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const progress = i / numSamples;

      if (category === 'kicks' || (isMelodic && category === 'bass')) {
        // Pitch drop from 160Hz to 40Hz with exponential decay
        const freq = 160 * Math.exp(-progress * 7) + 40;
        const envelope = Math.exp(-progress * 6);
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
      } else if (category === 'snares' || category === 'claps') {
        // White noise mixed with a 180Hz body punch
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(2 * Math.PI * 180 * t) * 0.4;
        const envelope = Math.exp(-progress * 10);
        data[i] = (noise * 0.7 + tone) * envelope;
      } else if (category === 'hihats_closed' || category === 'hihats_open') {
        // High-pass white noise click
        const noise = Math.random() * 2 - 1;
        const decayRate = category === 'hihats_closed' ? 30 : 8;
        const envelope = Math.exp(-progress * decayRate);
        data[i] = noise * envelope * 0.5;
      } else if (isMelodic) {
        // Warm C4 tone (261.63 Hz) with 2nd harmonic
        const f0 = 261.63;
        const fundamental = Math.sin(2 * Math.PI * f0 * t);
        const harmonic = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25;
        const envelope = Math.exp(-progress * 2.5);
        data[i] = (fundamental + harmonic) * envelope * 0.5;
      } else {
        // Generic percussive transient
        data[i] = (Math.random() * 2 - 1) * Math.exp(-progress * 15);
      }
    }

    return buffer;
  }

  /**
   * Tier 1: Concurrently loads all default kit samples on application boot.
   */
  public async loadAllDefaultSamples(): Promise<Map<string, AudioBuffer>> {
    await Promise.all(
      DEFAULT_KIT_SAMPLES.map((sample) => this.loadSample(sample.id, sample.url))
    );
    return this.bufferCache;
  }

  /**
   * Tier 2: Lazily loads all non-default samples during browser idle cycles.
   * Ensures the remaining library is cached in RAM without stuttering the UI.
   */
  public loadRemainingInBackground(): void {
    const remaining = SAMPLE_CATALOG.filter(
      (s) => !s.isDefault && !this.hasBuffer(s.id)
    );
    if (remaining.length === 0) return;

    const schedule = (cb: (deadline: { timeRemaining: () => number }) => void) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(cb);
      } else {
        setTimeout(() => cb({ timeRemaining: () => 15 }), 50);
      }
    };

    const processQueue = async (_deadline: { timeRemaining: () => number }) => {
      if (remaining.length === 0) {
        console.log('SampleLoader.ts: All background samples cached in RAM.');
        return;
      }

      const next = remaining.shift();
      if (next && !this.hasBuffer(next.id)) {
        await this.loadSample(next.id, next.url);
      }

      if (remaining.length > 0) {
        schedule(processQueue);
      }
    };

    schedule(processQueue);
  }

  /**
   * Previews any sample by ID immediately.
   * If the sample is not yet cached, loads it on demand first.
   */
  public async auditionSample(
    id: string,
    volume = 0.8,
    destination?: AudioNode
  ): Promise<void> {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    let buffer = this.getBuffer(id);
    if (!buffer) {
      const meta = SAMPLE_CATALOG.find((s) => s.id === id);
      if (!meta) {
        console.warn(`Cannot audition unknown sample ID: ${id}`);
        return;
      }
      buffer = await this.loadSample(id, meta.url);
    }

    const source = this.audioCtx.createBufferSource();
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = volume;

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(destination || this.audioCtx.destination);
    source.start();
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

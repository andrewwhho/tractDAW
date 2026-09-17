import { Track, VoiceTriggerOptions, SampleMetadata } from '../types';
import { SAMPLE_CATALOG } from './SampleCatalog';
import { SampleLoader } from './SampleLoader';
import { VoiceManager } from './VoiceManager';
import { LookaheadScheduler, VisualStepCallback } from './LookaheadScheduler';

/**
 * AudioEngine is the master coordinator of tractDAW.
 * Coordinates:
 *   - AudioContext lifecycle
 *   - 10 Track GainNodes routed into a single Master GainNode
 *   - SampleLoader buffer cache
 *   - VoiceManager hardware voice triggers and 808 choking
 *   - LookaheadScheduler clock and step scheduling
 */
export class AudioEngine {
  public readonly audioCtx: AudioContext;
  public readonly sampleLoader: SampleLoader;
  public readonly voiceManager: VoiceManager;
  public readonly scheduler: LookaheadScheduler;

  private masterGainNode: GainNode;
  private trackGainNodes: GainNode[] = [];
  private tracks: Track[] = [];

  constructor() {
    this.audioCtx = new AudioContext();
    this.sampleLoader = new SampleLoader(this.audioCtx);
    this.voiceManager = new VoiceManager(this.audioCtx);
    this.scheduler = new LookaheadScheduler(this.audioCtx);

    // 1. Setup Master Bus: MasterGain -> Speakers
    this.masterGainNode = this.audioCtx.createGain();
    this.masterGainNode.gain.value = 0.8;
    this.masterGainNode.connect(this.audioCtx.destination);

    // 2. Setup 10 Track Strips: TrackGain[i] -> MasterGain
    for (let i = 0; i < 10; i++) {
      const trackGain = this.audioCtx.createGain();
      trackGain.gain.value = 0.8;
      trackGain.connect(this.masterGainNode);
      this.trackGainNodes.push(trackGain);
    }

    // 3. Connect Scheduler callback to AudioEngine dispatcher
    this.scheduler.setCallbacks((stepIndex, audioTime) => {
      this.onScheduleStep(stepIndex, audioTime);
    });
  }

  /**
   * Called by the lookahead scheduler ~100ms in advance for every 16th-note step.
   */
  private onScheduleStep(stepIndex: number, audioTime: number): void {
    const hasSolo = this.tracks.some((t) => t.isSoloed);

    this.tracks.forEach((track, index) => {
      // Check if this track is active for this step
      if (!track.steps[stepIndex]) return;

      // Handle Mute & Solo logic
      if (track.isMuted) return;
      if (hasSolo && !track.isSoloed) return;

      // Ensure track has a destination gain node
      const trackDestination = this.trackGainNodes[index];
      if (!trackDestination) return;

      // Retrieve buffer from cache
      const buffer = this.sampleLoader.getBuffer(track.sampleId);
      if (!buffer) return;

      const meta = SAMPLE_CATALOG.find((s) => s.id === track.sampleId);
      const is808OrBass = meta?.category === '808s' || meta?.category === 'bass';

      const options: VoiceTriggerOptions = {
        gain: 1.0, // TrackGainNode handles track volume
      };

      if (track.type === 'melodic') {
        options.midiNote = track.pitches[stepIndex] ?? 60;
        options.rootNote = meta?.rootMidiNote ?? 60;

        // Auto-choke for bass & 808s ("Cut Itself")
        if (is808OrBass) {
          options.shouldChoke = true;
          options.chokeKey = `choke_${track.id}`;
        }
      }

      this.voiceManager.triggerVoice(
        buffer,
        trackDestination,
        audioTime,
        options
      );
    });
  }

  // --- Transport Controls ---

  public async play(): Promise<void> {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    await this.scheduler.start();
  }

  public stop(): void {
    this.scheduler.stop();
    this.voiceManager.stopAllVoices();
  }

  public pause(): void {
    this.scheduler.pause();
    this.voiceManager.stopAllVoices();
  }

  public getIsPlaying(): boolean {
    return this.scheduler.getIsPlaying();
  }

  public getCurrentStep(): number {
    return this.scheduler.getCurrentStep();
  }

  public setBpm(bpm: number): void {
    this.scheduler.setBpm(bpm);
  }

  public getBpm(): number {
    return this.scheduler.getBpm();
  }

  // --- Mixer & Track Controls ---

  public setMasterVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1.0, vol));
    this.masterGainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
  }

  public setTrackVolume(trackIndex: number, vol: number): void {
    const clamped = Math.max(0, Math.min(1.0, vol));
    const gainNode = this.trackGainNodes[trackIndex];
    if (gainNode) {
      gainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
    if (this.tracks[trackIndex]) {
      this.tracks[trackIndex].volume = clamped;
    }
  }

  public setTrackMute(trackIndex: number, isMuted: boolean): void {
    if (this.tracks[trackIndex]) {
      this.tracks[trackIndex].isMuted = isMuted;
    }
  }

  public setTrackSolo(trackIndex: number, isSoloed: boolean): void {
    if (this.tracks[trackIndex]) {
      this.tracks[trackIndex].isSoloed = isSoloed;
    }
  }

  // --- Pattern & Sequencer Management ---

  public loadTracks(tracks: Track[]): void {
    // Clamp to maximum 10 tracks
    this.tracks = tracks.slice(0, 10);

    // Sync volume levels to hardware nodes
    this.tracks.forEach((track, idx) => {
      if (this.trackGainNodes[idx]) {
        this.trackGainNodes[idx].gain.setValueAtTime(
          track.volume,
          this.audioCtx.currentTime
        );
      }
    });
  }

  public getTracks(): Track[] {
    return this.tracks;
  }

  public setTotalSteps(steps: number): void {
    this.scheduler.setTotalSteps(steps);
  }

  public getTotalSteps(): number {
    return this.scheduler.getTotalSteps();
  }

  public setTracks(tracks: Track[]): void {
    this.tracks = tracks.slice(0, 10);
    this.tracks.forEach((track, idx) => {
      if (this.trackGainNodes[idx]) {
        this.trackGainNodes[idx].gain.setValueAtTime(
          track.volume,
          this.audioCtx.currentTime
        );
      }
    });
  }

  /**
   * Swaps the sample assigned to a track, loading the new buffer if needed.
   */
  public async setTrackSample(trackIndex: number, sampleId: string): Promise<void> {
    const track = this.tracks[trackIndex];
    if (!track) return;
    const meta = SAMPLE_CATALOG.find((s) => s.id === sampleId);
    if (!meta) return;

    track.sampleId = sampleId;
    track.name = meta.name;
    track.type = meta.type;

    // Eagerly preload into cache if not present
    await this.sampleLoader.loadSample(meta.id, meta.url);
  }

  /**
   * Adds a new track up to the 10-track ceiling, initializing 64 empty steps.
   */
  public async addTrack(meta: SampleMetadata): Promise<Track | null> {
    if (this.tracks.length >= 10) {
      console.warn('AudioEngine: Maximum 10 tracks reached.');
      return null;
    }

    await this.sampleLoader.loadSample(meta.id, meta.url);

    const newTrackIndex = this.tracks.length;
    const newTrack: Track = {
      id: `track_${Date.now()}_${newTrackIndex}`,
      name: meta.name,
      type: meta.type,
      sampleId: meta.id,
      volume: 0.8,
      isMuted: false,
      isSoloed: false,
      steps: new Array(this.getTotalSteps()).fill(false),
      pitches: new Array(this.getTotalSteps()).fill(meta.rootMidiNote ?? 60),
    };

    this.tracks.push(newTrack);

    if (this.trackGainNodes[newTrackIndex]) {
      this.trackGainNodes[newTrackIndex].gain.setValueAtTime(
        newTrack.volume,
        this.audioCtx.currentTime
      );
    }

    return newTrack;
  }

  /**
   * Removes a track, stops any voices, and re-syncs track gain nodes.
   */
  public removeTrack(trackIndex: number): void {
    if (trackIndex < 0 || trackIndex >= this.tracks.length) return;

    this.voiceManager.stopAllVoices();
    this.tracks.splice(trackIndex, 1);

    // Re-sync gain levels for remaining tracks
    this.tracks.forEach((track, idx) => {
      if (this.trackGainNodes[idx]) {
        this.trackGainNodes[idx].gain.setValueAtTime(
          track.volume,
          this.audioCtx.currentTime
        );
      }
    });
  }

  public toggleStep(trackIndex: number, stepIndex: number): boolean {
    const track = this.tracks[trackIndex];
    if (track && stepIndex >= 0 && stepIndex < track.steps.length) {
      track.steps[stepIndex] = !track.steps[stepIndex];
      return track.steps[stepIndex];
    }
    return false;
  }

  public setStepPitch(
    trackIndex: number,
    stepIndex: number,
    midiNote: number
  ): void {
    const track = this.tracks[trackIndex];
    if (track && stepIndex >= 0 && stepIndex < track.pitches.length) {
      track.pitches[stepIndex] = midiNote;
    }
  }

  /**
   * Instantly auditions a track's sample at the given pitch (or default)
   * Gives the user immediate audio feedback when clicking steps or notes.
   */
  public auditionTrackStep(trackIndex: number, midiNote?: number): void {
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const track = this.tracks[trackIndex];
    if (!track) return;
    const buffer = this.sampleLoader.getBuffer(track.sampleId);
    if (!buffer) return;

    const trackDestination = this.trackGainNodes[trackIndex] || this.masterGainNode;
    const meta = SAMPLE_CATALOG.find((s) => s.id === track.sampleId);
    const options: VoiceTriggerOptions = {
      gain: 1.0,
    };

    if (track.type === 'melodic') {
      options.midiNote = midiNote ?? 60;
      options.rootNote = meta?.rootMidiNote ?? 60;
      if (meta?.category === '808s' || meta?.category === 'bass') {
        options.shouldChoke = true;
        options.chokeKey = `choke_${track.id}`;
      }
    }

    this.voiceManager.triggerVoice(
      buffer,
      trackDestination,
      this.audioCtx.currentTime,
      options
    );
  }

  public setVisualStepCallback(cb: VisualStepCallback): void {
    this.scheduler.setCallbacks(
      (step, time) => this.onScheduleStep(step, time),
      cb
    );
  }
}


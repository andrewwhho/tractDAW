/**
 * Voice Manager: triggers one-shot playback and pitch-transposed melodic notes.
 * Logic implementation to follow in subsequent phase.
 */
export class VoiceManager {
  private audioCtx: AudioContext;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Triggers a standard one-shot sample at exact audioContext timestamp.
   */
  public triggerOneShot(
    _buffer: AudioBuffer,
    _destination: AudioNode,
    _playbackTime: number,
    _gain?: number
  ): void {
    // SKELETON: AudioBufferSourceNode scheduling to be implemented
  }

  /**
   * Triggers a pitched melodic sample using playbackRate transposition formula:
   * playbackRate = 2^((midiNote - rootNote) / 12)
   */
  public triggerMelodicNote(
    _buffer: AudioBuffer,
    _destination: AudioNode,
    _midiNote: number,
    _rootNote: number, // e.g. 60 for C4
    _playbackTime: number,
    _gain?: number
  ): void {
    // SKELETON: Pitch transposition and gain envelope to be implemented
  }
}


import { EQSettings } from '../../types';

export interface ThreeBandEQNodes {
  inputNode: GainNode;
  lowShelf: BiquadFilterNode;
  peakingMid: BiquadFilterNode;
  highShelf: BiquadFilterNode;
  outputNode: GainNode;
}

/**
 * Three-Band Equalizer using serial BiquadFilterNodes.
 * Low-shelf, Peaking mid, and High-shelf.
 * Logic implementation to follow in subsequent phase.
 */
export class ThreeBandEQ {
  private audioCtx: AudioContext;
  public nodes: ThreeBandEQNodes | null = null;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  public init(): ThreeBandEQNodes {
    // SKELETON: Node creation and serial chaining to be implemented
    throw new Error('Method not implemented.');
  }

  public setLowGain(_gainDb: number): void {
    // SKELETON: To be implemented
  }

  public setMidGain(_gainDb: number): void {
    // SKELETON: To be implemented
  }

  public setHighGain(_gainDb: number): void {
    // SKELETON: To be implemented
  }

  public updateEQ(_settings: EQSettings): void {
    // SKELETON: To be implemented
  }
}


import { ScheduledStepEvent } from '../types';

export type StepScheduleCallback = (step: number, audioTime: number) => void;
export type VisualStepCallback = (event: ScheduledStepEvent) => void;

/**
 * Lookahead Scheduler Pattern.
 * Keeps sample-accurate timing on the Web Audio clock independent of UI rendering.
 * Logic implementation to follow in subsequent phase.
 */
export class LookaheadScheduler {
  private audioCtx: AudioContext;
  private isRunning = false;
  private timerId: number | null = null;

  public bpm = 120;
  public lookaheadMs = 25.0;        // Timer frequency (ms)
  public scheduleAheadTime = 0.1;    // Ahead window (seconds)

  private onScheduleStep: StepScheduleCallback | null = null;
  private onVisualStep: VisualStepCallback | null = null;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  public setCallbacks(
    onScheduleStep: StepScheduleCallback,
    onVisualStep: VisualStepCallback
  ): void {
    this.onScheduleStep = onScheduleStep;
    this.onVisualStep = onVisualStep;
  }

  public start(): void {
    // SKELETON: To be implemented
  }

  public stop(): void {
    // SKELETON: To be implemented
  }

  public setBpm(_bpm: number): void {
    this.bpm = _bpm;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private runSchedulerLoop(): void {
    // SKELETON: Advance steps and schedule audio events ahead of time
  }
}


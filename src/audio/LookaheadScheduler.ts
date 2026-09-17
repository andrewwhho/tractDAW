export type StepScheduleCallback = (step: number, audioTime: number) => void;
export type VisualStepCallback = (step: number, audioTime: number) => void;

/**
 * LookaheadScheduler is a custom scheduling patterm to ensure precise 16th note timing.
 * Decouples the 25ms JavaScript timer from the sample-accurate Web Audio hardware clock.
 * Jitter-free 16th-note timing regardless of UI rendering load.
 */
export class LookaheadScheduler {
  private audioCtx: AudioContext;
  private isPlaying = false;
  private currentStep = 0; // 0 to totalSteps - 1
  private nextStepTime = 0.0; // in audioContext.currentTime seconds
  private timerId: number | null = null;

  public bpm = 120;
  public totalSteps = 64; // 16 beats (4 bars of 4/4) = 64 16th-note steps
  public lookaheadMs = 25.0; // How frequently the scheduler checks (milliseconds)
  public scheduleAheadTime = 0.1; // How far ahead to schedule hardware nodes (seconds)

  private onScheduleStep: StepScheduleCallback | null = null;
  private onVisualStep: VisualStepCallback | null = null;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Registers callback functions for hardware scheduling and visual synchronization.
   */
  public setCallbacks(
    onScheduleStep: StepScheduleCallback,
    onVisualStep?: VisualStepCallback
  ): void {
    this.onScheduleStep = onScheduleStep;
    if (onVisualStep) {
      this.onVisualStep = onVisualStep;
    }
  }

  /**
   * Starts playback from step 0 (or from current position).
   */
  public async start(): Promise<void> {
    if (this.isPlaying) return;

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.currentStep = 0;
    // Add small 50ms buffer before the very first note fires
    this.nextStepTime = this.audioCtx.currentTime + 0.05;

    this.timerId = window.setInterval(
      () => this.runSchedulerLoop(),
      this.lookaheadMs
    );
  }

  /**
   * Pauses playback, retaining the current step index.
   */
  public pause(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Stops playback and resets the playhead position to step 0.
   */
  public stop(): void {
    this.pause();
    this.currentStep = 0;
  }

  /**
   * Sets the tempo in Beats Per Minute (clamped between 40 and 240 BPM).
   */
  public setBpm(newBpm: number): void {
    this.bpm = Math.max(40, Math.min(240, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public setTotalSteps(steps: number): void {
    this.totalSteps = Math.max(1, steps);
  }

  public getTotalSteps(): number {
    return this.totalSteps;
  }

  /**
   * The core lookahead loop.
   * Runs every 25ms and schedules all 16th-note steps falling into the next 100ms window.
   */
  private runSchedulerLoop(): void {
    while (
      this.nextStepTime <
      this.audioCtx.currentTime + this.scheduleAheadTime
    ) {
      this.dispatchStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
  }

  /**
   * Dispatches the callbacks for the step.
   */
  private dispatchStep(step: number, time: number): void {
    if (this.onScheduleStep) {
      this.onScheduleStep(step, time);
    }
    if (this.onVisualStep) {
      this.onVisualStep(step, time);
    }
  }

  /**
   * Advances the clock to the next 16th-note step:
   * stepDuration = (60.0 / BPM) / 4
   */
  private advanceStep(): void {
    const secondsPer16th = 60.0 / this.bpm / 4.0;
    this.nextStepTime += secondsPer16th;
    this.currentStep = (this.currentStep + 1) % this.totalSteps;
  }
}


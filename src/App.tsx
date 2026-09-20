import React, { useEffect, useRef } from "react";
import { AudioEngine } from "./audio/AudioEngine";
import { Sequencer } from "./components/Sequencer";
import { Mixer } from "./components/Mixer";
import { PianoRoll } from "./components/PianoRoll";
import { useDawStore } from "./store/useDawStore";

export const App: React.FC = () => {
  const isReady = useDawStore((state) => state.isReady);
  const setIsReady = useDawStore((state) => state.setIsReady);
  const isPlaying = useDawStore((state) => state.isPlaying);
  const bpm = useDawStore((state) => state.bpm);
  const setBpm = useDawStore((state) => state.setBpm);
  const masterVolume = useDawStore((state) => state.masterVolume);
  const setMasterVolume = useDawStore((state) => state.setMasterVolume);
  const tracks = useDawStore((state) => state.tracks);
  const activeStep = useDawStore((state) => state.activeStep);
  const setActiveStep = useDawStore((state) => state.setActiveStep);
  const containerMode = useDawStore((state) => state.containerMode);
  const setContainerMode = useDawStore((state) => state.setContainerMode);
  const setEngine = useDawStore((state) => state.setEngine);
  const togglePlay = useDawStore((state) => state.togglePlay);
  const resetPlayhead = useDawStore((state) => state.resetPlayhead);
  const clearAll = useDawStore((state) => state.clearAll);
  const reloadDemo = useDawStore((state) => state.reloadDemo);

  const engineRef = useRef<AudioEngine | null>(null);
  const stepQueueRef = useRef<{ step: number; time: number }[]>([]);

  // 1. Initialize Audio Engine & Preload Default Kit
  useEffect(() => {
    const engine = new AudioEngine();
    engine.setBpm(bpm);
    engine.setTotalSteps(64);
    engine.loadTracks(tracks);

    // Queue visual steps for 60fps RAF synchronization
    engine.setVisualStepCallback((step, audioTime) => {
      stepQueueRef.current.push({ step, time: audioTime });
    });

    engineRef.current = engine;
    setEngine(engine);

    // Load initial sounds
    engine.sampleLoader.loadAllDefaultSamples().then(() => {
      setIsReady(true);
      console.log("✅ tractDAW AudioEngine Ready!");
    });

    return () => {
      engine.destroy();
    };
  }, []);

  // 2. 60 FPS Decoupled Playhead Tracking
  useEffect(() => {
    let animId: number;

    const tickPlayhead = () => {
      if (engineRef.current && isPlaying) {
        const currentTime = engineRef.current.audioCtx.currentTime;
        while (
          stepQueueRef.current.length > 0 &&
          stepQueueRef.current[0].time <= currentTime
        ) {
          const nextEvent = stepQueueRef.current.shift()!;
          setActiveStep(nextEvent.step);
        }
      }
      animId = requestAnimationFrame(tickPlayhead);
    };

    animId = requestAnimationFrame(tickPlayhead);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, setActiveStep]);

  useEffect(() => {
    if (!isPlaying) {
      stepQueueRef.current = [];
    }
  }, [isPlaying]);

  // 3. Power Keyboard Shortcuts (Space = Play/Stop, Home/0 = Rewind)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "Home" || e.key === "0") {
        e.preventDefault();
        resetPlayhead();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, resetPlayhead]);

  // Active position details for LCD
  const activeBarIndex = activeStep >= 0 ? Math.floor(activeStep / 16) : -1;
  const activeBeat =
    activeStep >= 0 ? Math.floor((activeStep % 16) / 4) + 1 : 1;
  const active16th = activeStep >= 0 ? (activeStep % 4) + 1 : 1;

  // DAW Main Content JSX
  const dawContent = (
    <div className="flex flex-col gap-3 w-full box-border">
      {/* Transport Bar & View Switcher (Clean Two-Tier Layout) */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-md p-2.5 sm:px-3.5 flex flex-col gap-2.5">
        {/* Tier 1: Audio Playback & Clock */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          {/* Left: Play/Stop & BPM */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className={`px-4 py-1.5 rounded text-white font-bold text-xs min-w-[85px] tracking-wide transition-all ${
                isReady ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              } ${
                isPlaying
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {isPlaying ? "■ STOP" : "▶ PLAY"}
            </button>

            {/* BPM Stepper */}
            <div className="flex items-center bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-700 gap-1">
              <span className="text-zinc-500 text-[10px] font-bold">BPM:</span>
              <button
                onClick={() => setBpm(bpm - 5)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors"
              >
                -5
              </button>
              <span className="text-[13px] font-bold min-w-[36px] text-center text-zinc-100 font-mono">
                {bpm}
              </span>
              <button
                onClick={() => setBpm(bpm + 5)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors"
              >
                +5
              </button>
            </div>
          </div>

          {/* Center: LCD Position Display */}
          <div className="bg-zinc-950 px-3 py-1 rounded border border-zinc-700 flex items-center gap-2.5 font-mono">
            <div>
              <span className="text-zinc-500 text-[10px]">POS:</span>{" "}
              <span
                className={`font-bold text-xs ${
                  isPlaying ? "text-blue-400" : "text-zinc-400"
                }`}
              >
                BAR {activeBarIndex >= 0 ? activeBarIndex + 1 : 1} : BEAT{" "}
                {activeBeat} : 16TH {active16th}
              </span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="text-zinc-400 text-[11px]">
              STEP:{" "}
              <span
                className={`font-bold ${
                  isPlaying ? "text-emerald-400" : "text-zinc-200"
                }`}
              >
                {activeStep >= 0 ? activeStep + 1 : 0}
              </span>{" "}
              / 64
            </div>
          </div>

          {/* Right: Master Volume & Status */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[10px] font-bold">
                MASTER:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-[70px] accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-blue-300 min-w-[30px] font-mono">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isReady
                    ? "bg-emerald-500 shadow-[0_0_6px_#22c55e]"
                    : "bg-yellow-500"
                }`}
              />
              <span
                className={`text-[10px] font-bold ${
                  isReady ? "text-emerald-400" : "text-yellow-400"
                }`}
              >
                {isReady ? "ONLINE" : "LOADING"}
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Studio Layout & Project Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-t border-zinc-800 pt-2">
          {/* Studio Layout Indicator & Track Capacity */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 tracking-wide">
              🪟 SPLIT VIEW{" "}
              <span className="text-zinc-500 font-normal text-[10px]">
                (Channel Rack + Mixer Console)
              </span>
            </span>

            {/* Track Limit Pill */}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                tracks.length >= 10
                  ? "bg-red-950 text-red-400 border-red-900"
                  : tracks.length >= 8
                    ? "bg-amber-950 text-yellow-400 border-yellow-900"
                    : "bg-zinc-950 text-slate-400 border-zinc-800"
              }`}
            >
              {tracks.length} / 10 TRACKS
            </span>
          </div>

          {/* Quick Actions & Window Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-zinc-700 rounded px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors"
              title="Clear all note triggers"
            >
              🗑 CLEAR
            </button>
            <button
              onClick={reloadDemo}
              className="bg-zinc-800 hover:bg-zinc-700 text-blue-300 border border-zinc-700 rounded px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors"
              title="Reload initial 4-bar groove"
            >
              ↺ RELOAD
            </button>

            {/* Window Mode Toggle */}
            <button
              onClick={() =>
                setContainerMode(
                  containerMode === "fullscreen" ? "windowpane" : "fullscreen",
                )
              }
              className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                containerMode === "windowpane"
                  ? "bg-blue-900 text-blue-300 border-blue-500"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700"
              }`}
              title="Toggle between Fullscreen and Portfolio WindowPane simulation (1280x720)"
            >
              {containerMode === "windowpane"
                ? "🪟 WINDOWPANE (1280×720)"
                : "🖥️ FULLSCREEN"}
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace: Channel Rack (Top) + Mixer Console (Bottom) */}
      <div className="flex flex-col gap-3 w-full">
        <Sequencer />
        <Mixer />
        <PianoRoll />
      </div>

      {/* Compact Status / Tips Footer */}
      <footer className="flex justify-between items-center text-zinc-500 text-[10px] py-1.5 px-1 border-t border-zinc-900 mt-1 font-mono">
        <div>
          💡 <strong className="text-zinc-400">Tips:</strong> Space: Play/Stop •
          Home/0: Rewind • Esc: Dismiss Note • Click track name to audition
          sound • Max 10 Tracks
        </div>
        <div>tractDAW • Max 10 Tracks • 64 Steps</div>
      </footer>
    </div>
  );

  // Top-Level Container Rendering
  if (containerMode === "windowpane") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start p-4 sm:p-6 box-border font-mono text-zinc-100 select-none">
        {/* WindowPane Frame Simulation */}
        <div className="w-[1280px] max-w-[96vw] h-[720px] max-h-[92vh] bg-zinc-900/95 border border-white/15 rounded-md shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          {/* WindowPane Header */}
          <div className="h-9 bg-zinc-900/90 border-b border-zinc-800 px-3.5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-zinc-100 tracking-wide">
                tractDAW<span className="text-blue-500">.</span>
              </span>
              <span className="text-zinc-500 text-[11px]">(mini web DAW)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setContainerMode("fullscreen")}
                className="bg-transparent border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors"
                title="Switch to full width view"
              >
                EXPAND ↗
              </button>
              <button
                onClick={() => setContainerMode("fullscreen")}
                className="bg-transparent border-none text-white/60 hover:text-white text-lg leading-none cursor-pointer px-1"
                title="Close Window simulation"
              >
                &times;
              </button>
            </div>
          </div>

          {/* WindowPane Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 flex flex-col">
            {dawContent}
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen Container Mode
  return (
    <main className="p-2.5 sm:p-3.5 bg-zinc-950 text-zinc-100 font-mono min-h-screen w-full box-border select-none flex flex-col">
      <div className="w-full flex flex-col gap-2.5 box-border">
        {/* Top Header */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
          <div>
            <h1 className="m-0 text-[17px] tracking-wider flex items-center gap-2 font-bold">
              tractDAW{" "}
              <span className="text-blue-400 text-[11px] bg-blue-950/80 border border-blue-800 px-1.5 py-0.5 rounded">
                STUDIO
              </span>
            </h1>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              64-Step Channel Rack • Track Mixer Console • Decoupled State
              Engine
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setContainerMode("windowpane")}
              className="bg-zinc-900 hover:bg-zinc-800 border border-blue-500 text-blue-300 rounded px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Preview inside portfolio WindowPane (1280x720)"
            >
              🪟 PREVIEW IN WINDOWPANE (1280×720)
            </button>
          </div>
        </header>

        {dawContent}
      </div>
    </main>
  );
};

export default App;

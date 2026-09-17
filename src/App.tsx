import React, { useState, useEffect, useRef } from "react";
import { AudioEngine } from "./audio/AudioEngine";
import { Track } from "./types";
import { SAMPLE_CATALOG } from "./audio/SampleCatalog";
import { Sequencer } from "./components/Sequencer";
import { Mixer } from "./components/Mixer";

// Helper to construct a 64-step track pattern
const createTrack = (
  id: string,
  name: string,
  type: "drum" | "melodic",
  sampleId: string,
  activeIndices: number[],
  pitchesMap: Record<number, number> = {},
  volume = 0.8,
): Track => {
  const steps = new Array(64).fill(false);
  const pitches = new Array(64).fill(60);
  activeIndices.forEach((idx) => {
    if (idx >= 0 && idx < 64) {
      steps[idx] = true;
    }
  });
  Object.entries(pitchesMap).forEach(([idxStr, note]) => {
    const idx = parseInt(idxStr, 10);
    if (idx >= 0 && idx < 64) {
      pitches[idx] = note;
    }
  });
  return {
    id,
    name,
    type,
    sampleId,
    volume,
    isMuted: false,
    isSoloed: false,
    steps,
    pitches,
  };
};

// 4-Bar (16 Beats / 64 Steps) Initial Demo Groove
const INITIAL_TRACKS: Track[] = [
  createTrack(
    "track_kick",
    "Kick 1",
    "drum",
    "kick_1",
    [0, 6, 10, 16, 22, 26, 28, 32, 38, 42, 48, 54, 58, 60],
    {},
    0.9,
  ),
  createTrack(
    "track_snare",
    "Snare 1",
    "drum",
    "snare_1",
    [4, 12, 20, 28, 36, 44, 52, 60, 62],
    {},
    0.8,
  ),
  createTrack(
    "track_clap",
    "Clap 1",
    "drum",
    "clap_1",
    [8, 24, 40, 56],
    {},
    0.8,
  ),
  createTrack(
    "track_hat",
    "Closed Hat",
    "drum",
    "hihat_closed_1",
    [
      0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 27, 28, 30, 32, 34, 36,
      38, 40, 42, 43, 44, 46, 48, 50, 52, 54, 56, 58, 59, 60, 61, 62, 63,
    ],
    {},
    0.7,
  ),
  createTrack(
    "track_openhat",
    "Open Hat",
    "drum",
    "hihat_open_1",
    [6, 22, 38, 54],
    {},
    0.75,
  ),
  createTrack(
    "track_perc",
    "Perc 1",
    "drum",
    "perc_1",
    [11, 27, 43, 59],
    {},
    0.75,
  ),
  createTrack(
    "track_808",
    "Spinz 808",
    "melodic",
    "808_1",
    [0, 6, 10, 14, 16, 22, 26, 30, 32, 38, 42, 46, 48, 54, 58, 61],
    {
      0: 60, // C4
      6: 63, // D#4
      10: 65, // F4
      14: 67, // G4
      16: 60, // C4
      22: 63, // D#4
      26: 65, // F4
      30: 70, // A#4
      32: 68, // G#4
      38: 65, // F4
      42: 63, // D#4
      46: 62, // D4
      48: 60, // C4
      54: 63, // D#4
      58: 67, // G4
      61: 68, // G#4
    },
    0.9,
  ),
  createTrack(
    "track_synth",
    "Synth Stab",
    "melodic",
    "synth_1",
    [0, 8, 16, 24, 32, 40, 48, 56],
    {
      0: 60, // C4
      8: 63, // D#4
      16: 60, // C4
      24: 67, // G4
      32: 68, // G#4
      40: 65, // F4
      48: 60, // C4
      56: 63, // D#4
    },
    0.65,
  ),
];

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(130);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [activeStep, setActiveStep] = useState<number>(-1);

  // Container fit mode: 'fullscreen' (default full width) | 'windowpane' (simulating 1280x720 WindowPane)
  const [containerMode, setContainerMode] = useState<
    "fullscreen" | "windowpane"
  >("fullscreen");

  // Active default pitch per melodic track
  const [activePitches, setActivePitches] = useState<Record<string, number>>({
    track_808: 60,
    track_synth: 60,
  });

  const engineRef = useRef<AudioEngine | null>(null);
  const stepQueueRef = useRef<{ step: number; time: number }[]>([]);

  // 1. Initialize Audio Engine & Preload Default Kit
  useEffect(() => {
    const engine = new AudioEngine();
    engine.setBpm(130);
    engine.setTotalSteps(64);
    engine.loadTracks(INITIAL_TRACKS);

    // Queue visual steps for 60fps RAF synchronization
    engine.setVisualStepCallback((step, audioTime) => {
      stepQueueRef.current.push({ step, time: audioTime });
    });

    engineRef.current = engine;

    // Load initial sounds
    engine.sampleLoader.loadAllDefaultSamples().then(() => {
      setIsReady(true);
      console.log("✅ tractDAW AudioEngine Ready!");
    });

    return () => {
      engine.stop();
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
  }, [isPlaying]);

  // Transport Handlers
  const handleTogglePlay = async () => {
    if (!engineRef.current || !isReady) return;

    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
      setActiveStep(-1);
      stepQueueRef.current = [];
    } else {
      await engineRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(60, Math.min(240, newBpm));
    setBpm(clamped);
    engineRef.current?.setBpm(clamped);
  };

  const handleMasterVolChange = (vol: number) => {
    setMasterVolume(vol);
    engineRef.current?.setMasterVolume(vol);
  };

  // Keyboard Shortcuts (Space = Play/Stop)
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
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isReady]);

  // Synchronized Step Update Helper
  const handleUpdateStep = (
    trackIndex: number,
    stepIndex: number,
    isActive: boolean,
    midiNote?: number,
  ) => {
    setTracks((prev) => {
      const updated = prev.map((t, idx) => {
        if (idx !== trackIndex) return t;
        const newSteps = [...t.steps];
        const newPitches = [...t.pitches];
        newSteps[stepIndex] = isActive;
        if (midiNote !== undefined) {
          newPitches[stepIndex] = midiNote;
        }
        return { ...t, steps: newSteps, pitches: newPitches };
      });
      engineRef.current?.setTracks(updated);
      return updated;
    });
  };

  const handleToggleStep = (trackIndex: number, stepIndex: number) => {
    const track = tracks[trackIndex];
    if (!track) return;
    handleUpdateStep(trackIndex, stepIndex, !track.steps[stepIndex]);
  };

  const handleSetStepPitch = (
    trackIndex: number,
    stepIndex: number,
    midiNote: number,
  ) => {
    handleUpdateStep(trackIndex, stepIndex, true, midiNote);
  };

  const handleRemoveStep = (trackIndex: number, stepIndex: number) => {
    handleUpdateStep(trackIndex, stepIndex, false);
  };

  // Track Mixer Controls
  const handleTrackVolumeChange = (trackIndex: number, vol: number) => {
    setTracks((prev) => {
      const updated = prev.map((t, idx) =>
        idx === trackIndex ? { ...t, volume: vol } : t,
      );
      engineRef.current?.setTrackVolume(trackIndex, vol);
      return updated;
    });
  };

  const handleToggleMute = (trackIndex: number) => {
    if (!engineRef.current) return;
    setTracks((prev) => {
      const updated = prev.map((t, idx) =>
        idx === trackIndex ? { ...t, isMuted: !t.isMuted } : t,
      );
      engineRef.current?.setTracks(updated);
      return updated;
    });
  };

  const handleToggleSolo = (trackIndex: number) => {
    if (!engineRef.current) return;
    setTracks((prev) => {
      const updated = prev.map((t, idx) =>
        idx === trackIndex ? { ...t, isSoloed: !t.isSoloed } : t,
      );
      engineRef.current?.setTracks(updated);
      return updated;
    });
  };

  // Sample Swapping (in Sequencer Rack)
  const handleSampleChange = async (trackIndex: number, sampleId: string) => {
    if (!engineRef.current) return;
    const meta = SAMPLE_CATALOG.find((s) => s.id === sampleId);
    if (!meta) return;

    await engineRef.current.setTrackSample(trackIndex, sampleId);

    setTracks((prev) => {
      const updated = prev.map((t, idx) =>
        idx === trackIndex
          ? { ...t, sampleId: meta.id, name: meta.name, type: meta.type }
          : t,
      );
      engineRef.current?.setTracks(updated);
      return updated;
    });
  };

  // Add / Delete Track (up to 10 max)
  const handleAddTrack = async (sampleId: string) => {
    if (!engineRef.current || tracks.length >= 10) return;
    const meta = SAMPLE_CATALOG.find((s) => s.id === sampleId);
    if (!meta) return;

    const newTrack = await engineRef.current.addTrack(meta);
    if (newTrack) {
      setTracks((prev) => [...prev, newTrack]);
    }
  };

  const handleDeleteTrack = (trackIndex: number) => {
    if (tracks.length <= 1) return;
    engineRef.current?.removeTrack(trackIndex);
    setTracks((prev) => prev.filter((_, idx) => idx !== trackIndex));
  };

  // Audition sample
  const handleAuditionTrack = (trackIndex: number, midiNote?: number) => {
    engineRef.current?.auditionTrackStep(trackIndex, midiNote);
  };

  // Clear & Reset
  const handleClearAll = () => {
    setTracks((prev) => {
      const cleared = prev.map((t) => ({
        ...t,
        steps: new Array(64).fill(false),
      }));
      engineRef.current?.setTracks(cleared);
      return cleared;
    });
  };

  const handleResetDemo = () => {
    const clone = INITIAL_TRACKS.map((t) => ({
      ...t,
      steps: [...t.steps],
      pitches: [...t.pitches],
    }));
    setTracks(clone);
    engineRef.current?.setTracks(clone);
  };

  // Active position details for LCD
  const activeBarIndex = activeStep >= 0 ? Math.floor(activeStep / 16) : -1;
  const activeBeat =
    activeStep >= 0 ? Math.floor((activeStep % 16) / 4) + 1 : 1;
  const active16th = activeStep >= 0 ? (activeStep % 4) + 1 : 1;

  // DAW Main Content JSX
  const dawContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Transport Bar & View Switcher (Clean Two-Tier Layout) */}
      <section
        style={{
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "6px",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Tier 1: Audio Playback & Clock */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Left: Play/Stop & BPM */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleTogglePlay}
              disabled={!isReady}
              style={{
                padding: "7px 18px",
                background: isPlaying ? "#ef4444" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: isReady ? "pointer" : "not-allowed",
                fontWeight: "bold",
                fontSize: "12px",
                minWidth: "85px",
                letterSpacing: "0.5px",
                boxShadow: isPlaying
                  ? "0 0 10px rgba(239, 68, 68, 0.4)"
                  : "none",
                transition: "all 0.15s ease",
              }}
            >
              {isPlaying ? "■ STOP" : "▶ PLAY"}
            </button>

            {/* BPM Stepper */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#09090b",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #3f3f46",
                gap: "4px",
              }}
            >
              <span
                style={{
                  color: "#71717a",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                BPM:
              </span>
              <button
                onClick={() => handleBpmChange(bpm - 5)}
                style={{
                  background: "#27272a",
                  color: "#e4e4e7",
                  border: "none",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                -5
              </button>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  minWidth: "36px",
                  textAlign: "center",
                  color: "#f4f4f5",
                  fontFamily: "monospace",
                }}
              >
                {bpm}
              </span>
              <button
                onClick={() => handleBpmChange(bpm + 5)}
                style={{
                  background: "#27272a",
                  color: "#e4e4e7",
                  border: "none",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                +5
              </button>
            </div>
          </div>

          {/* Center: LCD Position Display */}
          <div
            style={{
              background: "#09090b",
              padding: "5px 12px",
              borderRadius: "4px",
              border: "1px solid #3f3f46",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "monospace",
            }}
          >
            <div>
              <span style={{ color: "#71717a", fontSize: "10px" }}>POS:</span>{" "}
              <span
                style={{
                  color: isPlaying ? "#60a5fa" : "#a1a1aa",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                BAR {activeBarIndex >= 0 ? activeBarIndex + 1 : 1} : BEAT{" "}
                {activeBeat} : 16TH {active16th}
              </span>
            </div>
            <span style={{ color: "#3f3f46" }}>|</span>
            <div style={{ color: "#a1a1aa", fontSize: "11px" }}>
              STEP:{" "}
              <span
                style={{
                  color: isPlaying ? "#22c55e" : "#e4e4e7",
                  fontWeight: "bold",
                }}
              >
                {activeStep >= 0 ? activeStep + 1 : 0}
              </span>{" "}
              / 64
            </div>
          </div>

          {/* Right: Master Volume & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  color: "#a1a1aa",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                MASTER:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) =>
                  handleMasterVolChange(parseFloat(e.target.value))
                }
                style={{
                  width: "70px",
                  accentColor: "#2563eb",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "#93c5fd",
                  minWidth: "30px",
                  fontFamily: "monospace",
                }}
              >
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: isReady ? "#22c55e" : "#eab308",
                  boxShadow: isReady ? "0 0 6px #22c55e" : "none",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: isReady ? "#22c55e" : "#eab308",
                }}
              >
                {isReady ? "ONLINE" : "LOADING"}
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Studio Layout & Project Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            borderTop: "1px solid #27272a",
            paddingTop: "8px",
          }}
        >
          {/* Studio Layout Indicator & Track Capacity */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                letterSpacing: "0.5px",
              }}
            >
              🪟 SPLIT VIEW{" "}
              <span
                style={{
                  color: "#71717a",
                  fontWeight: "normal",
                  fontSize: "10px",
                }}
              >
                (Channel Rack + Mixer Console)
              </span>
            </span>

            {/* Track Limit Pill */}
            <span
              style={{
                background:
                  tracks.length >= 10
                    ? "#450a0a"
                    : tracks.length >= 8
                      ? "#422006"
                      : "#09090b",
                color:
                  tracks.length >= 10
                    ? "#f87171"
                    : tracks.length >= 8
                      ? "#facc15"
                      : "#94a3b8",
                border:
                  tracks.length >= 10
                    ? "1px solid #7f1d1d"
                    : tracks.length >= 8
                      ? "1px solid #713f12"
                      : "1px solid #27272a",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              {tracks.length} / 10 TRACKS
            </span>
          </div>

          {/* Quick Actions & Window Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleClearAll}
              style={{
                background: "#27272a",
                color: "#f87171",
                border: "1px solid #3f3f46",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "bold",
              }}
              title="Clear all note triggers"
            >
              🗑 CLEAR
            </button>
            <button
              onClick={handleResetDemo}
              style={{
                background: "#27272a",
                color: "#93c5fd",
                border: "1px solid #3f3f46",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "bold",
              }}
              title="Reload initial 4-bar groove"
            >
              ↺ RELOAD
            </button>

            {/* Window Mode Toggle */}
            <button
              onClick={() =>
                setContainerMode((prev) =>
                  prev === "fullscreen" ? "windowpane" : "fullscreen",
                )
              }
              style={{
                background:
                  containerMode === "windowpane" ? "#1e3a8a" : "#27272a",
                color: containerMode === "windowpane" ? "#93c5fd" : "#a1a1aa",
                border:
                  containerMode === "windowpane"
                    ? "1px solid #3b82f6"
                    : "1px solid #3f3f46",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "bold",
              }}
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
        }}
      >
        <Sequencer
          tracks={tracks}
          activeStep={activeStep}
          activePitches={activePitches}
          onToggleStep={handleToggleStep}
          onSetStepPitch={handleSetStepPitch}
          onRemoveStep={handleRemoveStep}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
          onSampleChange={handleSampleChange}
          onAuditionTrack={handleAuditionTrack}
          onAddTrack={handleAddTrack}
          onDeleteTrack={handleDeleteTrack}
          onActivePitchChange={(id, pitch) =>
            setActivePitches((prev) => ({ ...prev, [id]: pitch }))
          }
        />

        <Mixer
          tracks={tracks}
          masterVolume={masterVolume}
          onMasterVolumeChange={handleMasterVolChange}
          onTrackVolumeChange={handleTrackVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
        />
      </div>

      {/* Compact Status / Tips Footer */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#71717a",
          fontSize: "10px",
          padding: "6px 4px",
          borderTop: "1px solid #1f1f23",
          marginTop: "4px",
          fontFamily: "monospace",
        }}
      >
        <div>
          💡 <strong>Tips:</strong> Click track name to audition sound • Space:
          Play/Stop • Drag faders to mix • Max 10 Tracks
        </div>
        <div>tractDAW • Max 10 Tracks • 64 Steps</div>
      </footer>
    </div>
  );

  // Top-Level Container Rendering
  if (containerMode === "windowpane") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "24px 16px",
          boxSizing: "border-box",
          fontFamily: "Consolas, monospace",
          color: "#f4f4f5",
          userSelect: "none",
        }}
      >
        {/* WindowPane Frame Simulation */}
        <div
          style={{
            width: "1280px",
            maxWidth: "96vw",
            height: "720px",
            maxHeight: "92vh",
            background: "rgba(18, 18, 22, 0.96)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "6px",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* WindowPane Header */}
          <div
            style={{
              height: "36px",
              background: "rgba(24, 24, 28, 0.95)",
              borderBottom: "1px solid #27272a",
              padding: "0 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#f4f4f5",
                  letterSpacing: "0.5px",
                }}
              >
                tractDAW<span style={{ color: "#3b82f6" }}>.</span>
              </span>
              <span style={{ color: "#71717a", fontSize: "11px" }}>
                (mini web DAW)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setContainerMode("fullscreen")}
                style={{
                  background: "transparent",
                  border: "1px solid #3f3f46",
                  color: "#a1a1aa",
                  borderRadius: "3px",
                  fontSize: "10px",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
                title="Switch to full width view"
              >
                EXPAND ↗
              </button>
              <button
                onClick={() => setContainerMode("fullscreen")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "18px",
                  lineHeight: "1",
                  cursor: "pointer",
                  padding: "0 4px",
                }}
                title="Close Window simulation"
              >
                &times;
              </button>
            </div>
          </div>

          {/* WindowPane Body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {dawContent}
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen Container Mode
  return (
    <main
      style={{
        padding: "10px 14px",
        background: "#09090b",
        color: "#f4f4f5",
        fontFamily: "Consolas, monospace",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #27272a",
            paddingBottom: "10px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "17px",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              tractDAW{" "}
              <span
                style={{
                  color: "#3b82f6",
                  fontSize: "11px",
                  background: "#1e3a8a",
                  padding: "1px 6px",
                  borderRadius: "3px",
                }}
              >
                PHASE 3
              </span>
            </h1>
            <div
              style={{
                fontSize: "11px",
                color: "#71717a",
                marginTop: "3px",
              }}
            >
              64-Step Channel Rack • Volume Faders (Solo/Mute) • WindowPane
              Optimized
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setContainerMode("windowpane")}
              style={{
                background: "#18181b",
                border: "1px solid #3b82f6",
                color: "#93c5fd",
                borderRadius: "4px",
                padding: "5px 10px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
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

import React, { useEffect, useRef } from "react";
import { useDawStore } from "../store/useDawStore";

// MIDI note 72 (C5) down to 36 (C2) = 37 semitones (3 full octaves)
const PITCH_RANGE = Array.from({ length: 37 }, (_, i) => 72 - i);

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const getNoteLabel = (midi: number) => {
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
};

const isBlackKey = (midi: number) => {
  const semitone = midi % 12;
  return [1, 3, 6, 8, 10].includes(semitone);
};

export const PianoRoll: React.FC = () => {
  const pianoRollTrackId = useDawStore((state) => state.pianoRollTrackId);
  const closePianoRoll = useDawStore((state) => state.closePianoRoll);
  const openPianoRoll = useDawStore((state) => state.openPianoRoll);
  const tracks = useDawStore((state) => state.tracks);
  const activeStep = useDawStore((state) => state.activeStep);
  const isPlaying = useDawStore((state) => state.isPlaying);
  const togglePlay = useDawStore((state) => state.togglePlay);
  const togglePianoRollNote = useDawStore((state) => state.togglePianoRollNote);
  const auditionTrack = useDawStore((state) => state.auditionTrack);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center on octave 4 (around C4) on first open
  useEffect(() => {
    if (pianoRollTrackId && scrollContainerRef.current) {
      // Row height is ~20px. C4 (midi 60) is index 12 in PITCH_RANGE
      scrollContainerRef.current.scrollTop = 12 * 20 - 60;
    }
  }, [pianoRollTrackId]);

  // Keyboard shortcut: Esc to close, Space to play/stop
  useEffect(() => {
    if (!pianoRollTrackId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        closePianoRoll();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pianoRollTrackId, closePianoRoll, togglePlay]);

  if (!pianoRollTrackId) return null;

  const trackIndex = tracks.findIndex((t) => t.id === pianoRollTrackId);
  const track = tracks[trackIndex];
  if (!track) return null;

  const isMelodic = track.type === "melodic";
  const noteAccentColor = isMelodic ? "#a855f7" : "#f97316";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closePianoRoll();
        }
      }}
    >
      {/* Floating Piano Roll Window */}
      <div
        style={{
          width: "1080px",
          maxWidth: "96vw",
          height: "600px",
          maxHeight: "92vh",
          background: "#16161a",
          border: "1px solid #3f3f46",
          borderRadius: "8px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: "40px",
            background: "#1f1f24",
            borderBottom: "1px solid #27272a",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {/* Left: Window Title & Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#f4f4f5",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🎹 Piano Roll —{" "}
              <span style={{ color: noteAccentColor }}>{track.name}</span>
            </span>

            {/* Quick Track Switcher Pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginLeft: "12px",
              }}
            >
              {tracks.map((t) => {
                const isSelected = t.id === track.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => openPianoRoll(t.id)}
                    style={{
                      background: isSelected ? "#3b82f6" : "#27272a",
                      color: isSelected ? "#fff" : "#a1a1aa",
                      border: "none",
                      borderRadius: "3px",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontWeight: isSelected ? "bold" : "normal",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    title={`Switch to ${t.name}`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Window Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={closePianoRoll}
              style={{
                background: "transparent",
                border: "none",
                color: "#a1a1aa",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "2px 6px",
                lineHeight: 1,
              }}
              title="Close Piano Roll (Esc)"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Beats / Bars Ruler Header */}
        <div
          style={{
            height: "26px",
            background: "#18181c",
            borderBottom: "1px solid #27272a",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            paddingLeft: "74px", // Align with 74px keyboard width
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(64, minmax(13px, 1fr))",
              width: "100%",
              height: "100%",
            }}
          >
            {Array.from({ length: 64 }, (_, step) => {
              const isBarStart = step % 16 === 0;
              const isBeatStart = step % 4 === 0;
              const barNum = Math.floor(step / 16) + 1;
              const beatNum = (Math.floor(step / 4) % 4) + 1;

              return (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontFamily: "monospace",
                    fontWeight: isBarStart ? "bold" : "normal",
                    color: isBarStart
                      ? "#60a5fa"
                      : isBeatStart
                        ? "#a1a1aa"
                        : "#52525b",
                    borderLeft: isBarStart
                      ? "2px solid #3b82f6"
                      : isBeatStart
                        ? "1px solid #3f3f46"
                        : "1px solid transparent",
                    background:
                      activeStep === step
                        ? "rgba(59, 130, 246, 0.25)"
                        : "transparent",
                  }}
                >
                  {isBarStart ? `${barNum}` : isBeatStart ? `.${beatNum}` : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Piano Roll Body: Vertical Piano Keys (Left) + Multi-pitch 64-step Grid (Right) */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            display: "flex",
            position: "relative",
            background: "#121215",
          }}
        >
          {/* 1. Left Authentic Piano Keys Column (74px width) */}
          <div
            style={{
              width: "74px",
              flexShrink: 0,
              background: "#16161a",
              borderRight: "2px solid #27272a",
              position: "sticky",
              left: 0,
              zIndex: 10,
            }}
          >
            {PITCH_RANGE.map((midi) => {
              const isBlack = isBlackKey(midi);
              const label = getNoteLabel(midi);
              const isC = midi % 12 === 0;
              const isEFBoundary = midi % 12 === 5; // F is above E
              const isBCBoundary = midi % 12 === 0; // C is above B
              const activeStepNotes = track.notes?.[activeStep]?.length
                ? track.notes[activeStep]
                : [track.pitches[activeStep]];
              const isCurrentlyPlaying =
                activeStep >= 0 &&
                track.steps[activeStep] &&
                activeStepNotes.includes(midi);

              return (
                <div
                  key={midi}
                  onClick={() => auditionTrack(trackIndex, midi)}
                  style={{
                    height: "20px",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "stretch",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  title={`Click to audition ${label}`}
                >
                  {isBlack ? (
                    <>
                      {/* Black Key: Elevated 3D Protrusion from Left Edge */}
                      <div
                        style={{
                          width: "44px",
                          height: "18px",
                          margin: "1px 0",
                          background: isCurrentlyPlaying
                            ? "#3b82f6"
                            : "linear-gradient(90deg, #18181c 0%, #26262e 70%, #353540 100%)",
                          borderRadius: "0 3px 3px 0",
                          borderRight: "1px solid #101014",
                          borderTop: "1px solid #3f3f46",
                          borderBottom: "1px solid #09090b",
                          boxShadow: isCurrentlyPlaying
                            ? "0 0 10px #3b82f6"
                            : "1px 2px 3px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                          zIndex: 2,
                          flexShrink: 0,
                          transition: "background 0.05s",
                        }}
                      />
                      {/* White Key Body Underneath (Right Side) */}
                      <div
                        style={{
                          flex: 1,
                          height: "20px",
                          background: isCurrentlyPlaying
                            ? "#bfdbfe"
                            : "#e4e4ea",
                          borderRight: "1px solid #27272a",
                          borderBottom: "1px solid #d4d4dc",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* White Key Left Area (Between Black Keys) */}
                      <div
                        style={{
                          width: "44px",
                          height: "20px",
                          background: isCurrentlyPlaying
                            ? "#bfdbfe"
                            : "#f2f2f6",
                          boxShadow:
                            "inset 0 1px 0 #ffffff, inset 0 -1px 0 #d4d4dc",
                          borderBottom:
                            isEFBoundary || isBCBoundary
                              ? "1px solid #a1a1aa"
                              : "1px solid #d4d4dc",
                          flexShrink: 0,
                          transition: "background 0.05s",
                        }}
                      />
                      {/* White Key Right Area (Next to Grid) with Octave Label on C */}
                      <div
                        style={{
                          flex: 1,
                          height: "20px",
                          background: isCurrentlyPlaying
                            ? "#bfdbfe"
                            : "#eaeaf0",
                          borderRight: "1px solid #27272a",
                          borderBottom:
                            isEFBoundary || isBCBoundary
                              ? "1px solid #a1a1aa"
                              : "1px solid #d4d4dc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingRight: "2px",
                          transition: "background 0.05s",
                        }}
                      >
                        {isC && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: isCurrentlyPlaying ? "#1e3a8a" : "#475569",
                              fontFamily: "monospace",
                            }}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 2. Right Note Matrix Grid (64 Columns x 37 Pitch Rows) */}
          <div
            style={{
              flex: 1,
              minWidth: "832px", // 64 steps * 13px min
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Playhead Vertical Overlay Line */}
            {activeStep >= 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${(activeStep / 64) * 100}%`,
                  width: `${(1 / 64) * 100}%`,
                  background: "rgba(59, 130, 246, 0.22)",
                  borderLeft: "2px solid #60a5fa",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            )}

            {PITCH_RANGE.map((midi) => {
              const isBlack = isBlackKey(midi);

              return (
                <div
                  key={midi}
                  style={{
                    height: "20px",
                    boxSizing: "border-box",
                    display: "grid",
                    gridTemplateColumns: "repeat(64, minmax(13px, 1fr))",
                    borderBottom: "1px solid #1f1f23",
                    background: isBlack ? "#16161a" : "#1a1a20",
                  }}
                >
                  {Array.from({ length: 64 }, (_, stepIdx) => {
                    const isBarStart = stepIdx % 16 === 0;
                    const isBeatStart = stepIdx % 4 === 0;

                    // Check if this step has an active note at this exact pitch (supports chords)
                    const stepNotes = track.notes?.[stepIdx]?.length
                      ? track.notes[stepIdx]
                      : track.steps[stepIdx]
                        ? [track.pitches[stepIdx]]
                        : [];
                    const hasNote = stepNotes.includes(midi);

                    return (
                      <div
                        key={stepIdx}
                        onClick={() =>
                          togglePianoRollNote(trackIndex, stepIdx, midi)
                        }
                        style={{
                          height: "100%",
                          boxSizing: "border-box",
                          borderLeft: isBarStart
                            ? "2px solid #27272a"
                            : isBeatStart
                              ? "1px solid #222228"
                              : "1px solid rgba(255, 255, 255, 0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: "1px",
                          position: "relative",
                        }}
                        title={`Step ${stepIdx + 1} • ${getNoteLabel(midi)}`}
                      >
                        {hasNote && (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: isMelodic
                                ? "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)"
                                : "linear-gradient(180deg, #fb923c 0%, #ea580c 100%)",
                              borderRadius: "2px",
                              boxShadow: isMelodic
                                ? "0 0 6px rgba(168, 85, 247, 0.5)"
                                : "0 0 6px rgba(249, 115, 22, 0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: "8px",
                              fontWeight: "bold",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getNoteLabel(midi)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info & Shortcuts */}
        <div
          style={{
            height: "30px",
            background: "#18181c",
            borderTop: "1px solid #27272a",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#71717a",
            flexShrink: 0,
            fontFamily: "monospace",
          }}
        >
          <div>
            💡 Click grid cell to place/remove note • Click piano key to
            audition • Space: Play/Stop
          </div>
          <div>
            Press <kbd style={{ color: "#e4e4e7" }}>Esc</kbd> to Close
          </div>
        </div>
      </div>
    </div>
  );
};

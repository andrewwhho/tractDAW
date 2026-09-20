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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 box-border"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closePianoRoll();
        }
      }}
    >
      {/* Floating Piano Roll Window */}
      <div className="w-[1080px] max-w-[96vw] h-[600px] max-h-[92vh] bg-zinc-950 border border-zinc-700 rounded-lg shadow-2xl flex flex-col overflow-hidden select-none">
        {/* Title Bar */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-3.5 flex items-center justify-between shrink-0">
          {/* Left: Window Title & Icon */}
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-bold text-zinc-100 tracking-wide flex items-center gap-1.5 font-mono">
              🎹 Piano Roll —{" "}
              <span style={{ color: noteAccentColor }}>{track.name}</span>
            </span>

            {/* Quick Track Switcher Pills */}
            <div className="flex items-center gap-1 ml-3">
              {tracks.map((t) => {
                const isSelected = t.id === track.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => openPianoRoll(t.id)}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-normal"
                    }`}
                    title={`Switch to ${t.name}`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={closePianoRoll}
              className="bg-transparent border-none text-zinc-400 hover:text-white text-lg font-bold cursor-pointer px-1.5 leading-none"
              title="Close Piano Roll (Esc)"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Beats / Bars Ruler Header */}
        <div className="h-[26px] bg-zinc-900 border-b border-zinc-800 flex items-center shrink-0 pl-[74px]">
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: "repeat(64, minmax(13px, 1fr))",
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
                  className={`flex items-center justify-center text-[9px] font-mono ${
                    isBarStart
                      ? "font-bold text-blue-400 border-l-2 border-l-blue-500"
                      : isBeatStart
                        ? "text-zinc-400 border-l border-l-zinc-700"
                        : "text-zinc-600 border-l border-l-transparent"
                  } ${
                    activeStep === step ? "bg-blue-500/25" : "bg-transparent"
                  }`}
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
          className="flex-1 overflow-y-auto overflow-x-auto flex relative bg-zinc-950"
        >
          {/* 1. Left Authentic Piano Keys Column (74px width) */}
          <div className="w-[74px] shrink-0 bg-zinc-950 border-r-2 border-zinc-800 sticky left-0 z-20 flex flex-col">
            {PITCH_RANGE.map((midi) => {
              const isBlack = isBlackKey(midi);
              const label = getNoteLabel(midi);
              const isC = midi % 12 === 0;
              const isEFBoundary = midi % 12 === 5;
              const isBCBoundary = midi % 12 === 0;
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
                  className="h-[20px] min-h-[20px] max-h-[20px] shrink-0 box-border flex items-stretch cursor-pointer relative"
                  title={`Click to audition ${label}`}
                >
                  {isBlack ? (
                    <>
                      {/* Black Key: Elevated 3D Protrusion from Left Edge */}
                      <div
                        className={`piano-key-3d-black ${
                          isCurrentlyPlaying ? "piano-key-3d-black-active" : ""
                        }`}
                      />
                      {/* White Key Body Underneath (Right Side) */}
                      <div
                        className={`piano-key-3d-white-body ${
                          isCurrentlyPlaying ? "piano-key-3d-white-active" : ""
                        }`}
                      />
                    </>
                  ) : (
                    <>
                      {/* White Key Left Area (Between Black Keys) */}
                      <div
                        className={`w-[44px] h-[20px] shrink-0 box-border transition-colors ${
                          isCurrentlyPlaying ? "bg-blue-200" : "bg-[#f2f2f6]"
                        } ${
                          isEFBoundary || isBCBoundary
                            ? "border-b border-b-zinc-400"
                            : "border-b border-b-zinc-300"
                        }`}
                        style={{
                          boxShadow:
                            "inset 0 1px 0 #ffffff, inset 0 -1px 0 #d4d4dc",
                        }}
                      />
                      {/* White Key Right Area (Next to Grid) with Octave Label on C */}
                      <div
                        className={`piano-key-3d-white-body flex items-center justify-center pr-0.5 ${
                          isCurrentlyPlaying ? "piano-key-3d-white-active" : ""
                        } ${
                          isEFBoundary || isBCBoundary
                            ? "!border-b-zinc-400"
                            : "!border-b-zinc-300"
                        }`}
                      >
                        {isC && (
                          <span
                            className={`text-[10px] font-bold font-mono ${
                              isCurrentlyPlaying
                                ? "text-blue-900"
                                : "text-slate-600"
                            }`}
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
          <div className="flex-1 min-w-[832px] shrink-0 flex flex-col relative">
            {/* Playhead Vertical Overlay Line */}
            {activeStep >= 0 && (
              <div
                className="absolute inset-y-0 bg-blue-500/20 border-l-2 border-l-blue-400 pointer-events-none z-10"
                style={{
                  left: `${(activeStep / 64) * 100}%`,
                  width: `${(1 / 64) * 100}%`,
                }}
              />
            )}

            {PITCH_RANGE.map((midi) => {
              const isBlack = isBlackKey(midi);

              return (
                <div
                  key={midi}
                  className={`h-[20px] min-h-[20px] max-h-[20px] shrink-0 box-border grid border-b border-zinc-900 ${
                    isBlack ? "bg-zinc-950" : "bg-[#191920]"
                  }`}
                  style={{
                    gridTemplateColumns: "repeat(64, minmax(13px, 1fr))",
                  }}
                >
                  {Array.from({ length: 64 }, (_, stepIdx) => {
                    const isBarStart = stepIdx % 16 === 0;
                    const isBeatStart = stepIdx % 4 === 0;

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
                        className={`h-full box-border flex items-center justify-center cursor-pointer p-[1px] relative ${
                          isBarStart
                            ? "border-l-2 border-l-zinc-700"
                            : isBeatStart
                              ? "border-l border-l-zinc-800"
                              : "border-l border-l-white/[0.03]"
                        }`}
                        title={`Step ${stepIdx + 1} • ${getNoteLabel(midi)}`}
                      >
                        {hasNote && (
                          <div
                            className={`w-full h-full rounded-[2px] flex items-center justify-center text-white text-[8px] font-bold font-mono overflow-hidden truncate whitespace-nowrap ${
                              isMelodic
                                ? "bg-gradient-to-b from-purple-400 to-purple-600 shadow-[0_0_6px_rgba(168,85,247,0.5)]"
                                : "bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_0_6px_rgba(249,115,22,0.5)]"
                            }`}
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
        <div className="h-[30px] bg-zinc-900 border-t border-zinc-800 px-3.5 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 font-mono">
          <div>
            💡 Click grid cell to place/remove note • Click piano key to
            audition • Space: Play/Stop
          </div>
          <div>
            Press <kbd className="text-zinc-200">Esc</kbd> to Close
          </div>
        </div>
      </div>
    </div>
  );
};
export default PianoRoll;

import React, { useState, useEffect } from "react";
import { SAMPLE_CATALOG } from "../audio/SampleCatalog";
import { useDawStore } from "../store/useDawStore";

// 2 Chromatic Octaves for the Step Picker: C3 (48) up to C5 (72)
export const NOTE_OPTIONS = [
  { midi: 48, label: "C3" },
  { midi: 49, label: "C#3" },
  { midi: 50, label: "D3" },
  { midi: 51, label: "D#3" },
  { midi: 52, label: "E3" },
  { midi: 53, label: "F3" },
  { midi: 54, label: "F#3" },
  { midi: 55, label: "G3" },
  { midi: 56, label: "G#3" },
  { midi: 57, label: "A3" },
  { midi: 58, label: "A#3" },
  { midi: 59, label: "B3" },
  { midi: 60, label: "C4" },
  { midi: 61, label: "C#4" },
  { midi: 62, label: "D4" },
  { midi: 63, label: "D#4" },
  { midi: 64, label: "E4" },
  { midi: 65, label: "F4" },
  { midi: 66, label: "F#4" },
  { midi: 67, label: "G4" },
  { midi: 68, label: "G#4" },
  { midi: 69, label: "A4" },
  { midi: 70, label: "A#4" },
  { midi: 71, label: "B4" },
  { midi: 72, label: "C5" },
];

export const NOTE_NAMES: Record<number, string> = Object.fromEntries(
  NOTE_OPTIONS.map((n) => [n.midi, n.label]),
);

export const Sequencer: React.FC = () => {
  const tracks = useDawStore((state) => state.tracks);
  const activeStep = useDawStore((state) => state.activeStep);
  const activePitches = useDawStore((state) => state.activePitches);
  const onToggleStep = useDawStore((state) => state.toggleStep);
  const onSetStepPitch = useDawStore((state) => state.setStepPitch);
  const onRemoveStep = useDawStore((state) => state.removeStep);
  const onToggleMute = useDawStore((state) => state.toggleMute);
  const onToggleSolo = useDawStore((state) => state.toggleSolo);
  const onSampleChange = useDawStore((state) => state.setTrackSample);
  const onAuditionTrack = useDawStore((state) => state.auditionTrack);
  const onAddTrack = useDawStore((state) => state.addTrack);
  const onDeleteTrack = useDawStore((state) => state.deleteTrack);
  const onActivePitchChange = useDawStore((state) => state.setActivePitch);
  const openPianoRoll = useDawStore((state) => state.openPianoRoll);

  // Pitch picker popover state
  const [pitchPicker, setPitchPicker] = useState<{
    trackIndex: number;
    stepIndex: number;
    x: number;
    y: number;
  } | null>(null);

  // Add track dropdown modal state
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Power Shortcut: Escape dismisses note popover or add menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pitchPicker) setPitchPicker(null);
        if (showAddMenu) setShowAddMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pitchPicker, showAddMenu]);

  // Permanent 64-step array [0..63]
  const displayedStepIndices = Array.from({ length: 64 }, (_, i) => i);

  const handleStepClick = (
    e: React.MouseEvent,
    trackIdx: number,
    globalStepIdx: number,
  ) => {
    const track = tracks[trackIdx];
    if (!track) return;

    if (e.shiftKey) {
      onRemoveStep(trackIdx, globalStepIdx);
      setPitchPicker(null);
      return;
    }

    if (track.type === "drum") {
      onToggleStep(trackIdx, globalStepIdx);
    } else {
      if (!track.steps[globalStepIdx]) {
        const pitchToUse =
          activePitches[track.id] ?? track.pitches[globalStepIdx] ?? 60;
        onSetStepPitch(trackIdx, globalStepIdx, pitchToUse);
      } else {
        const chordNotes = track.notes?.[globalStepIdx];
        if (chordNotes && chordNotes.length > 1) {
          openPianoRoll(track.id);
          return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPitchPicker({
          trackIndex: trackIdx,
          stepIndex: globalStepIdx,
          x: rect.left,
          y: rect.bottom + 4,
        });
      }
    }
  };

  return (
    <div
      onClick={() => pitchPicker && setPitchPicker(null)}
      className="w-full box-border"
    >
      {/* 64-Step Sequencer Rack */}
      <section className="bg-zinc-950/90 border border-zinc-800 rounded-md p-3 sm:px-3.5 overflow-x-auto">
        {/* Step Indicator Header LEDs */}
        <div className="flex items-center mb-2.5">
          <div className="w-[220px] shrink-0 text-[11px] font-bold text-zinc-500 flex items-center gap-1.5 font-mono">
            CHANNEL RACK{" "}
            <span className="text-blue-400 text-[10px]">
              ● 64 STEPS (4 BARS)
            </span>
          </div>
          <div className="flex gap-[3px] flex-1">
            {displayedStepIndices.map((globalStepIdx) => {
              const isCurrent = activeStep === globalStepIdx;
              const isBarStart = globalStepIdx % 16 === 0;
              const isBeatStart = globalStepIdx % 4 === 0;

              return (
                <div
                  key={globalStepIdx}
                  className={`flex-1 h-2 rounded-[2px] transition-all ${
                    isCurrent
                      ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                      : isBarStart
                        ? "bg-zinc-600"
                        : isBeatStart
                          ? "bg-zinc-700"
                          : "bg-zinc-800"
                  } ${
                    isBarStart && globalStepIdx !== 0
                      ? "border-l-2 border-l-blue-400"
                      : ""
                  }`}
                  title={`Step ${globalStepIdx + 1} (Bar ${Math.floor(globalStepIdx / 16) + 1}, Beat ${Math.floor((globalStepIdx % 16) / 4) + 1})`}
                />
              );
            })}
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-1.5">
          {tracks.map((track, trackIdx) => {
            const isMelodic = track.type === "melodic";
            const currentDrawingPitch = activePitches[track.id] ?? 60;

            return (
              <div
                key={track.id}
                className="flex items-center bg-zinc-900 px-2 py-1 rounded border border-zinc-800/80"
              >
                {/* Track Controls */}
                <div className="w-[220px] flex items-center gap-1.5 shrink-0">
                  {/* FL Studio Green Glowing LED Mute Light */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute(trackIdx);
                    }}
                    className={`w-2 h-2 rounded-full cursor-pointer shrink-0 transition-all ${
                      track.isMuted ? "led-mute-inactive" : "led-mute-active"
                    }`}
                    title={
                      track.isMuted
                        ? "Unmute Track (Click LED)"
                        : "Mute Track (Click LED)"
                    }
                  />

                  <button
                    onClick={() => onToggleMute(trackIdx)}
                    className={`rounded text-[10px] px-1.5 py-0.5 cursor-pointer font-bold text-white transition-colors ${
                      track.isMuted
                        ? "bg-red-500"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                    title="Mute Track"
                  >
                    M
                  </button>
                  <button
                    onClick={() => onToggleSolo(trackIdx)}
                    className={`rounded text-[10px] px-1.5 py-0.5 cursor-pointer font-bold transition-colors ${
                      track.isSoloed
                        ? "bg-yellow-500 text-black"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white"
                    }`}
                    title="Solo Track"
                  >
                    S
                  </button>

                  {/* Track Name */}
                  <span
                    onClick={() =>
                      onAuditionTrack(trackIdx, currentDrawingPitch)
                    }
                    className={`text-xs font-bold cursor-pointer truncate flex-1 ${
                      isMelodic ? "text-purple-400" : "text-zinc-100"
                    }`}
                    title={`${track.name} (Click to preview sound)`}
                  >
                    {track.name}
                  </span>

                  {/* Sample Swap Dropdown */}
                  <select
                    value={track.sampleId}
                    onChange={(e) => onSampleChange(trackIdx, e.target.value)}
                    className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[9px] p-0.5 cursor-pointer outline-none max-w-[75px]"
                    title="Change Sample"
                  >
                    {SAMPLE_CATALOG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Melodic Default Note Selector */}
                  {isMelodic && (
                    <select
                      value={currentDrawingPitch}
                      onChange={(e) => {
                        const newPitch = parseInt(e.target.value, 10);
                        onActivePitchChange(track.id, newPitch);
                        onAuditionTrack(trackIdx, newPitch);
                      }}
                      className="bg-zinc-800 text-purple-300 border border-zinc-700 rounded text-[9px] p-0.5 font-bold cursor-pointer outline-none"
                      title="Default note when adding new steps"
                    >
                      {NOTE_OPTIONS.map((n) => (
                        <option key={n.midi} value={n.midi}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Open Piano Roll Button */}
                  {isMelodic && (
                    <button
                      onClick={() => openPianoRoll(track.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white rounded text-[9px] font-bold px-1.5 py-0.5 cursor-pointer flex items-center gap-0.5 shrink-0 transition-colors"
                      title={`Open Piano Roll for ${track.name}`}
                    >
                      🎹
                    </button>
                  )}

                  {/* Delete Track Button */}
                  {tracks.length > 1 && (
                    <button
                      onClick={() => onDeleteTrack(trackIdx)}
                      className="bg-transparent text-zinc-500 hover:text-red-400 text-xs cursor-pointer p-0.5 transition-colors"
                      title="Remove Track"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Step Buttons Grid (Permanent 64 Steps) */}
                <div className="flex gap-[3px] flex-1">
                  {displayedStepIndices.map((globalStepIdx) => {
                    const isActive = track.steps[globalStepIdx];
                    const isBeatGroupA =
                      Math.floor(globalStepIdx / 4) % 2 === 0;
                    const isBarBoundary =
                      globalStepIdx % 16 === 0 && globalStepIdx !== 0;
                    const isCurrent = activeStep === globalStepIdx;
                    const pitch = track.pitches[globalStepIdx] ?? 60;
                    const chordNotes = track.notes?.[globalStepIdx]?.length
                      ? track.notes[globalStepIdx]
                      : isActive
                        ? [pitch]
                        : [];
                    const isChord =
                      isMelodic && isActive && chordNotes.length > 1;
                    const pitchName =
                      isMelodic && isActive
                        ? isChord
                          ? `${chordNotes.length}N`
                          : NOTE_NAMES[pitch] || "C4"
                        : null;

                    const padClasses = [
                      "step-pad-base flex-1 h-[26px] min-w-[12px] flex items-center justify-center text-[8px] font-bold font-mono cursor-pointer p-0 relative",
                      isCurrent ? "step-pad-current" : "",
                      isBarBoundary && !isCurrent
                        ? "border-l-2 !border-l-blue-500"
                        : "",
                      isActive
                        ? isMelodic
                          ? isChord
                            ? "step-pad-active-chord"
                            : "step-pad-active-melodic"
                          : "step-pad-active-drum"
                        : isBeatGroupA
                          ? "step-pad-group-a"
                          : "step-pad-group-b",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={globalStepIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepClick(e, trackIdx, globalStepIdx);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isActive) {
                            onRemoveStep(trackIdx, globalStepIdx);
                          }
                        }}
                        className={padClasses}
                        title={
                          isActive
                            ? isMelodic
                              ? isChord
                                ? `Step ${globalStepIdx + 1}: Chord [${chordNotes.map((n) => NOTE_NAMES[n] || n).join(", ")}] (${chordNotes.length} notes) • Click to open Piano Roll / Right-click to remove`
                                : `Step ${globalStepIdx + 1}: ${NOTE_NAMES[pitch] || "C4"} (Click to change note / Shift-click or Right-click to remove)`
                              : `Step ${globalStepIdx + 1}: Active (Click to remove)`
                            : `Step ${globalStepIdx + 1}: Empty (Click to add note)`
                        }
                      >
                        {pitchName
                          ? isChord
                            ? pitchName
                            : pitchName.slice(0, 2)
                          : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add Track Button (Capped at 10 Tracks) */}
          {tracks.length < 10 && (
            <div className="mt-2 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu((prev) => !prev);
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-dashed border-zinc-700 rounded px-4 py-2 cursor-pointer text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                + ADD TRACK ({tracks.length}/10)
              </button>

              {/* Add Track Dropdown Menu */}
              {showAddMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1.5 bg-zinc-900 border border-blue-500 rounded-md p-2 z-50 shadow-2xl max-h-[220px] overflow-y-auto w-[250px]"
                >
                  <div className="text-[11px] text-blue-300 font-bold mb-1.5 font-mono">
                    SELECT SAMPLE TO ADD:
                  </div>
                  {SAMPLE_CATALOG.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onAddTrack(s.id);
                        setShowAddMenu(false);
                      }}
                      className="px-1.5 py-1 text-[11px] text-zinc-200 hover:bg-zinc-800 cursor-pointer rounded flex justify-between transition-colors"
                    >
                      <span>{s.name}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {s.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Floating Note Picker Popover for Melodic Steps */}
      {pitchPicker && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bg-zinc-900 border border-blue-500 rounded-md p-2.5 z-50 shadow-2xl flex flex-col gap-2 min-w-[200px] max-w-[240px]"
          style={{
            left: Math.max(
              10,
              Math.min(pitchPicker.x, window.innerWidth - 240),
            ),
            top:
              pitchPicker.y + 260 > window.innerHeight
                ? Math.max(10, pitchPicker.y - 270)
                : pitchPicker.y,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
            <span className="text-[11px] text-blue-300 font-bold font-mono">
              STEP {pitchPicker.stepIndex + 1} NOTE:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const targetTrack = tracks[pitchPicker.trackIndex];
                  if (targetTrack) {
                    openPianoRoll(targetTrack.id);
                  }
                  setPitchPicker(null);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold px-1.5 py-0.5 cursor-pointer transition-colors"
                title="Open Piano Roll to compose chords"
              >
                🎹 ROLLS
              </button>
              <button
                onClick={() => {
                  onRemoveStep(pitchPicker.trackIndex, pitchPicker.stepIndex);
                  setPitchPicker(null);
                }}
                className="bg-red-500 hover:bg-red-400 text-white rounded text-[10px] font-bold px-1.5 py-0.5 cursor-pointer transition-colors"
                title="Remove this note trigger"
              >
                ✕ DELETE
              </button>
            </div>
          </div>

          {/* Grid of Note Buttons */}
          <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto">
            {NOTE_OPTIONS.map((n) => {
              const currentPitch =
                tracks[pitchPicker.trackIndex]?.pitches[pitchPicker.stepIndex];
              const isSelected = currentPitch === n.midi;

              return (
                <button
                  key={n.midi}
                  onClick={() => {
                    onSetStepPitch(
                      pitchPicker.trackIndex,
                      pitchPicker.stepIndex,
                      n.midi,
                    );
                    onActivePitchChange(
                      tracks[pitchPicker.trackIndex].id,
                      n.midi,
                    );
                    onAuditionTrack(pitchPicker.trackIndex, n.midi);
                    setPitchPicker(null);
                  }}
                  className={`rounded py-1.5 px-0.5 text-[11px] text-center cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold border border-blue-400"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-transparent font-normal"
                  }`}
                  title={`Play & set to ${n.label}`}
                >
                  {n.label}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-zinc-500 text-center font-mono">
            Click note to audition & set • Click Delete to remove
          </div>
        </div>
      )}
    </div>
  );
};
export default Sequencer;

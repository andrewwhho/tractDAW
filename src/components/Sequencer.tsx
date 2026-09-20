import React, { useState, useEffect } from "react";
import { SAMPLE_CATALOG } from "../audio/SampleCatalog";
import { useDawStore } from "../store/useDawStore";

export const NOTE_OPTIONS = [
  { midi: 48, label: "C3" },
  { midi: 50, label: "D3" },
  { midi: 51, label: "D#3" },
  { midi: 53, label: "F3" },
  { midi: 55, label: "G3" },
  { midi: 56, label: "G#3" },
  { midi: 58, label: "A#3" },
  { midi: 60, label: "C4" },
  { midi: 62, label: "D4" },
  { midi: 63, label: "D#4" },
  { midi: 65, label: "F4" },
  { midi: 67, label: "G4" },
  { midi: 68, label: "G#4" },
  { midi: 70, label: "A#4" },
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

  // Always 64 Steps (4 Bars of 16th notes)
  const displayedStepIndices = Array.from({ length: 64 }, (_, i) => i);

  // Step click: silent placement (no audition on click)
  const handleStepClick = (
    e: React.MouseEvent,
    trackIdx: number,
    globalStepIdx: number,
  ) => {
    const track = tracks[trackIdx];
    if (!track) return;

    // Shift-click quick remove
    if (e.shiftKey && track.steps[globalStepIdx]) {
      onRemoveStep(trackIdx, globalStepIdx);
      setPitchPicker(null);
      return;
    }

    if (track.type === "drum") {
      // Drum track: toggle on/off silently
      onToggleStep(trackIdx, globalStepIdx);
    } else {
      // Melodic track:
      if (!track.steps[globalStepIdx]) {
        // Turning ON empty step silently using current track pitch
        const pitchToUse =
          activePitches[track.id] ?? track.pitches[globalStepIdx] ?? 60;
        onSetStepPitch(trackIdx, globalStepIdx, pitchToUse);
      } else {
        // Step is already ON: open note picker to change note or delete
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
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      {/* 64-Step Sequencer Rack */}
      <section
        style={{
          background: "#121215",
          border: "1px solid #27272a",
          borderRadius: "6px",
          padding: "12px 14px",
          overflowX: "auto",
        }}
      >
        {/* Step Indicator Header LEDs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: "220px",
              flexShrink: 0,
              fontSize: "11px",
              fontWeight: "bold",
              color: "#71717a",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            CHANNEL RACK{" "}
            <span style={{ color: "#60a5fa", fontSize: "10px" }}>
              ● 64 STEPS (4 BARS)
            </span>
          </div>
          <div style={{ display: "flex", gap: "3px", flex: 1 }}>
            {displayedStepIndices.map((globalStepIdx) => {
              const isCurrent = activeStep === globalStepIdx;
              const isBarStart = globalStepIdx % 16 === 0;
              const isBeatStart = globalStepIdx % 4 === 0;

              return (
                <div
                  key={globalStepIdx}
                  style={{
                    flex: 1,
                    height: "8px",
                    borderRadius: "2px",
                    background: isCurrent
                      ? "#3b82f6"
                      : isBarStart
                        ? "#52525b"
                        : isBeatStart
                          ? "#3f3f46"
                          : "#27272a",
                    boxShadow: isCurrent ? "0 0 8px #3b82f6" : "none",
                    transition: "background 0.04s, box-shadow 0.04s",
                    borderLeft:
                      isBarStart && globalStepIdx !== 0
                        ? "2px solid #60a5fa"
                        : "none",
                  }}
                  title={`Step ${globalStepIdx + 1} (Bar ${Math.floor(globalStepIdx / 16) + 1}, Beat ${Math.floor((globalStepIdx % 16) / 4) + 1})`}
                />
              );
            })}
          </div>
        </div>

        {/* Tracks List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {tracks.map((track, trackIdx) => {
            const isMelodic = track.type === "melodic";
            const currentDrawingPitch = activePitches[track.id] ?? 60;

            return (
              <div
                key={track.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#18181b",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #27272a",
                }}
              >
                {/* Track Controls (M/S, Name with Preview, Sample Dropdown, Pitch, Delete) */}
                <div
                  style={{
                    width: "220px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => onToggleMute(trackIdx)}
                    style={{
                      background: track.isMuted ? "#ef4444" : "#27272a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "10px",
                      padding: "3px 6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    title="Mute Track"
                  >
                    M
                  </button>
                  <button
                    onClick={() => onToggleSolo(trackIdx)}
                    style={{
                      background: track.isSoloed ? "#eab308" : "#27272a",
                      color: track.isSoloed ? "#000" : "#fff",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "10px",
                      padding: "3px 6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    title="Solo Track"
                  >
                    S
                  </button>

                  {/* Track Name: Click to Preview / Audition */}
                  <span
                    onClick={() =>
                      onAuditionTrack(trackIdx, currentDrawingPitch)
                    }
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: isMelodic ? "#c084fc" : "#f4f4f5",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                    title={`${track.name} (Click to preview sound)`}
                  >
                    {track.name}
                  </span>

                  {/* Sample Swap Dropdown: In Sequencer Rack */}
                  <select
                    value={track.sampleId}
                    onChange={(e) => onSampleChange(trackIdx, e.target.value)}
                    style={{
                      background: "#27272a",
                      color: "#d4d4d8",
                      border: "1px solid #3f3f46",
                      borderRadius: "3px",
                      fontSize: "9px",
                      padding: "2px 2px",
                      cursor: "pointer",
                      outline: "none",
                      maxWidth: "75px",
                    }}
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
                      style={{
                        background: "#27272a",
                        color: "#a78bfa",
                        border: "1px solid #3f3f46",
                        borderRadius: "3px",
                        fontSize: "9px",
                        padding: "2px 2px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        outline: "none",
                      }}
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
                      style={{
                        background: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        padding: "2px 5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        flexShrink: 0,
                      }}
                      title={`Open Piano Roll for ${track.name}`}
                    >
                      🎹
                    </button>
                  )}

                  {/* Delete Track Button */}
                  {tracks.length > 1 && (
                    <button
                      onClick={() => onDeleteTrack(trackIdx)}
                      style={{
                        background: "transparent",
                        color: "#71717a",
                        border: "none",
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: "2px 4px",
                      }}
                      title="Remove Track"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Step Buttons Grid (Permanent 64 Steps) */}
                <div style={{ display: "flex", gap: "3px", flex: 1 }}>
                  {displayedStepIndices.map((globalStepIdx) => {
                    const isActive = track.steps[globalStepIdx];
                    const isBeatGroupA =
                      Math.floor(globalStepIdx / 4) % 2 === 0;
                    const isBarBoundary =
                      globalStepIdx % 16 === 0 && globalStepIdx !== 0;
                    const isCurrent = activeStep === globalStepIdx;
                    const pitch = track.pitches[globalStepIdx] ?? 60;
                    const pitchName =
                      isMelodic && isActive ? NOTE_NAMES[pitch] || "C4" : null;

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
                        style={{
                          flex: 1,
                          height: "26px",
                          minWidth: "12px",
                          borderRadius: "3px",
                          border: isCurrent
                            ? "1px solid #60a5fa"
                            : "1px solid transparent",
                          borderLeft: isBarBoundary
                            ? "2px solid #3b82f6"
                            : isCurrent
                              ? "1px solid #60a5fa"
                              : "1px solid transparent",
                          background: isActive
                            ? isMelodic
                              ? "#8b5cf6"
                              : "#f4f4f5"
                            : isBeatGroupA
                              ? "#222226"
                              : "#2d2d33",
                          color: isActive
                            ? isMelodic
                              ? "#fff"
                              : "#000"
                            : "#71717a",
                          fontSize: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow:
                            isActive && isCurrent ? "0 0 10px #60a5fa" : "none",
                          transform: isCurrent ? "scale(1.04)" : "none",
                          transition: "transform 0.04s",
                          padding: 0,
                          position: "relative",
                        }}
                        title={
                          isActive
                            ? isMelodic
                              ? `Step ${globalStepIdx + 1}: ${pitchName} (Click to change note / Shift-click or Right-click to remove)`
                              : `Step ${globalStepIdx + 1}: Active (Click to remove)`
                            : `Step ${globalStepIdx + 1}: Empty (Click to add note)`
                        }
                      >
                        {pitchName ? pitchName.slice(0, 2) : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add Track Button (Capped at 10 Tracks) */}
          {tracks.length < 10 && (
            <div style={{ marginTop: "8px", position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu((prev) => !prev);
                }}
                style={{
                  background: "#18181b",
                  color: "#60a5fa",
                  border: "1px dashed #3f3f46",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                + ADD TRACK ({tracks.length}/10)
              </button>

              {/* Add Track Dropdown Menu */}
              {showAddMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "6px",
                    background: "#18181b",
                    border: "1px solid #3b82f6",
                    borderRadius: "6px",
                    padding: "8px",
                    zIndex: 2000,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                    maxHeight: "220px",
                    overflowY: "auto",
                    width: "250px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#93c5fd",
                      fontWeight: "bold",
                      marginBottom: "6px",
                    }}
                  >
                    SELECT SAMPLE TO ADD:
                  </div>
                  {SAMPLE_CATALOG.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onAddTrack(s.id);
                        setShowAddMenu(false);
                      }}
                      style={{
                        padding: "4px 6px",
                        fontSize: "11px",
                        color: "#e4e4e7",
                        cursor: "pointer",
                        borderRadius: "3px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#27272a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span>{s.name}</span>
                      <span style={{ color: "#71717a", fontSize: "10px" }}>
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
          style={{
            position: "fixed",
            left: Math.max(
              10,
              Math.min(pitchPicker.x, window.innerWidth - 240),
            ),
            top:
              pitchPicker.y + 260 > window.innerHeight
                ? Math.max(10, pitchPicker.y - 270)
                : pitchPicker.y,
            background: "#18181b",
            border: "1px solid #3b82f6",
            borderRadius: "6px",
            padding: "10px",
            zIndex: 1000,
            boxShadow: "0 10px 30px rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: "200px",
            maxWidth: "240px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #27272a",
              paddingBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "11px", color: "#93c5fd", fontWeight: "bold" }}
            >
              STEP {pitchPicker.stepIndex + 1} NOTE:
            </span>
            <button
              onClick={() => {
                onRemoveStep(pitchPicker.trackIndex, pitchPicker.stepIndex);
                setPitchPicker(null);
              }}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                fontSize: "10px",
                fontWeight: "bold",
                padding: "2px 6px",
                cursor: "pointer",
              }}
              title="Remove this note trigger"
            >
              ✕ DELETE
            </button>
          </div>

          {/* Grid of Note Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4px",
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
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
                  style={{
                    background: isSelected ? "#3b82f6" : "#27272a",
                    color: isSelected ? "#fff" : "#e4e4e7",
                    border: isSelected
                      ? "1px solid #60a5fa"
                      : "1px solid transparent",
                    borderRadius: "3px",
                    padding: "6px 2px",
                    fontSize: "11px",
                    fontWeight: isSelected ? "bold" : "normal",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background 0.1s",
                  }}
                  title={`Play & set to ${n.label}`}
                >
                  {n.label}
                </button>
              );
            })}
          </div>

          <div
            style={{ fontSize: "10px", color: "#71717a", textAlign: "center" }}
          >
            Click note to audition & set • Click Delete to remove
          </div>
        </div>
      )}
    </div>
  );
};

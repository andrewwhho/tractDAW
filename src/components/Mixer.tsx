import React from "react";
import { useDawStore } from "../store/useDawStore";

export const Mixer: React.FC = () => {
  const tracks = useDawStore((state) => state.tracks);
  const masterVolume = useDawStore((state) => state.masterVolume);
  const onMasterVolumeChange = useDawStore((state) => state.setMasterVolume);
  const onTrackVolumeChange = useDawStore((state) => state.setTrackVolume);
  const onToggleMute = useDawStore((state) => state.toggleMute);
  const onToggleSolo = useDawStore((state) => state.toggleSolo);
  return (
    <div
      style={{
        background: "#121215",
        border: "1px solid #27272a",
        borderRadius: "6px",
        padding: "16px",
        overflowX: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Mixer Console Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          borderBottom: "1px solid #27272a",
          paddingBottom: "8px",
        }}
      >
        <span
          style={{ fontSize: "13px", fontWeight: "bold", color: "#e4e4e7" }}
        >
          🎛️ TRACK MIXER CONSOLE
        </span>
        <span style={{ fontSize: "11px", color: "#71717a" }}>
          Volume Faders • Solo • Mute
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "stretch",
          minHeight: "210px",
        }}
      >
        {/* Master Bus Channel Strip (Far Left) */}
        <div
          style={{
            width: "84px",
            background: "#18181b",
            border: "2px solid #3b82f6",
            borderRadius: "6px",
            padding: "8px 6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {/* Channel Label */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#60a5fa",
                letterSpacing: "0.5px",
              }}
            >
              MASTER
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#71717a",
                marginTop: "2px",
              }}
            >
              MAIN BUS
            </div>
          </div>

          {/* Master Volume Fader */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              margin: "8px 0",
              height: "110px",
              justifyContent: "center",
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
                width: "24px",
                height: "90px",
                accentColor: "#3b82f6",
                cursor: "pointer",
              }}
              title="Master Volume Fader"
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#93c5fd",
                fontFamily: "monospace",
              }}
            >
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          <div
            style={{ fontSize: "9px", color: "#52525b", fontWeight: "bold" }}
          >
            OUTPUT
          </div>
        </div>

        {/* Vertical Divider */}
        <div
          style={{
            width: "1px",
            background: "#27272a",
            margin: "0 2px",
          }}
        />

        {/* Track Channel Strips (1 to 10) */}
        {tracks.map((track, idx) => {
          const isMelodic = track.type === "melodic";

          return (
            <div
              key={track.id}
              style={{
                width: "78px",
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "8px 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                opacity: track.isMuted ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {/* Channel Label */}
              <div style={{ textAlign: "center", width: "100%" }}>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#71717a",
                    fontWeight: "bold",
                  }}
                >
                  CH {idx + 1}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: isMelodic ? "#c084fc" : "#f4f4f5",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}
                  title={track.name}
                >
                  {track.name}
                </div>
              </div>

              {/* Vertical Volume Fader */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  margin: "6px 0",
                  height: "105px",
                  justifyContent: "center",
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) =>
                    onTrackVolumeChange(idx, parseFloat(e.target.value))
                  }
                  style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    width: "20px",
                    height: "85px",
                    accentColor: isMelodic ? "#8b5cf6" : "#22c55e",
                    cursor: "pointer",
                  }}
                  title={`${track.name} Volume Fader`}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#a1a1aa",
                    fontFamily: "monospace",
                  }}
                >
                  {Math.round(track.volume * 100)}%
                </span>
              </div>

              {/* Mute & Solo Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => onToggleMute(idx)}
                  style={{
                    flex: 1,
                    background: track.isMuted ? "#ef4444" : "#27272a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "4px 0",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  title="Mute Track"
                >
                  M
                </button>
                <button
                  onClick={() => onToggleSolo(idx)}
                  style={{
                    flex: 1,
                    background: track.isSoloed ? "#eab308" : "#27272a",
                    color: track.isSoloed ? "#000" : "#fff",
                    border: "none",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "4px 0",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  title="Solo Track"
                >
                  S
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

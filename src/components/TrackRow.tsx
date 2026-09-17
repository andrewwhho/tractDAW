import React from "react";
import { Track } from "../types";

export interface TrackRowProps {
  track: Track;
  currentStep: number;
  // SKELETON: Callbacks to be defined
}

/**
 * Individual track row: Title/sample name, Mute/Solo buttons, Volume/Pan, 16 step triggers.
 * UI/Logic implementation to follow in subsequent phase.
 */
export const TrackRow: React.FC<TrackRowProps> = () => {
  return (
    <div className="daw-track-row">
      {/* SKELETON: Track strip and 16-step buttons to be implemented */}
    </div>
  );
};

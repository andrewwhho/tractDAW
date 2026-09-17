import React from "react";
import { TransportBar } from "./TransportBar";
import { ChannelRack } from "./ChannelRack";
import { PianoRollModal } from "./PianoRollModal";
import { MixerDrawer } from "./MixerDrawer";
import "../styles/daw.css";

export interface TractDAWProps {
  // SKELETON: Props to be defined (e.g. isWindowOpen, onAudioInit)
}

/**
 * Root TractDAW Window Component.
 * Integrates directly inside the portfolio WindowPane.
 * UI/Logic implementation to follow in subsequent phase.
 */
export const TractDAW: React.FC<TractDAWProps> = () => {
  return (
    <div className="tract-daw-container">
      <TransportBar />
      <ChannelRack />
      <PianoRollModal trackId={null} onClose={() => {}} />
      <MixerDrawer isOpen={false} onClose={() => {}} />
    </div>
  );
};

export default TractDAW;

import React from "react";

export interface PianoRollModalProps {
  trackId: string | null;
  onClose: () => void;
}

/**
 * Piano Roll Modal / Drawer: 2-3 octaves (C3-B5) matrix for melodic one-shot tuning.
 * UI/Logic implementation to follow in subsequent phase.
 */
export const PianoRollModal: React.FC<PianoRollModalProps> = () => {
  return (
    <div className="daw-piano-roll-modal">
      {/* SKELETON: Piano key rows and 16-step pitch selectors to be implemented */}
    </div>
  );
};

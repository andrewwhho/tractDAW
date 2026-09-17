import React from "react";

export interface MixerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mixer / FX Drawer: 3-band EQ controls and Reverb send bus adjustments.
 * UI/Logic implementation to follow in subsequent phase.
 */
export const MixerDrawer: React.FC<MixerDrawerProps> = () => {
  return (
    <div className="daw-mixer-drawer">
      {/* SKELETON: 3-Band EQ and Reverb controls to be implemented */}
    </div>
  );
};

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
    <div className="bg-zinc-950/90 border border-zinc-800 rounded-md p-4 overflow-x-auto w-full box-border">
      {/* Mixer Console Header */}
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
        <span className="text-[13px] font-bold text-zinc-200">
          🎛️ TRACK MIXER CONSOLE
        </span>
        <span className="text-[11px] text-zinc-500 font-mono">
          Volume Faders • Solo • Mute
        </span>
      </div>

      <div className="flex gap-1.5 items-stretch min-h-[210px]">
        {/* Master Bus Channel Strip (Far Left) */}
        <div className="w-[84px] bg-zinc-900 border-2 border-blue-500 rounded-md p-2 px-1.5 flex flex-col items-center justify-between shrink-0">
          {/* Channel Label */}
          <div className="text-center w-full">
            <div className="text-[11px] font-bold text-blue-400 tracking-wider">
              MASTER
            </div>
            <div className="text-[9px] text-zinc-500 mt-0.5">MAIN BUS</div>
          </div>

          {/* Master Volume Fader */}
          <div className="flex flex-col items-center gap-1.5 my-2 h-[110px] justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="vertical-fader w-6 h-[90px] accent-blue-500 cursor-pointer"
              title="Master Volume Fader"
            />
            <span className="text-[10px] font-bold text-blue-300 font-mono">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          <div className="text-[9px] text-zinc-500 font-bold">OUTPUT</div>
        </div>

        {/* Slim dB Scale Ruler */}
        <div
          className="flex flex-col justify-between items-center h-[90px] text-[8px] text-zinc-500 font-mono font-bold self-center select-none px-0.5 shrink-0"
          title="Fader dB Scale"
        >
          <span className="text-red-500">+3</span>
          <span className="text-blue-400">0dB</span>
          <span>-3</span>
          <span>-6</span>
          <span>-12</span>
          <span>-18</span>
          <span>-24</span>
          <span>-∞</span>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] bg-zinc-800 mx-0.5" />

        {/* Track Channel Strips (Insert 1 to 10) */}
        {tracks.map((track, idx) => {
          const isMelodic = track.type === "melodic";

          return (
            <div
              key={track.id}
              className={`w-[82px] bg-zinc-900 border border-zinc-800 rounded-md p-2 px-1 flex flex-col items-center justify-between shrink-0 transition-opacity ${
                track.isMuted ? "opacity-50" : "opacity-100"
              }`}
            >
              {/* Channel Label */}
              <div className="text-center w-full">
                {/* FL Studio Green Glowing LED Mute Light */}
                <div
                  onClick={() => onToggleMute(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer mx-auto mb-1 transition-all ${
                    track.isMuted ? "led-mute-inactive" : "led-mute-active"
                  }`}
                  title={
                    track.isMuted
                      ? "Unmute Track (Click LED)"
                      : "Mute Track (Click LED)"
                  }
                />

                <div className="text-[9px] text-sky-400 font-bold tracking-wider">
                  INSERT {idx + 1}
                </div>
                <div
                  className={`text-[11px] font-bold truncate mt-0.5 ${
                    isMelodic ? "text-purple-400" : "text-zinc-100"
                  }`}
                  title={track.name}
                >
                  {track.name}
                </div>
              </div>

              {/* Vertical Volume Fader */}
              <div className="flex flex-col items-center gap-1.5 my-1.5 h-[105px] justify-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) =>
                    onTrackVolumeChange(idx, parseFloat(e.target.value))
                  }
                  className={`vertical-fader w-5 h-[85px] cursor-pointer ${
                    isMelodic ? "accent-purple-500" : "accent-emerald-500"
                  }`}
                  title={`${track.name} Volume Fader`}
                />
                <span className="text-[10px] font-bold text-zinc-400 font-mono">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>

              {/* Mute & Solo Buttons */}
              <div className="flex gap-1 w-full justify-center">
                <button
                  onClick={() => onToggleMute(idx)}
                  className={`flex-1 text-[10px] font-bold py-1 rounded cursor-pointer transition-colors ${
                    track.isMuted
                      ? "bg-red-500 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                  title="Mute Track"
                >
                  M
                </button>
                <button
                  onClick={() => onToggleSolo(idx)}
                  className={`flex-1 text-[10px] font-bold py-1 rounded cursor-pointer transition-colors ${
                    track.isSoloed
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
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
export default Mixer;

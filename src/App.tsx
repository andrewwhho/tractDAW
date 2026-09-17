import React from "react";
import { SampleLoader } from "./audio/SampleLoader";

export const App: React.FC = () => {
  const handleTestSample = async () => {
    // 1. Create the AudioContext (unlocked by user click)
    const audioCtx = new AudioContext();
    const sampleLoader = new SampleLoader(audioCtx);

    console.log("Fetching and decoding kick_1...");

    // 2. Await the async fetch & decode
    await sampleLoader.loadSample(
      "snare_5",
      "/audio/samples/drums/snares/[SAINT6] Chop Snare 2.wav",
    );

    // 3. HERE IS WHERE YOUR SNIPPET GOES:
    const buffer = sampleLoader.getBuffer("snare_5");

    if (buffer) {
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } else {
      console.error(`❌ Failed to load: snare_5 is undefined`);
    }
  };

  return (
    <main style={{ padding: "20px", background: "#080808", color: "#fff" }}>
      <h1>tractDAW</h1>
      <button
        onClick={handleTestSample}
        style={{
          padding: "8px 16px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          cursor: "pointer",
        }}
      >
        Test Load & Inspect Kick 1
      </button>
    </main>
  );
};

export default App;

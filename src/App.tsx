import React from 'react';
import { SampleLoader } from './audio/SampleLoader';

export const App: React.FC = () => {
  const handleTestSample = async () => {
    // 1. Create the AudioContext (unlocked by user click)
    const audioCtx = new AudioContext();
    const sampleLoader = new SampleLoader(audioCtx);

    console.log('Fetching and decoding kick_808...');

    // 2. Await the async fetch & decode
    await sampleLoader.loadSample('kick_1', '/audio/samples/drums/kicks/RS Kick 1.wav');

    // 3. HERE IS WHERE YOUR SNIPPET GOES:
    const buffer = sampleLoader.getBuffer('kick_1');

    if (buffer) {
      console.log(`✅ Loaded: kick_1`);
      console.log(`• Duration: ${buffer.duration.toFixed(2)}s`);
      console.log(`• Sample Rate: ${buffer.sampleRate} Hz`);
      console.log(`• Channels: ${buffer.numberOfChannels}`); // 1 = Mono, 2 = Stereo
      console.log(`• Total Samples: ${buffer.length}`);

      // Optional: Play it out loud to verify acoustic output
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } else {
      console.error(`❌ Failed to load: kick_808 is undefined`);
    }
  };

  return (
    <main style={{ padding: '20px', background: '#080808', color: '#fff' }}>
      <h1>tractDAW</h1>
      <button 
        onClick={handleTestSample}
        style={{ padding: '8px 16px', background: '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}
      >
        Test Load & Inspect kick_808
      </button>
    </main>
  );
};

export default App;
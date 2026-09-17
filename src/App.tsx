import React, { useState, useRef } from 'react';
import { SampleLoader } from './audio/SampleLoader';
import { SAMPLE_CATALOG, DEFAULT_KIT_SAMPLES } from './audio/SampleCatalog';

export const App: React.FC = () => {
  const [isBooted, setIsBooted] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const loaderRef = useRef<SampleLoader | null>(null);

  const addLog = (msg: string) => {
    console.log(msg);
    setLog((prev) => [msg, ...prev.slice(0, 9)]);
  };

  // 1. Test Boot: Tier 1 (Eager) + Tier 2 (Background Idle)
  const handleBoot = async () => {
    if (isBooted) return;
    const audioCtx = new AudioContext();
    const loader = new SampleLoader(audioCtx);
    loaderRef.current = loader;

    addLog('T1: Loading default kit samples...');
    await loader.loadAllDefaultSamples();
    setCachedCount(loader.getAllBuffers().size);
    setIsBooted(true);
    addLog(`T1 Complete: ${DEFAULT_KIT_SAMPLES.length} default sounds ready`);

    addLog('T2: Starting background preloader...');
    loader.loadRemainingInBackground();

    // Poll buffer count every second to watch background loading happen
    const interval = setInterval(() => {
      if (loaderRef.current) {
        const count = loaderRef.current.getAllBuffers().size;
        setCachedCount(count);
        if (count >= SAMPLE_CATALOG.length) {
          addLog(`T2: All ${count} samples cached in RAM`);
          clearInterval(interval);
        }
      }
    }, 800);
  };

  // 2. Test Auditioning (Instant One-Shot Preview)
  const handleAudition = async (id: string) => {
    if (!loaderRef.current) {
      addLog('Click "Boot Engine" first to unlock Web Audio');
      return;
    }
    addLog(`Previewing: ${id}`);
    await loaderRef.current.auditionSample(id);
    setCachedCount(loaderRef.current.getAllBuffers().size);
  };

  // 3. Test Algorithmic Fallback
  const handleTestFallback = async () => {
    if (!loaderRef.current) return;
    addLog('🧪 Testing fallback with non-existent file...');
    await loaderRef.current.loadSample('broken_sample', '/audio/samples/drums/kicks/does_not_exist.wav');
    loaderRef.current.auditionSample('broken_sample');
    setCachedCount(loaderRef.current.getAllBuffers().size);
  };

  return (
    <main style={{ padding: '24px', background: '#0c0c0c', color: '#fff', fontFamily: 'monospace', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #222', paddingBottom: '12px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>tractDAW — Phase 1 Test Lab</h1>
        <p style={{ margin: '6px 0 0', color: '#888' }}>
          Memory Cache: <strong style={{ color: '#3b82f6' }}>{cachedCount}</strong> / {SAMPLE_CATALOG.length} sounds in RAM
        </p>
      </header>

      {/* Control Buttons */}
      <section style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={handleBoot}
          disabled={isBooted}
          style={{
            padding: '10px 20px',
            background: isBooted ? '#1e293b' : '#2563eb',
            color: isBooted ? '#64748b' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isBooted ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isBooted ? '✓ Engine Running' : '1. Boot Engine (Tier 1 + 2)'}
        </button>

        <button
          onClick={handleTestFallback}
          disabled={!isBooted}
          style={{
            padding: '10px 16px',
            background: '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isBooted ? 'pointer' : 'not-allowed',
          }}
        >
          2. Test 404 Fallback Sound
        </button>
      </section>

      {/* Audition Library Grid */}
      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Test Audition Library (Click to hear):
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginTop: '10px' }}>
          {SAMPLE_CATALOG.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAudition(s.id)}
              disabled={!isBooted}
              style={{
                padding: '8px 12px',
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#e4e4e7',
                borderRadius: '4px',
                textAlign: 'left',
                cursor: isBooted ? 'pointer' : 'not-allowed',
                fontSize: '12px',
              }}
            >
              ▶ {s.name}
            </button>
          ))}
        </div>
      </section>

      {/* Activity Console Log */}
      <section style={{ background: '#111', padding: '12px', borderRadius: '4px', border: '1px solid #222' }}>
        <h4 style={{ margin: '0 0 8px', color: '#666', fontSize: '12px' }}>LIVE LOGS:</h4>
        {log.map((entry, idx) => (
          <div key={idx} style={{ fontSize: '12px', color: entry.startsWith('✅') ? '#4ade80' : entry.startsWith('🎉') ? '#60a5fa' : '#ccc' }}>
            {entry}
          </div>
        ))}
      </section>
    </main>
  );
};

export default App;
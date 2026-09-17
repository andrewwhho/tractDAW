import React from "react";

export const App: React.FC = () => {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <header style={{ fontSize: "20px", fontWeight: "bold" }}>tractDAW</header>
      <p style={{ color: "#888", marginTop: "8px" }}>
        Phase 1: Audio Sample Loader
      </p>
    </main>
  );
};

export default App;

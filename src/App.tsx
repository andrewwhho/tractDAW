import React from "react";
import { TractDAW } from "./components/TractDAW";

export const App: React.FC = () => {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        padding: "20px",
      }}
    >
      <header>tractDAW</header>
      <TractDAW />
    </main>
  );
};

export default App;

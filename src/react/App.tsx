import React, { useState } from 'react';
import CameraFeed from './CameraFeed';
import { initAudio } from "../music";

import { KeySelector, KeyConfig } from "./KeyControls";

export default function App() {

  const [keyConfig, setKeyConfig] = useState<KeyConfig>({
    key: "C",
    scaleType: "major",
  });

    const start = async () => {
      try {
        await initAudio();
      } catch (e) {
        console.error("Error starting audio", e);
      };
    };
  
  return (
    <div>
      <h1>Aurea </h1>
      <button onClick={start}>Start</button>
      <div style={{ marginTop: "1rem" }}>
        <KeySelector value={keyConfig} onChange={setKeyConfig} />
      </div>
      <CameraFeed keyConfig={keyConfig}/>
    </div>
  );
}

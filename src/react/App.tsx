import React, { useState } from 'react';
import CameraFeed from './CameraFeed';
import { initAudio } from "../music";

import { KeySelector, KeyConfig } from "./KeyControls";



export default function App() {

  const [keyConfig, setKeyConfig] = useState<KeyConfig>({
    key: "C",
    scaleType: "major",
  });



    const scrollToCamera = () => {
      const cameraSection = document.getElementById("camera-section");
      if (cameraSection) {
        cameraSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    const handleStart = () => {
      initAudio().catch(e => console.error("Error starting audio", e));
      scrollToCamera();
    };
  


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Logo with dots */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <div className="w-4 h-4 rounded-full bg-secondary" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-8xl sm:text-9xl font-bold tracking-tight text-foreground">
            AUREA
          </h1>

          {/* Try It Out Button */}
          <button 
            onClick={handleStart}
            className="mt-8 px-12 py-6 text-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            try it out
          </button>
        </div>
      </section>

      {/* Camera Section */}
      <section
        id="camera-section"
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 space-y-12"
      >
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-center text-foreground mb-8">
            Choose your key
          </h2>

          {/* Key Selectors */}
          <KeySelector value={keyConfig} onChange={setKeyConfig} />

          {/* Camera Feed */}
          <div className="mt-12">
            <CameraFeed keyConfig={keyConfig} />
          </div>
        </div>
      </section>
    </div>
  );
}

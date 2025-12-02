import React, { useState } from 'react';
import CameraFeed from './CameraFeed';
import { initAudio } from "../music";

import { KeySelector, KeyConfig } from "./KeyControls";

import BlurText from "./components/blurtext";

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
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      
          <h1 className="shrink-0 text-9xl text-[#C23643] sm:text-9xl font-bold tracking-tight text-foreground">
          <BlurText
        text="AUREA"
        animateBy="letters"
        direction="top"
        className="text-9xl sm:text-9xl text-[#C23643] font-bold tracking-tight"
        />
          </h1>
          <button 
            onClick={handleStart}
            className="
            mt-8 px-8 py-5 text-3xl
            font-semibold 
            bg-transparent border-5 border-[#C23643] text-[#C23643]
            
            rounded-full transition-all duration-250
            hover:bg-[#C23643] hover:text-white
            hover:scale-103 "
          >
            try it out
          </button>

      </section>


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


      <footer className="px-4 py-8 bg-black text-white">
	<div className= "container flex flex-wrap items-center justify-center mx-auto space-y-4 sm:justify-between sm:space-y-0">
		<div className="flex flex-row pr-3 space-x-4 sm:space-x-8">
			
			</div>
			<ul className=" flex flex-wrap items-center space-x-4 sm:space-x-8">
				<li>
					<a rel="Github Link" href="https://github.com/scottylabs-labrador/Aurea">Github</a>
				</li>
				<li>
					<a rel="Osprey Link" href="https://osprey.velroi.com/forum/project/68fd383013f6bb5081638fbd">Osprey</a>
				</li>
			</ul>
		</div>

</footer>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import CameraFeed from './CameraFeed';
import { initAudio } from "../music";

import { KeySelector, KeyConfig } from "./KeyControls";

import BlurText from "./components/blurtext";
import Footer from './components/footer';


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

    const scrollToHome = () => {
      const cameraSection = document.getElementById("home");
      if (cameraSection) {
        cameraSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    const handleStart = () => {
      initAudio().catch(e => console.error("Error starting audio", e));
      scrollToCamera();
    };
  
    const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="min-h-screen">

      <nav className={`
      z-2 fixed w-full top-0 
      bg-black transition-all duration-300
      ${scrolled ? "opacity-0 -translate-y-4 hover:opacity-100 hover:translate-y-0" : "opacity-100 translate-y-0"}
      `}>
      <div className="text-lg container flex items-center justify-center p-3  mx-auto text-gray-500">
        <button onClick = {scrollToHome} className="text-gray-200  hover:text-white mx-1.5 sm:mx-6">home</button>

        <a href="#" className=" hover:text-white mx-1.5 sm:mx-6">how to</a>

        <a href="#" className=" hover:text-white mx-1.5 sm:mx-6">about</a>


      </div>
      </nav>
  
      <section id = "home" className="min-h-screen flex flex-col items-center justify-center px-10 py-14">
      
          <h1 className="shrink-0 text-5xl text-[#C23643] sm:text-9xl font-bold tracking-tight text-foreground">
          <BlurText
        text="AUREA"
        animateBy="letters"
        direction="top"
        className=" text-[#C23643] font-bold tracking-tight"
        />
          </h1>
          <h3 className = "mt-2 text-3xl text-[#C23643] font-semibold"> music creation at your fingertips </h3>
          <button 
            onClick={handleStart}
            className="
            mt-8 px-6 py-3 text-3xl
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
          <h2 className="text-[#10489F] text-4xl font-bold text-center text-foreground mb-8">
            choose your key
          </h2>

          {/* Key Selectors */}
          <KeySelector value={keyConfig} onChange={setKeyConfig} />

          {/* Camera Feed */}
          <div className="mt-12">
            <CameraFeed keyConfig={keyConfig} />
          </div>
        </div>
      </section>

      <div> <Footer/> </div>

    </div>
  );
}

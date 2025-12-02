import React, { useState, useEffect } from 'react';
import CameraFeed from './CameraFeed';
import { initAudio } from "../music";

import { KeySelector, KeyConfig } from "./KeyControls";

import BlurText from "./components/blurtext";
import Footer from './components/footer';
import HowTo from "./components/HowTo";

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

    const scrollToHow = () => {
      const cameraSection = document.getElementById("howto");
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
      <div className=" text-lg container flex items-center justify-center p-3  mx-auto text-[#10489F]">
        <button onClick = {scrollToHome} className="text-gray-200  hover:text-white mx-1.5 sm:mx-6 duration-150 ease-in-out">home</button>

        <button onClick = {scrollToHow} className=" hover:text-white mx-1.5 sm:mx-6 duration-150 ease-in-out">how to</button>

        <a href="#" className=" hover:text-white mx-1.5 sm:mx-6 duration-150 ease-in-out">about</a>


      </div>
      </nav>
  
      <section id = "home" className="min-h-screen flex flex-col items-center justify-center px-10 py-10">
      
          <h1 className=" text-[10rem] text-[#C23643]  font-bold tracking-tight text-foreground">
          <BlurText
        text="AUREA"
        animateBy="letters"
        direction="top"
        className=" text-[#C23643] font-bold tracking-tight"
        />
          </h1>
          <h3 className = "text-3xl -mt-10 text-[#C23643] font-semibold"> 
          <BlurText
        text="music creation at your fingertips"
        animateBy="words"
        direction="top"
        /> </h3>
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

      <section id = "howto" className = "hover:scale-102 duration-300 ease-in-out">
      <div className="flex justify-center bg-[#10489F] mx-24 mb-12 bg-card rounded-2xl pt-8 shadow-xl">
      <div className="rounded-xl flex items-center justify-center">
        <HowTo/>
      </div> </div>
      </section>

      <section
        id="camera-section"
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 space-y-12"
      >
        <div className="w-full max-w-4xl space-y-8">
          <h2 className="text-[#C23643] text-4xl font-bold text-center text-foreground mb-8">
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

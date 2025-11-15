import React from 'react';
import CameraFeed from './CameraFeed';
import * as Tone from "tone";
import { initAudio } from "../music";

export default function App() {
    const start = async () => {
      try {
        await initAudio();
      } catch (e) {
        console.error("Error starting audio", e);
      }
    };
  
  return (
    <div>
      <h1>Aurea </h1>
      <button onClick={start}>Start</button>
      <CameraFeed />
    </div>
  );
}

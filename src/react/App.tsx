import React from 'react';
import CameraFeed from './CameraFeed';
import * as Tone from "tone";

export default function App() {
    const start = async () => {
        await Tone.start();
        console.log("started")
        //create a synth and connect it to the main output (your speakers)
        const synth = new Tone.Synth().toDestination();

        //play a middle 'C' for the duration of an 8th note
        synth.triggerAttackRelease("C4", "8n");
    }
  return (
    <div>
      <h1>Aurea </h1>
      <button onClick={start}>Start</button>
      <CameraFeed />
    </div>
  );
}

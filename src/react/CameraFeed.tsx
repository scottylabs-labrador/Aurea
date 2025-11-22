// src/react/CameraFeed.tsx
import React, { useRef, useEffect } from "react";
import { handDrawAndUpdate } from "../renderer";

import { predictHand, createHandLandmarker } from "../landmarker";

import { drawLineRight } from "./CanvasDraw"
import { handleRight } from "./Right"

export default function CameraFeed() {
  const [leftNumber, setLeftNumber] = React.useState<number | null>(null);
  const [leftChord, setLeftChord] = React.useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function handleAureaLeftDetect(e: Event) {
      const ev = e as CustomEvent<{ number: number; chord: string | null }>;
      if (ev && ev.detail) {
        setLeftNumber(ev.detail.number ?? null);
        setLeftChord(ev.detail.chord ?? null);
      }
    }

    window.addEventListener("aurea-left-detect", handleAureaLeftDetect as EventListener);
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const landmarker = await createHandLandmarker();

      function loop() {
        if (videoRef.current && canvasRef.current && statusRef.current) {
          const results = predictHand(landmarker, videoRef.current);
          handDrawAndUpdate(results, videoRef.current, canvasRef.current, statusRef.current);
          // drawLineRight(canvasRef.current);
        } 
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }

    startCamera();

    return () => {
      window.removeEventListener("aurea-left-detect", handleAureaLeftDetect as EventListener);
    };
  }, []);

//  useEffect(() => {
//    async function handleRightHand() {
//          const landmarker = await createHandLandmarker();
//        function loop() {
//            handleRight(predictHand(landmarker, videoRef));
//            requestAnimationFrame(loop);
//        }
//        requestAnimationFrame(loop);
//    }
//
//    handleRightHand();
//  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* ui for left-hand detection and chord */}
      <div style={{
        position: 'absolute',
        top: 6,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: 8,
        fontWeight: 'bold',
      }}>
        Left: {leftNumber ?? '—'} &nbsp; • &nbsp; {leftChord ?? '—'}
      </div>
      <video
        ref={videoRef}
        id="webcam"
        style={{ transform: "scaleX(-1)", width: "640px", height: "480px" }}
      />
      <canvas
        ref={canvasRef}
        id="output_canvas"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "640px",
          height: "480px",
          transform: "scaleX(-1)",
        }}
      />
      <canvas
        ref={statusRef}
        id="status_canvas"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "640px",
          height: "480px",
        }}
      />
    </div>
  );
}

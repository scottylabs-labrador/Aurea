// src/react/CameraFeed.tsx
import React, { useRef, useEffect } from "react";
import { createHandLandmarker, predictHand } from "../landmarker";
import { handDrawAndUpdate } from "../renderer";

import { drawLineRight } from "./CanvasDraw"
import { handleRight } from "./Right"

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import type { KeyConfig } from "./react/KeyControls";
import { maybePlayNoteFromX } from "./music";

import { fingerIsBent, fingers, createHandLandmarker, predictHand, extractHandStates, FingerStates } from "./landmarker"
import { assert } from "tone/build/esm/core/util/Debug";

/** Run prediction on a video frame */
export async function handDrawAndUpdate(
  results: HandLandmarkerResult,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  status: HTMLCanvasElement,
  keyConfig: KeyConfig   
) {

  const canvasCtx = canvas.getContext("2d");
  if (canvasCtx == null) return;

  const statusCtx = status.getContext("2d");
  if (statusCtx == null) return;

  // Ensure correct canvas ratio
  const ratio = video.videoWidth / video.videoHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth / ratio;

  status.width = window.innerWidth;
  status.height = window.innerWidth / ratio;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.fillStyle = "rgba(255,255,255,0.55)";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  statusCtx.save();
  statusCtx.clearRect(0, 0, canvas.width, canvas.height);
  statusCtx.fillStyle = "rgba(255,255,255,0.55)";
  statusCtx.fillRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks) {
    const util = new DrawingUtils(canvasCtx);

    const handStates = extractHandStates(results);

    for (let i = 0; i < handStates.length; i++) {
      if (handStates[i] == undefined) continue;

      const landmarks = results.landmarks[i];
      util.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      util.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });

      const fingerStates = handStates[i].getFingerStates();

      let handStateString: string[] = [
        `thumb: ${fingerStates[0] == FingerStates.CLOSED ? "bent" : "none"}\t`,
        `index: ${fingerStates[1] == FingerStates.CLOSED ? "bent" : "none"}\t`,
        `middle: ${fingerStates[2] == FingerStates.CLOSED ? "bent" : "none"}\t`,
        `ring: ${fingerStates[3]== FingerStates.CLOSED ? "bent" : "none"}\t`,
        `pinky: ${fingerStates[4] == FingerStates.CLOSED ? "bent" : "none"}\t`,
      ];

      statusCtx.fillStyle = "#000000";
      statusCtx.font = "bold 24px monospace";
      for (const [index, str] of handStateString.entries())
        statusCtx.fillText(str, 520 - 500 * results.handedness[i][0].index, 50 + 30 * index);

      if (results.handedness[i][0].categoryName == 'Left'){
        const right_point = (results.landmarks[i][17]) //point 17, pinky base
        const pixel_dist_x = (right_point.x).toFixed(1)
        const pixel_dist_y = (right_point.y).toFixed(1)
        
        const dist_text = `Right-hand x, y dist: (${pixel_dist_x}, ${pixel_dist_y}) px`;
      
    // Draw it on camera (choose any position you like)
      statusCtx.fillStyle = "#FF0000";
      statusCtx.fillText(dist_text, 20, 40);

      //play note:
        maybePlayNoteFromX(Math.floor(right_point.x), keyConfig.key, keyConfig.scaleType, "8n"); //replace this later

      }
      
    }

  }
  canvasCtx.restore();
  statusCtx.restore();
}

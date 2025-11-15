// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { fingers, fingerIsBent } from "./sign";

/** Initialize the hand landmarker model */
export async function createHandLandmarker() {

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  return await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

function predictHand(landmarker: HandLandmarker, video: HTMLVideoElement): HandLandmarkerResult {
  const startTimeMs = performance.now();
  return landmarker.detectForVideo(
    video,
    startTimeMs
  );
}

/** Run prediction on a video frame */
export async function predictHandDrawAndUpdate(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  status: HTMLCanvasElement
) {

  const canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) return;

  const statusCtx = status.getContext("2d");
  if (!statusCtx) return;

  // Ensure correct canvas ratio
  const ratio = video.videoWidth / video.videoHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth / ratio;

  status.width = window.innerWidth;
  status.height = window.innerWidth / ratio;

  const results = predictHand(landmarker, video);

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

    for (let i = 0; i < results.landmarks.length; i++) {
      const landmarks = results.landmarks[i];
      util.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      util.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });

      const threshold = 0.4;
      const thresholdThumb = 0.6;

      const thumbBent = fingerIsBent(
        fingers.wrist,
        fingers.thumb,
        landmarks,
        thresholdThumb
      );
      const indexBent = fingerIsBent(
        fingers.wrist,
        fingers.index,
        landmarks,
        threshold
      );
      const middleBent = fingerIsBent(
        fingers.wrist,
        fingers.middle,
        landmarks,
        threshold
      );
      const ringBent = fingerIsBent(
        fingers.wrist,
        fingers.ring,
        landmarks,
        threshold
      );
      const pinkyBent = fingerIsBent(
        fingers.wrist,
        fingers.pinky,
        landmarks,
        threshold
      );

      let handStateString: string[] = [
        `thumb: ${thumbBent ? "bent" : "none"}\t`,
        `index: ${indexBent ? "bent" : "none"}\t`,
        `middle: ${middleBent ? "bent" : "none"}\t`,
        `ring: ${ringBent ? "bent" : "none"}\t`,
        `pinky: ${pinkyBent ? "bent" : "none"}\t`,
      ];

      statusCtx.fillStyle = "#000000";
      statusCtx.font = "bold 24px monospace";
      for (const [index, str] of handStateString.entries())
        statusCtx.fillText(str, 520 - 500 * results.handedness[i][0].index, 50 + 30 * index);

      if (results.handedness[i][0].categoryName == 'Left'){
        const right_point = (results.landmarks[i][17]) //point 17, pinky base
        const pixel_dist_x = (right_point.x).toFixed(1)
        const pixel_dist_y = (right_point.y).toFixed(1)
        console.log(right_point, video.width)
        const dist_text = `Right-hand x, y dist: (${pixel_dist_x}, ${pixel_dist_y}) px`;

    // Draw it on camera (choose any position you like)
      statusCtx.fillStyle = "#FF0000";
      statusCtx.fillText(dist_text, 20, 40);
      }
    }

  }
  canvasCtx.restore();
  statusCtx.restore();
}

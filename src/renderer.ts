// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "IMAGE";

/** Initialize the hand landmarker model */
export async function createHandLandmarker() {
  if (handLandmarker) return handLandmarker; // already created

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode,
    numHands: 2,
  });

  return handLandmarker;
}

/** Run prediction on a video frame */
export async function predictHand(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  if (!handLandmarker) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Ensure correct canvas ratio
  const ratio = video.videoWidth / video.videoHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth / ratio;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await handLandmarker.setOptions({ runningMode });
  }

  const startTimeMs = performance.now();
  const results: HandLandmarkerResult = handLandmarker.detectForVideo(video, startTimeMs);

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks) {
    const util = new DrawingUtils(ctx);

    for (let i = 0; i < results.landmarks.length; i++) {
      const landmarks = results.landmarks[i];
      util.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      util.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
    }
  }
  ctx.restore();
}

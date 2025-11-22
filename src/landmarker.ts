// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { Vector } from "./vector"

export const fingers = {
  wrist: 0,
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
}

class HandsState {
  hasLeft: boolean;
  hasRight: boolean;
  left: Vector[];
  right: Vector[];
}

/** Initialize the hand landmarker model */
export async function createHandLandmarker(): Promise<HandLandmarker> {

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

export function predictHand(landmarker: HandLandmarker, video: HTMLVideoElement): HandLandmarkerResult {
  const startTimeMs = performance.now();
  return landmarker.detectForVideo(
    video,
    startTimeMs
  );
}


// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

import { Vector } from "./vector"

function toVector(landmark: NormalizedLandmark): Vector {
  return new Vector(landmark.x, landmark.y, landmark.z);
}

export function fingerIsBent(wristID: number, jointsID: number[], nodes: Vector[], threshold: number) {
  const wrist: Vector = nodes[wristID];
  const node1: Vector = nodes[jointsID[0]];
  const node2: Vector = nodes[jointsID[1]];
  const node3: Vector = nodes[jointsID[3]];

  const d1: Vector = node1.sub(wrist);
  const d2: Vector = node3.sub(node2);

  const cosine: number = d1.dot(d2) / (d1.norm() * d2.norm());

  return cosine < threshold;
}


const fingers = {
  wrist: 0,
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
}

export enum FingerStates { ANY, OPEN, CLOSED }

class HandState {
  #state: Vector[];
  #fingerStates: FingerStates[] = [];

  constructor(state: Vector[]) {
    this.#state = state;

    const thresholds = [0.6, 0.4, 0.4, 0.4, 0.4];

    this.#fingerStates.push(fingerIsBent(fingers.wrist, fingers.thumb, this.#state, thresholds[0])? FingerStates.CLOSED : FingerStates.OPEN);
    this.#fingerStates.push(fingerIsBent(fingers.wrist, fingers.index, this.#state, thresholds[1])? FingerStates.CLOSED : FingerStates.OPEN);
    this.#fingerStates.push(fingerIsBent(fingers.wrist, fingers.middle, this.#state, thresholds[2])? FingerStates.CLOSED : FingerStates.OPEN);
    this.#fingerStates.push(fingerIsBent(fingers.wrist, fingers.ring, this.#state, thresholds[3])? FingerStates.CLOSED : FingerStates.OPEN);
    this.#fingerStates.push(fingerIsBent(fingers.wrist, fingers.pinky, this.#state, thresholds[4])? FingerStates.CLOSED : FingerStates.OPEN);
  }

  matchesFingers(pattern: FingerStates[]): boolean {
    for (let i = 0; i < 5; i++) {
      if (pattern[i] == FingerStates.ANY) continue;
      if (pattern[i] == this.#fingerStates[i]) continue;
      return false;
    }

    return true;
  }

  getStates(): Vector[] {
    return Object.create(this.#state);
  }

  getFingerStates(): FingerStates[] {
    return Object.create(this.#fingerStates);
  }
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

/**
 * 
 * @param result landmarker result from mediapipe
 * @returns [left hand state, right hand state]
 */
export function extractHandStates(result: HandLandmarkerResult): [HandState?, HandState?] {
  // console.log(result);
  let hands_state: [HandState?, HandState?] = [undefined, undefined];
  for (let i = 0; i < result.handedness.length; i++) {
    let index = 0;
    if (result.handedness[i][0].index == 0)
      index = 1;

    const state = result.landmarks[i].map((value) => toVector(value));

    hands_state[index] = new HandState(state);
  }
  return hands_state;
}
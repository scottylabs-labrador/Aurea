import {
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

import { Vector } from "./vector"

function toVector(landmark: NormalizedLandmark): Vector {
  return new Vector(landmark.x, landmark.y, landmark.z);
}

export function fingerIsBents(wristID: number, jointsID: number[], landmarks: NormalizedLandmark[], threshold: number) {
  const wrist: Vector = toVector(landmarks[wristID]);
  const node1: Vector = toVector(landmarks[jointsID[0]]);
  const node2: Vector = toVector(landmarks[jointsID[1]]);
  const node3: Vector = toVector(landmarks[jointsID[3]]);

  const d1: Vector = node1.sub(wrist);
  const d2: Vector = node3.sub(node2);

  const cosine: number = d1.dot(d2) / (d1.norm() * d2.norm());

  return cosine < threshold;
}

/*
 detect left hand number
 
 Simple mapping:
  - 0 = fist (none extended)
  - 1 = index only
  - 2 = index + middle
  - 3 = index + middle + ring
  - 4 = index + middle + ring + pinky (thumb folded)
  - 5 = all fingers extended
 Returns each finger status, count and number.
 */
export function detectNumberFromLandmarks(landmarks: NormalizedLandmark[]) {
  if (!landmarks || landmarks.length < 21) return null;

  const thumbBent = fingerIsBents(0, [1, 2, 3, 4], landmarks, 0.6);
  const indexBent = fingerIsBents(0, [5, 6, 7, 8], landmarks, 0.7);
  const middleBent = fingerIsBents(0, [9, 10, 11, 12], landmarks, 0.7);
  const ringBent = fingerIsBents(0, [13, 14, 15, 16], landmarks, 0.7);
  const pinkyBent = fingerIsBents(0, [17, 18, 19, 20], landmarks, 0.7);

  const thumbExtended = !thumbBent;
  const indexExtended = !indexBent;
  const middleExtended = !middleBent;
  const ringExtended = !ringBent;
  const pinkyExtended = !pinkyBent;

  const extendedArray = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended];
  const count = extendedArray.filter(Boolean).length;

  let number: number | null = null;
  //mapping for numbers
  if (count === 0) number = 0;
  else if (count === 1 && indexExtended && !thumbExtended) number = 1;
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) number = 2;
  else if (indexExtended && middleExtended && ringExtended && !pinkyExtended) number = 3;
  else if (!thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) number = 4;
  else if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) number = 5;
  else number = count;

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
    count,
    number,
  };
}



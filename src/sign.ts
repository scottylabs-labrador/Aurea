import {
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

import { Vector } from "./vector"

function toVector(landmark: NormalizedLandmark): Vector {
  return new Vector(landmark.x, landmark.y, landmark.z);
}

export function fingerIsBent(wristID: number, jointsID: number[], landmarks: NormalizedLandmark[], threshold: number) {
  const wrist: Vector = toVector(landmarks[wristID]);
  const node1: Vector = toVector(landmarks[jointsID[0]]);
  const node2: Vector = toVector(landmarks[jointsID[1]]);
  const node3: Vector = toVector(landmarks[jointsID[3]]);

  const d1: Vector = node1.sub(wrist);
  const d2: Vector = node3.sub(node2);

  const cosine: number = d1.dot(d2) / (d1.norm() * d2.norm());

  return cosine < threshold;
}



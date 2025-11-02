import {
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

class Vector {
    x: number;
    y: number;
    z: number;
    constructor (x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    getZ(): number {
        return this.z;
    }

    sub(v2: Vector): Vector {
        const x2 = v2.getX();
        const y2 = v2.getY();
        const z2 = v2.getZ();

        return new Vector(this.x - x2, this.y - y2, this.z - z2);
    }

    dot(v2: Vector): number {
        const x2 = v2.getX();
        const y2 = v2.getY();
        const z2 = v2.getZ();

        return this.x * x2 + this.y * y2 + this.z * z2;
    }

    norm(): number {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }
}


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

export const fingers = {
    wrist: 0,
    thumb: [1, 2, 3, 4],
    index: [5, 6, 7, 8],
    middle: [9, 10, 11, 12],
    ring: [13, 14, 15, 16],
    pinky: [17, 18, 19, 20],
}
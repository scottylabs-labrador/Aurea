import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker;
let runningMode = "IMAGE";

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numHands: 2,
  });
};

const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
  "output_canvas"
) as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d");

function enableCam() {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results: HandLandmarkerResult;

async function predictWebcam() {
  const ratio = video.videoWidth / video.videoHeight;
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerWidth / ratio;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await handLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  const startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = handLandmarker.detectForVideo(video, startTimeMs);
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.fillStyle = "rgba(255, 255, 255, 0.55)";
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.landmarks) {
    const util = new DrawingUtils(canvasCtx);
    const n = results.handedness.length;
    for (let i = 0; i < n; i++) {
      const landmarks = results.landmarks[i];
      console.log(results.handedness[i][0].index);
      console.log(results.handedness[i][0].categoryName);

      util.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });

      util.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });

      let positions: HTMLElement;
      if (results.handedness[i][0].index == 0) {
        positions = document.getElementById("positionsR");
      } else {
        positions = document.getElementById("positionsL");
      }
      const distance_1 = Math.sqrt(
        (landmarks[12].x - landmarks[4].x) ** 2 +
          (landmarks[12].y - landmarks[4].y) ** 2
      );
      const distance_ref = Math.sqrt(
        (landmarks[0].x - landmarks[5].x) ** 2 +
          (landmarks[0].y - landmarks[5].y) ** 2
      );
      const d1_rel = distance_1 / distance_ref;
      positions.innerHTML = `${distance_1.toFixed(3)} ${distance_ref.toFixed(3)} ${(distance_1 / distance_ref).toFixed(3)}`;
      if (d1_rel < 0.3) {
        positions.style.backgroundColor = "#ffc0c0";
        canvasCtx.fillStyle = "rgba(255,0,0,0.5)";
        const x = (landmarks[12].x + landmarks[4].x) / 2;
        const y = (landmarks[12].y + landmarks[4].y) / 2;
        canvasCtx.fillRect(
          x * canvasElement.width - 50,
          y * canvasElement.height - 50,
          100,
          100
        );
      } else {
        positions.style.backgroundColor = "#ffffff";
      }
    }
  }
  canvasCtx.restore();

  window.requestAnimationFrame(predictWebcam);
}

document.onreadystatechange = async () => {
  if (document.readyState === "complete") {
    await createHandLandmarker();
    enableCam();
  }
};

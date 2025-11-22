// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { fingerIsBent, detectNumberFromLandmarks } from "./left_number";
import type { KeyConfig } from "./react/KeyControls";

import { maybePlayNoteFromX, playNoteForNumber, startSustainedChord, stopSustainedChord } from "./music";

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

  //mirror video if needed
  const videoTransform = video?.style?.transform ?? "";
  const isMirrored = videoTransform.includes("scaleX(-1)");

  if (results.landmarks) {
    // smoothing for chord changes
    const LEFT_BUFFER_SIZE = 6;
    const LEFT_CHANGE_THRESHOLD = Math.ceil(LEFT_BUFFER_SIZE * 0.66);
    const win = window as any;
    if (!Array.isArray(win.__aurea_leftBuffer)) win.__aurea_leftBuffer = [] as (number | null)[];
    if (typeof win.__aurea_lastConfirmedLeftNumber === 'undefined') win.__aurea_lastConfirmedLeftNumber = null as number | null;

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

      //determine which hand
      const cameraHanded = results.handedness[i][0].categoryName;
      const isUiLeft = isMirrored ? cameraHanded === 'Right' : cameraHanded === 'Left';

      if (isUiLeft) {
        //left hand: detect number and play note
        const detected = detectNumberFromLandmarks(landmarks);
        if (detected) {
          const numText = `Left-hand (UI) number: ${detected.number}`;
          statusCtx.fillStyle = "#FF0000";
          statusCtx.fillText(numText, 20, 40);

          // buffer
          win.__aurea_leftBuffer.push(detected.number);
          if (win.__aurea_leftBuffer.length > LEFT_BUFFER_SIZE) win.__aurea_leftBuffer.shift();

          // mode and count
          const counts: Record<string, number> = {};
          for (const v of win.__aurea_leftBuffer) {
            const key = String(v);
            counts[key] = (counts[key] || 0) + 1;
          }
          let modeVal: number | null = null;
          let modeCount = 0;
          for (const k of Object.keys(counts)) {
            if (counts[k] > modeCount) {
              modeCount = counts[k];
              modeVal = k === 'null' ? null : Number(k);
            }
          }

          // only get number if its stable (buffer)
          const prevConfirmed = win.__aurea_lastConfirmedLeftNumber as number | null;
          if (modeCount >= LEFT_CHANGE_THRESHOLD && modeVal !== prevConfirmed) {
            // change confirmed value
            // stop old chord
            if (typeof prevConfirmed === 'number' && prevConfirmed > 0) stopSustainedChord(prevConfirmed);

            win.__aurea_lastConfirmedLeftNumber = modeVal;

            if (typeof modeVal === 'number' && modeVal > 0) {
              // start new sustained chord
              const chordName = startSustainedChord(modeVal);
              try {
                window.dispatchEvent(new CustomEvent('aurea-left-detect', { detail: { number: modeVal, chord: chordName } }));
              } catch (e) {}
            } else {
              stopSustainedChord();
              try {
                window.dispatchEvent(new CustomEvent('aurea-left-detect', { detail: { number: modeVal, chord: null } }));
              } catch (e) {}
            }
          }
        }
      }
      
    }

  }
  canvasCtx.restore();
  statusCtx.restore();
}

// src/model/handLandmarker.ts
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { fingerIsBents, detectNumberFromLandmarks } from "./left_number";
import type { KeyConfig } from "./react/KeyControls";

import { maybePlayNoteFromX, playNoteForNumber, startSustainedChord, stopSustainedChord, xToNote } from "./music";

import { extractHandStates, FingerStates } from "./landmarker"

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
    
    // Track if left hand is present in this frame
    let leftHandPresent = false;
    let rightHandPresent = false;

    for (let i = 0; i < results.landmarks.length; i++) {
      if (!results.landmarks[i] || !results.handedness[i] || !results.handedness[i][0]) continue;

      const landmarks = results.landmarks[i];
      util.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      util.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });

      //determine which hand
      const cameraHanded = results.handedness[i][0].categoryName;
      // MediaPipe reports hands from user's perspective, but when camera is mirrored, we need to flip
      const isUiLeft = cameraHanded === 'Right';

      // Debug: show which hand is detected
      statusCtx.fillStyle = "#00FFFF";
      statusCtx.font = "bold 20px monospace";
      statusCtx.fillText(`Hand ${i}: MediaPipe="${cameraHanded}" isLeft=${isUiLeft}`, 20, 120 + i * 30);

      if (isUiLeft) {
        leftHandPresent = true;
        
        // Get hand state for finger detection (only needed for left hand)
        const handState = handStates[i];
        if (handState) {
          const fingerStates = handState.getFingerStates();
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
            statusCtx.fillText(str, 520 - 500 * i, 50 + 30 * index);
        }
        
        //left hand: detect number and play chord
        const detected = detectNumberFromLandmarks(landmarks);
        
        // Debug: always show detection attempt
        statusCtx.fillStyle = "#FF0000";
        statusCtx.font = "bold 24px monospace";
        if (detected) {
          const numText = `Left number: ${detected.number} (${detected.count} fingers)`;
          statusCtx.fillText(numText, 20, 40);
        } else {
          statusCtx.fillText("Left hand: no number detected", 20, 40);
        }
        
        if (detected) {

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
          
          // Debug: show buffer status
          statusCtx.fillStyle = "#FFFF00";
          statusCtx.font = "bold 16px monospace";
          statusCtx.fillText(`Buffer: mode=${modeVal} count=${modeCount}/${LEFT_CHANGE_THRESHOLD} prev=${prevConfirmed}`, 20, 200);
          
          if (modeCount >= LEFT_CHANGE_THRESHOLD && modeVal !== prevConfirmed) {
            console.log(`🎵 Chord change detected: ${prevConfirmed} -> ${modeVal}`);
            
            // change confirmed value
            // stop old chord
            if (typeof prevConfirmed === 'number' && prevConfirmed > 0) {
              console.log(`Stopping chord ${prevConfirmed}`);
              stopSustainedChord(prevConfirmed);
            }

            win.__aurea_lastConfirmedLeftNumber = modeVal;

            if (typeof modeVal === 'number' && modeVal > 0) {
              // start new sustained chord
              console.log(`Starting chord ${modeVal}`);
              const chordName = startSustainedChord(modeVal);
              console.log(`Chord name: ${chordName}`);
              try {
                window.dispatchEvent(new CustomEvent('aurea-left-detect', { detail: { number: modeVal, chord: chordName } }));
              } catch (e) {
                console.error('Event dispatch error:', e);
              }
            } else {
              console.log('Stopping all chords (modeVal <= 0)');
              stopSustainedChord();
              try {
                window.dispatchEvent(new CustomEvent('aurea-left-detect', { detail: { number: modeVal, chord: null } }));
              } catch (e) {}
            }
          }
        }
      } else {
        rightHandPresent = true;
        // right hand: track position and play notes
        const right_point = results.landmarks[i][17]; //point 17, pinky base
        const pixel_dist_x = (right_point.x).toFixed(3);
        const pixel_dist_y = (right_point.y).toFixed(3);
        
        const dist_text = `Right-hand x: ${pixel_dist_x}, y: ${pixel_dist_y}`;
      
        // Draw it on camera
        statusCtx.fillStyle = "#0000FF";
        statusCtx.font = "bold 20px monospace";
        statusCtx.fillText(dist_text, 20, 80);

        // Debug: show what note would be played
        const noteToPlay = xToNote(right_point.x, keyConfig.key, keyConfig.scaleType);
        statusCtx.fillText(`Note: ${noteToPlay}`, 20, 100);

        //play note based on x position:
        maybePlayNoteFromX(right_point.x, keyConfig.key, keyConfig.scaleType, "8n");
      }
    }
    
    // If left hand was removed, stop the chord
    if (!leftHandPresent && win.__aurea_lastConfirmedLeftNumber !== null) {
      console.log('Left hand removed, stopping chord');
      stopSustainedChord();
      win.__aurea_lastConfirmedLeftNumber = null;
      win.__aurea_leftBuffer = [];
      try {
        window.dispatchEvent(new CustomEvent('aurea-left-detect', { detail: { number: null, chord: null } }));
      } catch (e) {}
    }
    
    // If right hand was removed, reset last note so it plays again when hand returns
    if (!rightHandPresent && typeof win.__aurea_lastRightNote !== 'undefined') {
      console.log('Right hand removed, resetting note tracking');
      win.__aurea_lastRightNote = null;
    }
    if (rightHandPresent && typeof win.__aurea_lastRightNote === 'undefined') {
      win.__aurea_lastRightNote = null;
    }
  }
  canvasCtx.restore();
  statusCtx.restore();
}


import * as Tone from "tone";
import type { ScaleType } from "./react/KeyControls";

let synth: Tone.Synth | null = null;
let audioReady = false;
let lastNote: string | null = null;
let lastNoteLength: string | null = null;

// Called from App button
export async function initAudio(): Promise<void> {
    if (audioReady) return;

    await Tone.start();
    synth = new Tone.Synth().toDestination();
    audioReady = true;


}

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};


function getRootSemitone(key: string): number {
  const val = NOTE_TO_SEMITONE[key];
  if (val === undefined) {
    console.warn(`Unknown key "${key}", defaulting to C`);
    return 0;
  }
  return val;
}

function getScaleSteps(scaleType: ScaleType): number[] {
  // Major and natural minor
  if (scaleType === "major") {
    return [0, 2, 4, 5, 7, 9, 11]; // Ionian
  } else {
    return [0, 2, 3, 5, 7, 8, 10]; // Aeolian (natural minor)
  }
}

// Build allowed MIDI notes in [minMidi, maxMidi] for given key/scale
function buildScaleMidiSet(
  key: string,
  scaleType: ScaleType,
  minMidi: number,
  maxMidi: number
): number[] {
  const root = getRootSemitone(key);
  const steps = getScaleSteps(scaleType);
  const allowed: number[] = [];

  for (let midi = minMidi; midi <= maxMidi; midi++) {
    const semitone = (midi - root + 1200) % 12; // +1200 to avoid negatives
    if (steps.includes(semitone)) {
      allowed.push(midi);
    }
  }
  return allowed;
}

//x: x-axis distance, mapped to xToNote
//length: length of duration
export function maybePlayNoteFromX(
  x: number,
  key: string,
  scaleType: ScaleType,
  length: string
): void {
  if (!audioReady || !synth) return;

  const note = xToNote(x, key, scaleType);

  //if (note !== lastNote) {
    synth.triggerAttackRelease(note, length);
    lastNote = note;
  //}
}

  export function xToNote(
    x: number,
    key: string,
    scaleType: ScaleType
  ): string {
    const clamped = Math.min(1, Math.max(0, x));
  
    const minMidi = 60; // C4
    const maxMidi = 84; // C6
  
    const targetMidi = minMidi + (maxMidi - minMidi) * clamped;
  
    const allowed = buildScaleMidiSet(key, scaleType, minMidi, maxMidi);
    if (allowed.length === 0) {
      // fallback chromatic
      const rounded = Math.round(targetMidi);
      return Tone.Frequency(rounded, "midi").toNote();
    }
  
    // Find allowed note closest to target
    let bestMidi = allowed[0];
    let bestDist = Math.abs(allowed[0] - targetMidi);
  
    for (let i = 1; i < allowed.length; i++) {
      const dist = Math.abs(allowed[i] - targetMidi);
      if (dist < bestDist) {
        bestDist = dist;
        bestMidi = allowed[i];
      }
    }
  
    return Tone.Frequency(bestMidi, "midi").toNote();
  }

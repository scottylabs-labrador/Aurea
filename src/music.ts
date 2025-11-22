import * as Tone from "tone";
import type { ScaleType } from "./react/KeyControls";

let synth: Tone.Synth | null = null;
let polySynth: Tone.PolySynth | null = null;
let audioReady = false;
let lastNote: string | null = null;
let lastNoteLength: string | null = null;

// Called from App button
export async function initAudio(): Promise<void> {
    if (audioReady) return;

    await Tone.start();
    synth = new Tone.Synth().toDestination();
    // polySynth for chords
    polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
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

//main chord map
const CHORD_MAP: Record<number, string[]> = {
  0: ["C3"], // fist / low tone
  1: ["G3", "B3", "D4"], // G major (V)
  2: ["C4", "E4", "G4"], // C major (I)
  3: ["D4", "F4", "A4"], // D minor (ii)
  4: ["E4", "G4", "B4"], // E minor (iii)
  5: ["F4", "A4", "C5"], // F major (IV)
};

// names for chords
const CHORD_NAME_MAP: Record<number, string> = {
  0: "Fist (C3)",
  1: "G major",
  2: "C major",
  3: "D minor",
  4: "E minor",
  5: "F major",
};

export function playNoteForNumber(n: number, length = "8n") {
  if (!audioReady || !synth) return null;

  const notes = CHORD_MAP[n] ?? CHORD_MAP[1];
  const name = CHORD_NAME_MAP[n] ?? CHORD_NAME_MAP[1] ?? "chord";

  for (const note of notes) synth.triggerAttackRelease(note, length);

  lastNote = notes[0];
  lastNoteLength = length;
  return name;
}

//play a sustained chord
export function startSustainedChord(n: number) {
  if (!audioReady || !polySynth) return null;

  const notes = CHORD_MAP[n];
  if (!notes) return null;

  try {
    polySynth.triggerAttack(notes);
    return CHORD_NAME_MAP[n] ?? notes.join(" ");
  } catch (e) {
    console.warn("startSustainedChord failed", e);
    return null;
  }
}

//stop a sustained chord
export function stopSustainedChord(n?: number) {
  if (!audioReady || !polySynth) return null;

  if (typeof n === "number") {
    const notes = CHORD_MAP[n];
    if (!notes) return null;
    try {
      polySynth.triggerRelease(notes);
      return true;
    } catch (e) {
      console.warn("stopSustainedChord failed", e);
      return null;
    }
  }

  try {
    polySynth.releaseAll?.();
  } catch (e) {
    const allNotes = Object.values(CHORD_MAP).flat();
    polySynth.triggerRelease(allNotes);
  }
  return true;
}

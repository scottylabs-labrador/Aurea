import * as Tone from "tone";


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

    //console.log("Audio initialized");


    synth.triggerAttackRelease("C4", "8n");
}


//x: x-axis distance, mapped to xToNote
//length: length of duration
export function maybePlayNoteFromX(x: number, length: string): void {
    if (!audioReady || !synth) return;
  
    const note = xToNote(x);
  
    // Only retrigger if note changed
    //if (note !== lastNote) {
      synth.triggerAttackRelease(note, length);
      lastNote = note;
    //}
  }

function xToNote(x:number):string {
    // Clamp x just in case
    const clamped = Math.min(1, Math.max(0, x));

    // Map 0..1 → MIDI range (e.g. 60 to 84 = C4 to C6)
    const minMidi = 60; // C4
    const maxMidi = 84; // C6
    const midi = minMidi + (maxMidi - minMidi) * clamped;

    // Round to nearest semitone
    const roundedMidi = Math.round(midi);

    // Convert MIDI to note name using Tone.js
    const noteName = Tone.Frequency(roundedMidi, "midi").toNote();
    return noteName;
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

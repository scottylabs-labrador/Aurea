import * as Tone from "tone";


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

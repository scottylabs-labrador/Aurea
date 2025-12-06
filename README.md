# Aurea

Gesture-driven music creation in the browser. Aurea uses your webcam to track both hands: your left hand selects and sustains chords, while your right hand chooses pitch and note length. Built with React, Vite, MediaPipe Tasks, and Tone.js.

## Created for ScottyLabs Labador Fall 2025
By Henry Teng, Janine Zeng, Raymond Jiang, Ryan Wu 

## Quickstart

```bash
git clone https://github.com/scottylabs-labrador/Aurea.git
cd Aurea
npm install
npm run dev
```

Open the Vite dev server URL (usually http://localhost:5173) and allow camera access. Click **try it out** to initialize audio.

## How it works

- Webcam hand tracking via MediaPipe Tasks; canvas overlays show detected landmarks.
- Left hand (mirrored UI): number of fingers held up picks a chord and sustains it until you change or make a fist.
- Right hand: horizontal position maps to scale-constrained pitch in the selected key; finger count picks note duration.
- Audio is synthesized in-browser with Tone.js; keys/scales are selectable in the UI.

## Gesture map

Left hand → chords (sustained)
- 0 fingers (fist): stop chords
- 1: G major (V)
- 2: C major (I)
- 3: D minor (ii)
- 4: E minor (iii)
- 5: F major (IV)

Right hand → melody
- X position: pitch (clamped to the chosen key/scale between C4–C6)
- Fingers up: 1=8th, 2=16th, 3=quarter, 4=half, 5=whole; fist stops

## UI flow

1) Landing screen → **try it out** initializes audio and scrolls to the camera.
2) Pick a key and scale (major/minor).
3) Hold hands in frame, enable camera permissions, and play.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build locally
- `npm run lint` — lint TypeScript/TSX files

## Tech stack

React 18, TypeScript, Vite, Tone.js, MediaPipe Tasks Vision, motion/react, Tailwind CSS (v4). A webcam is required; for HTTPS-only camera policies, use localhost or serve over https.

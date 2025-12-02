// KeyControls.tsx
import React from "react";


export type ScaleType = "major" | "minor";

export interface KeyConfig {
  key: string;       // e.g. "C", "F#", "Bb"
    scaleType: ScaleType;
}

interface KeySelectorProps {
    value: KeyConfig;
    onChange: (value: KeyConfig) => void;
}

const KEYS = [
    "C", "C#", "Db", "D", "D#", "Eb",
    "E", "F", "F#", "Gb", "G", "G#", "Ab",
    "A", "A#", "Bb", "B",
];

export const KeySelector: React.FC<KeySelectorProps> = ({ value, onChange }) => {
const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, key: e.target.value });
};

const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, scaleType: e.target.value as ScaleType });
};

return (
    <div className = "flex gap-[0.5rem] align-center justify-center ">
    <label>
        Key:{" "}
        <select value={value.key} onChange={handleKeyChange}>
        {KEYS.map((k) => (
            <option key={k} value={k}>
            {k}
            </option>
        ))}
        </select>
    </label>

    <label>
        Scale:{" "}
        <select value={value.scaleType} onChange={handleScaleChange}>
        <option value="major">Major</option>
        <option value="minor">Minor</option>
        </select>
    </label>
    </div>
);



};

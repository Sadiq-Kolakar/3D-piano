export const PIANO_KEYS = [
  { note: 'C3', type: 'white', label: 'Q' },
  { note: 'C#3', type: 'black', label: '2', offset: 50 },
  { note: 'D3', type: 'white', label: 'W' },
  { note: 'D#3', type: 'black', label: '3', offset: 122 },
  { note: 'E3', type: 'white', label: 'E' },
  { note: 'F3', type: 'white', label: 'R' },
  { note: 'F#3', type: 'black', label: '5', offset: 266 },
  { note: 'G3', type: 'white', label: 'T' },
  { note: 'G#3', type: 'black', label: '6', offset: 338 },
  { note: 'A3', type: 'white', label: 'Y' },
  { note: 'A#3', type: 'black', label: '7', offset: 410 },
  { note: 'B3', type: 'white', label: 'U' },
  
  { note: 'C4', type: 'white', label: 'I' },
  { note: 'C#4', type: 'black', label: '9', offset: 554 },
  { note: 'D4', type: 'white', label: 'O' },
  { note: 'D#4', type: 'black', label: '0', offset: 626 },
  { note: 'E4', type: 'white', label: 'P' },
  { note: 'F4', type: 'white', label: '[' },
  { note: 'F#4', type: 'black', label: '=', offset: 770 },
  { note: 'G4', type: 'white', label: ']' },
  { note: 'G#4', type: 'black', label: '-', offset: 842 }, // Fix 10: avoid 'A' collision
  { note: 'A4', type: 'white', label: 'Z' },
  { note: 'A#4', type: 'black', label: 'S', offset: 914 }, 
  { note: 'B4', type: 'white', label: 'X' },
];

const noteMap = {};
PIANO_KEYS.forEach(key => {
  noteMap[key.label.toLowerCase()] = key.note;
});

export function getNoteFromKey(key) {
  const normalizedKey = key.toLowerCase();
  return noteMap[normalizedKey] || null;
}

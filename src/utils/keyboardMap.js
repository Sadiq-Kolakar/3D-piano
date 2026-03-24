export const PIANO_KEYS = [
  { note: 'C3', type: 'white', label: 'A' },
  { note: 'C#3', type: 'black', label: '1', offset: 50 },
  { note: 'D3', type: 'white', label: 'S' },
  { note: 'D#3', type: 'black', label: '2', offset: 122 },
  { note: 'E3', type: 'white', label: 'D' },
  { note: 'F3', type: 'white', label: 'F' },
  { note: 'F#3', type: 'black', label: '3', offset: 266 },
  { note: 'G3', type: 'white', label: 'G' },
  { note: 'G#3', type: 'black', label: '4', offset: 338 },
  { note: 'A3', type: 'white', label: 'H' },
  { note: 'A#3', type: 'black', label: '5', offset: 410 },
  { note: 'B3', type: 'white', label: 'J' },
  
  { note: 'C4', type: 'white', label: 'K' },
  { note: 'C#4', type: 'black', label: '6', offset: 554 },
  { note: 'D4', type: 'white', label: 'L' },
  { note: 'D#4', type: 'black', label: '7', offset: 626 },
  { note: 'E4', type: 'white', label: ';' },
  { note: 'F4', type: 'white', label: "'" },
  { note: 'F#4', type: 'black', label: '8', offset: 770 },
  { note: 'G4', type: 'white', label: 'Z' },
  { note: 'G#4', type: 'black', label: '9', offset: 842 }, 
  { note: 'A4', type: 'white', label: 'X' },
  { note: 'A#4', type: 'black', label: '0', offset: 914 }, 
  { note: 'B4', type: 'white', label: 'C' },
];

const noteMap = {};
PIANO_KEYS.forEach(key => {
  noteMap[key.label.toLowerCase()] = key.note;
});

export function getNoteFromKey(key) {
  const normalizedKey = key.toLowerCase();
  return noteMap[normalizedKey] || null;
}

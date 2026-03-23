export const PIANO_KEYS = [
  { note: 'C3', type: 'white', label: 'a' },
  { note: 'C#3', type: 'black', label: '1', offset: '2.5%' },
  { note: 'D3', type: 'white', label: 'b' },
  { note: 'D#3', type: 'black', label: '2', offset: '6.3%' },
  { note: 'E3', type: 'white', label: 'c' },
  { note: 'F3', type: 'white', label: 'd' },
  { note: 'F#3', type: 'black', label: '3', offset: '14.0%' },
  { note: 'G3', type: 'white', label: 'e' },
  { note: 'G#3', type: 'black', label: '4', offset: '17.8%' },
  { note: 'A3', type: 'white', label: 'f' },
  { note: 'A#3', type: 'black', label: '5', offset: '21.7%' },
  { note: 'B3', type: 'white', label: 'g' },
  
  { note: 'C4', type: 'white', label: 'h' },
  { note: 'C#4', type: 'black', label: '6', offset: '29.4%' },
  { note: 'D4', type: 'white', label: 'i' },
  { note: 'D#4', type: 'black', label: '7', offset: '33.2%' },
  { note: 'E4', type: 'white', label: 'j' },
  { note: 'F4', type: 'white', label: 'k' },
  { note: 'F#4', type: 'black', label: '8', offset: '40.9%' },
  { note: 'G4', type: 'white', label: 'l' },
  { note: 'G#4', type: 'black', label: '9', offset: '44.8%' },
  { note: 'A4', type: 'white', label: 'm' },
  { note: 'A#4', type: 'black', label: '0', offset: '48.6%' },
  { note: 'B4', type: 'white', label: 'n' },
  
  { note: 'C5', type: 'white', label: 'o' },
  { note: 'D5', type: 'white', label: 'p' },
  { note: 'E5', type: 'white', label: 'q' },
  { note: 'F5', type: 'white', label: 'r' },
  { note: 'G5', type: 'white', label: 's' },
  { note: 'A5', type: 'white', label: 't' },
  { note: 'B5', type: 'white', label: 'u' },
  { note: 'C6', type: 'white', label: 'v' },
  { note: 'D6', type: 'white', label: 'w' },
  { note: 'E6', type: 'white', label: 'x' },
  { note: 'F6', type: 'white', label: 'y' },
  { note: 'G6', type: 'white', label: 'z' }
];

const noteMap = {};
PIANO_KEYS.forEach(key => {
  noteMap[key.label.toLowerCase()] = key.note;
});

export function getNoteFromKey(key) {
  const normalizedKey = key.toLowerCase();
  return noteMap[normalizedKey] || null;
}

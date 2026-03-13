// Mapping PC keys to Piano Notes
// For a standard piano layout mapping the home row to white keys

export const keyboardToNoteMap = {
  // Octave 3 (Left hand / Lower)
  'z': 'C3',
  's': 'C#3',
  'x': 'D3',
  'd': 'D#3',
  'c': 'E3',
  'v': 'F3',
  'g': 'F#3',
  'b': 'G3',
  'h': 'G#3',
  'n': 'A3',
  'j': 'A#3',
  'm': 'B3',

  // Octave 4 (Right hand / Upper - as requested in Beginner Spec)
  'q': 'C4',
  '2': 'C#4',
  'w': 'D4',
  '3': 'D#4',
  'e': 'E4',
  'r': 'F4',
  '5': 'F#4',
  't': 'G4',
  '6': 'G#4',
  'y': 'A4',
  '7': 'A#4',
  'u': 'B4',
  
  // Alternative mapping (as requested precisely in the specs)
  // White keys: A S D F G H J
  // Black keys: W E T Y U
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
  'k': 'C5',
  'o': 'C#5',
  'l': 'D5',
  'p': 'D#5',
  ';': 'E5',
  "'": 'F5'
}

export const getNoteFromKey = (key) => {
  return keyboardToNoteMap[key.toLowerCase()] || null
}

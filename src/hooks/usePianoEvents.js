import { useEffect } from 'react'
import usePianoStore from '../store/usePianoStore'
import { toneEngine } from '../audio/ToneEngine'
import { getNoteFromKey } from '../utils/keyboardMap'

export function usePianoEvents(mode) {
  const { addActiveNote, removeActiveNote, sustainMode, toggleSustain } = usePianoStore()

  useEffect(() => {
    // If not in a playable mode (e.g. landing page), don't attach listeners
    // Wait, landing mode could optionally have input disabled. 
    // Usually only Beginner, Intermediate, Expert have input.
    if (mode === 'landing') return

    const handleKeyDown = (e) => {
      if (e.repeat) return

      // Handle spacebar for sustain
      if (e.code === 'Space') {
        e.preventDefault()
        toggleSustain()
        toneEngine.setSustain(!sustainMode) // Simplified
        return
      }

      const note = getNoteFromKey(e.key)
      if (note) {
        addActiveNote(note)
        toneEngine.playNote(note)
      }
    }

    const handleKeyUp = (e) => {
      const note = getNoteFromKey(e.key)
      if (note) {
        removeActiveNote(note)
        toneEngine.releaseNote(note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [mode, addActiveNote, removeActiveNote, sustainMode, toggleSustain])
}

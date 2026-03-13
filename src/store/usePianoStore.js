import { create } from 'zustand'

const usePianoStore = create((set) => ({
  activeNotes: new Set(),
  sustainMode: false,
  metronomeActive: false,
  metronomeBpm: 120,
  isLoaded: false,

  addActiveNote: (note) => set((state) => {
    const newNotes = new Set(state.activeNotes)
    newNotes.add(note)
    return { activeNotes: newNotes }
  }),
  
  removeActiveNote: (note) => set((state) => {
    const newNotes = new Set(state.activeNotes)
    newNotes.delete(note)
    return { activeNotes: newNotes }
  }),

  toggleSustain: () => set((state) => ({ sustainMode: !state.sustainMode })),
  
  toggleMetronome: () => set((state) => ({ metronomeActive: !state.metronomeActive })),
  
  setBpm: (bpm) => set({ metronomeBpm: bpm }),

  setLoaded: (status) => set({ isLoaded: status })
}))

export default usePianoStore

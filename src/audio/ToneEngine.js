import * as Tone from 'tone'

class ToneEngine {
  constructor() {
    this.synth = null
    this.isInitialized = false
  }

  async init(onProgress) {
    if (this.isInitialized) return
    
    if (onProgress) onProgress(50, 'Initializing Synthesizer...')
    
    // Create a rich synth sound instantly. Removed the Reverb module
    // which was blocking the initialization thread.
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: "triangle" 
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 1.2,
      }
    }).toDestination()
    
    this.isInitialized = true
    
    if (onProgress) onProgress(100, 'Ready')
  }

  loadRemainingOctaves() {
    // No-op since PolySynth can generate any octave mathematically
  }

  playNote(note) {
    if (!this.isInitialized) return
    try {
      this.synth.triggerAttack(note, Tone.now(), 0.8)
    } catch (e) {
      console.error("Play note error:", e)
    }
  }

  releaseNote(note) {
    if (!this.isInitialized) return
    try {
      this.synth.triggerRelease(note, Tone.now())
    } catch (e) {
      console.error("Release note error:", e)
    }
  }

  setSustain(isSustain) {
    if (!this.isInitialized) return
    const releaseTime = isSustain ? 3.0 : 1.2
    this.synth.set({ envelope: { release: releaseTime } })
  }
}

export const toneEngine = new ToneEngine()

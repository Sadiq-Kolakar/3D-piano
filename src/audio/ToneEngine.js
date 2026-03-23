import * as Tone from 'tone'

class ToneEngine {
  constructor() {
    this.synth = null
    this.isInitialized = false
  }

  async init(onProgress) {
    if (this.isInitialized) return
    
    if (onProgress) onProgress(50, 'Initializing Synthesizer...')
    
    // Use a PolySynth which generates sound locally (no mp3 downloads needed)
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: "fat" 
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 1.2,
      }
    }).toDestination()
    
    // Create a reverb effect to make it sound premium and less computer-like
    const reverb = new Tone.Reverb({
        decay: 2.0,
        preDelay: 0.01,
    }).toDestination()
    
    // Need to await reverb generation internally
    await reverb.generate()
    
    this.synth.connect(reverb)
    this.isInitialized = true
    
    if (onProgress) onProgress(100, 'Ready')
  }

  loadRemainingOctaves() {
    // No-op since PolySynth can generate any octave mathematically
  }

  playNote(note) {
    if (!this.isInitialized) return
    try {
      // Small velocity variation can make it sound slightly more natural
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

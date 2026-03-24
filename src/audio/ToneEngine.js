import * as Tone from 'tone'

class ToneEngine {
  constructor() {
    this.synth = null
    this.reverb = null
    this.isInitialized = false
  }

  async init(onProgress) {
    if (this.isInitialized) return
    
    if (onProgress) onProgress(50, 'Initializing Synthesizer...')
    
    // Add Reverb (Fix 7)
    this.reverb = new Tone.Reverb(1.5).toDestination()

    // Initialize Synth and connect to reverb
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
    }).connect(this.reverb)
    
    // Initial reverb state
    this.reverb.wet.value = 0.42 

    this.isInitialized = true
    
    if (onProgress) onProgress(100, 'Ready')
  }

  loadRemainingOctaves() {}

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

  setReverb(value) {
    if (!this.isInitialized || !this.reverb) return
    // Map 0-100 UI slider to 0-1 wet value
    this.reverb.wet.value = value / 100
  }
}

export const toneEngine = new ToneEngine()

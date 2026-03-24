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
    this.reverb.wet.value = value / 100
  }

  changeInstrument(instrumentName) {
    if (!this.isInitialized || !this.synth) return;
    
    this.synth.releaseAll();

    switch (instrumentName) {
      case 'piano': 
        this.synth.set({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 1.2 }
        });
        break;
      case 'synth': 
        this.synth.set({
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.8 }
        });
        break;
      case 'organ': 
        this.synth.set({
          oscillator: { type: "sine" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 }
        });
        break;
    }
  }
}

export const toneEngine = new ToneEngine()

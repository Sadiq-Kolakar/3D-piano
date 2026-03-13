import * as Tone from 'tone'
import { CONFIG } from '../constants/config'

class ToneEngine {
  constructor() {
    this.sampler = null
    this.isInitialized = false
    this.metronomeLoop = null
    this.clickSynth = null
    this.loadedOctaves = new Set()
  }

  // Load just the core octaves (e.g. 3, 4, 5) initially for fast startup
  async init(onProgress) {
    if (this.isInitialized) return

    return new Promise((resolve) => {
      if (onProgress) onProgress(10, 'Starting Audio Engine...')
      
      const coreUrls = {
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3"
      }

      this.sampler = new Tone.Sampler({
        urls: coreUrls,
        release: 1,
        baseUrl: CONFIG.SAMPLES_BASE_URL,
        onload: () => {
          this.isInitialized = true
          this.loadedOctaves.add(3)
          this.loadedOctaves.add(4)
          this.loadedOctaves.add(5)
          
          this.clickSynth = new Tone.MembraneSynth().toDestination()
          if (onProgress) onProgress(100, 'Ready')
          resolve()
        },
        onerror: (err) => {
          console.error("Failed to load core samples", err)
          if (onProgress) onProgress(100, 'Error Loading Audio')
          // Still resolve to prevent hanging, just without audio loaded
          this.isInitialized = true 
          resolve()
        }
      }).toDestination()
    })
  }

  // Lazy load additional octaves asynchronously in the background
  async loadOctave(octave) {
    if (!this.isInitialized || this.loadedOctaves.has(octave)) return

    const octaveUrls = {
      [`C${octave}`]: `C${octave}.mp3`,
      [`D#${octave}`]: `Ds${octave}.mp3`,
      [`F#${octave}`]: `Fs${octave}.mp3`,
      [`A${octave}`]: `A${octave}.mp3`
    }

    try {
      // Add new samples to the existing sampler
      await new Promise((resolve) => {
        let loadedCount = 0
        const keys = Object.keys(octaveUrls)
        if (keys.length === 0) resolve()
        keys.forEach(key => {
          this.sampler.add(key, octaveUrls[key], () => {
            loadedCount++
            if (loadedCount === keys.length) resolve()
          })
        })
      })
      this.loadedOctaves.add(octave)
    } catch (e) {
      console.warn(`Failed to lazy load octave ${octave}`, e)
    }
  }

  async loadRemainingOctaves() {
    // Load lower octaves
    await this.loadOctave(1)
    await this.loadOctave(2)
    // Load higher octaves
    await this.loadOctave(6)
    await this.loadOctave(7)
  }

  playNote(note) {
    if (!this.isInitialized) return
    try {
      this.sampler.triggerAttack(note)
    } catch (e) {
      // Ignore if sample isn't loaded yet
    }
  }

  releaseNote(note) {
    if (!this.isInitialized) return
    try {
      this.sampler.triggerRelease(note)
    } catch (e) {
      // Ignore
    }
  }

  setSustain(isSustain) {
    if (!this.isInitialized) return
    this.sampler.release = isSustain ? 3.0 : 0.5
  }

  startMetronome(bpm) {
    Tone.Transport.bpm.value = bpm
    this.metronomeLoop = new Tone.Loop(time => {
      this.clickSynth.triggerAttackRelease("C2", "8n", time)
    }, "4n").start(0)
    Tone.Transport.start()
  }

  stopMetronome() {
    if (this.metronomeLoop) {
      this.metronomeLoop.stop()
      this.metronomeLoop.dispose()
      this.metronomeLoop = null
    }
    Tone.Transport.stop()
  }

  updateBpm(bpm) {
    Tone.Transport.bpm.value = bpm
  }
}

export const toneEngine = new ToneEngine()

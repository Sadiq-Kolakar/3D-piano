import { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { toneEngine } from './audio/ToneEngine'
import { PIANO_KEYS, getNoteFromKey } from './utils/keyboardMap'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [isAudioInitialized, setAudioInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadStatus, setLoadStatus] = useState('')
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [volume, setVolume] = useState(0) // Tone.js volume in dB (0 is max, -60 is min)

  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [recordedNotes, setRecordedNotes] = useState([])
  const recordingStartTime = useRef(0)
  const playbackTimeouts = useRef([])

  useEffect(() => {
    // Add Volume node
    Tone.Destination.volume.value = volume;
  }, [volume])

  const initializeAudio = async () => {
    setIsLoading(true)
    await Tone.start()
    
    setTimeout(async () => {
      await toneEngine.init((progress, status) => {
        setLoadProgress(progress)
        setLoadStatus(status)
      })
      setAudioInitialized(true)
      setIsLoading(false)
      toneEngine.loadRemainingOctaves()
    }, 50)
  }

  // Handle Keyboard events
  useEffect(() => {
    if (!isAudioInitialized) return

    const handleKeyDown = (e) => {
      if (e.repeat) return; // Ignore hold repeats
      
      const note = getNoteFromKey(e.key)
      if (note) {
        setActiveNotes(prev => new Set(prev).add(note))
        toneEngine.playNote(note)

        if (isRecording) {
          setRecordedNotes(prev => [
            ...prev,
            { note, time: Date.now() - recordingStartTime.current, type: 'attack' }
          ])
        }
      }
    }

    const handleKeyUp = (e) => {
      const note = getNoteFromKey(e.key)
      if (note) {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        })
        toneEngine.releaseNote(note)

        if (isRecording) {
            setRecordedNotes(prev => [
              ...prev,
              { note, time: Date.now() - recordingStartTime.current, type: 'release' }
            ])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isAudioInitialized, isRecording])

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setRecordedNotes([])
      recordingStartTime.current = Date.now()
      setIsRecording(true)
    }
  }

  const handlePlayback = () => {
    if (recordedNotes.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);

    recordedNotes.forEach(event => {
      const timeout = setTimeout(() => {
        if (event.type === 'attack') {
          setActiveNotes(prev => new Set(prev).add(event.note));
          toneEngine.playNote(event.note);
        } else {
          setActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(event.note);
            return next;
          });
          toneEngine.releaseNote(event.note);
        }
      }, event.time);
      playbackTimeouts.current.push(timeout);
    });

    // Reset playback status after last note
    if (recordedNotes.length > 0) {
      const lastEventTime = recordedNotes[recordedNotes.length - 1].time;
      setTimeout(() => {
        setIsPlayingBack(false);
      }, lastEventTime + 500);
    }
  }

  const stopPlayback = () => {
    playbackTimeouts.current.forEach(clearTimeout);
    playbackTimeouts.current = [];
    setActiveNotes(new Set());
    setIsPlayingBack(false);
  }

  const renderKey = (keyDef) => {
    const isActive = activeNotes.has(keyDef.note)
    if (keyDef.type === 'white') {
      return (
        <div 
          key={keyDef.note}
          className={`white-key ${isActive ? 'active' : ''}`}
          onMouseDown={() => {
            toneEngine.playNote(keyDef.note)
            setActiveNotes(prev => new Set(prev).add(keyDef.note))
          }}
          onMouseUp={() => {
            toneEngine.releaseNote(keyDef.note)
            setActiveNotes(prev => {
               const next = new Set(prev)
               next.delete(keyDef.note)
               return next
            })
          }}
          onMouseLeave={() => {
            if (activeNotes.has(keyDef.note)) {
                toneEngine.releaseNote(keyDef.note)
                setActiveNotes(prev => {
                   const next = new Set(prev)
                   next.delete(keyDef.note)
                   return next
                })
            }
          }}
        >
          <span className="uppercase text-xs mb-2 opacity-50">{keyDef.label}</span>
        </div>
      )
    } else {
      return (
        <div 
          key={keyDef.note}
          className={`black-key ${isActive ? 'active' : ''}`}
          style={{ left: keyDef.offset }}
          onMouseDown={() => {
            toneEngine.playNote(keyDef.note)
            setActiveNotes(prev => new Set(prev).add(keyDef.note))
          }}
          onMouseUp={() => {
            toneEngine.releaseNote(keyDef.note)
            setActiveNotes(prev => {
               const next = new Set(prev)
               next.delete(keyDef.note)
               return next
            })
          }}
          onMouseLeave={() => {
            if (activeNotes.has(keyDef.note)) {
                toneEngine.releaseNote(keyDef.note)
                setActiveNotes(prev => {
                   const next = new Set(prev)
                   next.delete(keyDef.note)
                   return next
                })
            }
          }}
        >
          <span className="text-xs mb-4 opacity-50">{keyDef.label}</span>
        </div>
      )
    }
  }

  return (
    <div className="piano-container font-sans text-[#e2e2e2]">
      {isLoading && <LoadingScreen progress={loadProgress} status={loadStatus} />}
      
      {!isAudioInitialized && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-4xl md:text-6xl font-light tracking-widest mb-4 font-['Manrope'] uppercase text-white">Piano Pro</h1>
            <p className="text-lg text-[#919191] mb-8 max-w-lg">A premium monochromatic instrument. Ready to perform?</p>
            <button 
              onClick={initializeAudio}
              className="bg-white text-[#1a1c1c] uppercase tracking-widest font-semibold text-sm px-10 py-4 hover:bg-[#d4d4d4] transition-colors"
            >
              Start Session
            </button>
        </div>
      ) : (
        <>
          <header className="header-panel p-6 px-10 flex items-center justify-between">
            <h1 className="text-2xl font-light tracking-widest uppercase text-white font-['Manrope']">Piano Pro</h1>
            
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-4">
                <span className="uppercase tracking-widest text-xs text-[#919191] w-16">Vol</span>
                <input 
                  type="range" 
                  min="-60" max="0" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider w-32"
                />
              </div>

              <div className="flex items-center gap-4 border-l border-[#353535] pl-12">
                <button 
                  onClick={handleRecordToggle}
                  disabled={isPlayingBack}
                  className={`flex items-center gap-2 px-6 py-2 uppercase tracking-widest text-xs font-semibold select-none border border-[#474747] ${isRecording ? 'bg-[#93000a] text-[#ffdad6] border-transparent' : 'bg-[#1f1f1f] hover:bg-[#353535]'}`}
                >
                  {isRecording ? '• Recording' : 'Record'}
                </button>
                
                {recordedNotes.length > 0 && !isRecording && (
                    <button 
                    onClick={isPlayingBack ? stopPlayback : handlePlayback}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-[#1a1c1c] uppercase tracking-widest text-xs font-semibold select-none hover:bg-[#d4d4d4]"
                    >
                    {isPlayingBack ? 'Stop' : 'Playback'}
                    </button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col justify-end pb-12">
            <div className="keys-container relative mx-12 shadow-2xl shadow-black/50">
                {/* Render white keys and black keys */}
                {PIANO_KEYS.map(renderKey)}
            </div>
            <div className="text-center text-[#474747] text-xs uppercase tracking-[0.2em] mt-8">
                Press corresponding keyboard keys to play
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App

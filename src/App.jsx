import { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { toneEngine } from './audio/ToneEngine'
import { PIANO_KEYS, getNoteFromKey } from './utils/keyboardMap'
import LoadingScreen from './components/LoadingScreen'
import AITeacher from './components/AITeacher'

const getShiftedNote = (note, octaveOffset) => {
  if (octaveOffset === 0) return note;
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return note;
  const originalOctave = parseInt(match[2], 10);
  const newOctave = originalOctave + octaveOffset;
  if (newOctave < 1 || newOctave > 8) return note;
  return `${match[1]}${newOctave}`;
}

function App() {
  const [isAudioInitialized, setAudioInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadStatus, setLoadStatus] = useState('')
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [volume, setVolume] = useState(0) 

  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [recordedNotes, setRecordedNotes] = useState([])
  const [sessionName, setSessionName] = useState(() => `Session_${Date.now()}.wav`)
  const recordingStartTime = useRef(0)
  const playbackTimeouts = useRef([])

  const [octave, setOctave] = useState(0)
  const [sustainActive, setSustainActive] = useState(false)
  const [metronomeActive, setMetronomeActive] = useState(false)
  
  const [reverb, setReverb] = useState(42)
  const [activePanel, setActivePanel] = useState(null)
  
  const [suggestedNotes, setSuggestedNotes] = useState(new Set()) 
  
  const [activeInstrument, setActiveInstrument] = useState('piano')

  const selectInstrument = (inst) => {
     setActiveInstrument(inst)
     if (isAudioInitialized) {
       toneEngine.changeInstrument(inst)
     }
  }

  useEffect(() => {
    Tone.Destination.volume.value = volume;
  }, [volume])

  useEffect(() => {
    if (isAudioInitialized) {
      toneEngine.setReverb(reverb)
    }
  }, [reverb, isAudioInitialized])

  useEffect(() => {
    let intervalId;
    if (metronomeActive && isAudioInitialized) {
      intervalId = setInterval(() => {
        try {
           toneEngine.synth.triggerAttackRelease('C6', '32n', Tone.now(), 0.1)
        } catch (error) {
           console.error("Metronome error:", error)
        }
      }, 500)
    }
    return () => clearInterval(intervalId)
  }, [metronomeActive, isAudioInitialized])

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
      toneEngine.setReverb(reverb)
    }, 50)
  }

  useEffect(() => {
    if (!isAudioInitialized) return

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.repeat) return;
      const originalNote = getNoteFromKey(e.key)
      if (originalNote) {
        const note = getShiftedNote(originalNote, octave)
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
      if (e.target.tagName === 'INPUT') return;
      const originalNote = getNoteFromKey(e.key)
      if (originalNote) {
        const note = getShiftedNote(originalNote, octave)
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
  }, [isAudioInitialized, isRecording, octave])

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setRecordedNotes([])
      recordingStartTime.current = Date.now()
      const dateStr = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')
      setSessionName(`Session_${dateStr}.wav`)
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

  const handleNotePlay = (note) => {
    const shifted = getShiftedNote(note, octave)
    toneEngine.playNote(shifted)
    setActiveNotes(prev => new Set(prev).add(shifted))
  }

  const handleNoteRelease = (note) => {
    const shifted = getShiftedNote(note, octave)
    toneEngine.releaseNote(shifted)
    setActiveNotes(prev => {
       const next = new Set(prev)
       next.delete(shifted)
       return next
    })
  }

  const toggleSustain = () => {
    setSustainActive(s => {
      const nextSustain = !s;
      toneEngine.setSustain(nextSustain);
      return nextSustain;
    });
  }

  if (!isAudioInitialized || isLoading) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col overflow-hidden items-center justify-center p-8 text-center relative selection:bg-primary/30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[150px] -z-10"></div>
        {isLoading && <LoadingScreen progress={loadProgress} status={loadStatus} />}
        {!isLoading && (
          <div className="z-10 bg-surface-container-low p-12 rounded-2xl border border-outline-variant/20 shadow-2xl backdrop-blur-xl">
             <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline text-on-surface">Nocturne</h1>
             <p className="text-lg text-on-surface-variant mb-8 max-w-md mx-auto">Experience the resonance of a world-class concert grand. Start your session.</p>
             <button 
               onClick={initializeAudio}
               className="bg-primary hover:bg-primary-dim text-on-primary font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(251,191,36,0.2)]"
             >
               Start Session
             </button>
          </div>
        )}
      </div>
    )
  }

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLatestTime = () => {
    if (recordedNotes.length === 0) return '00:00';
    return formatDuration(recordedNotes[recordedNotes.length - 1].time);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col overflow-hidden selection:bg-primary/30">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-white/5">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tighter text-on-surface font-headline">Nocturne</span>
          <nav className="hidden md:flex gap-6 relative">
            <a 
              className={`font-headline tracking-tighter cursor-pointer font-semibold transition-all duration-300 ${activePanel === 'instruments' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`} 
              onClick={(e) => { e.preventDefault(); setActivePanel(p => p==='instruments' ? null : 'instruments') }}
            >
              Instruments
            </a>
            <a 
              className={`font-headline tracking-tighter cursor-pointer font-semibold transition-all duration-300 ${activePanel === 'presets' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`} 
              onClick={(e) => { e.preventDefault(); setActivePanel(p => p==='presets' ? null : 'presets') }}
            >
              Presets
            </a>
            <a 
              className={`font-headline tracking-tighter cursor-pointer font-semibold transition-all duration-300 ${activePanel === 'recording' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`} 
              onClick={(e) => { e.preventDefault(); setActivePanel(p => p==='recording' ? null : 'recording') }}
            >
              Recording
            </a>
            
            {(activePanel === 'instruments' || activePanel === 'presets') && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-container-high border border-outline/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-lg p-4 w-56 z-50">
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">{activePanel} Options</p>
                <div className="mt-4 flex flex-col gap-3">
                   <button 
                     onClick={() => { setReverb(42); selectInstrument('piano'); setOctave(0); setActivePanel(null); }}
                     className="text-left text-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
                   >
                     Concert Hall (Default)
                   </button>
                   <button 
                     onClick={() => { setReverb(80); selectInstrument('synth'); setOctave(-1); setActivePanel(null); }}
                     className="text-left text-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
                   >
                     Deep Space Synth
                   </button>
                   <button 
                     onClick={() => { setReverb(15); selectInstrument('organ'); setOctave(0); setActivePanel(null); }}
                     className="text-left text-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
                   >
                     Church Organ
                   </button>
                </div>
              </div>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-surface-container-low px-3 py-1.5 rounded-full border border-white/5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>volume_up</span>
              <input 
                  type="range" 
                  min="-60" max="0" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-primary h-1 bg-surface-container-highest appearance-none rounded-full cursor-pointer opacity-70 hover:opacity-100"
              />
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-bright/20 rounded-full transition-all duration-300">
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>settings</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-bright/20 rounded-full transition-all duration-300">
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>account_circle</span>
          </button>
        </div>
      </header>

      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 bg-surface-container-low/90 backdrop-blur-2xl flex flex-col items-center py-6 gap-8 z-40 hidden md:flex border-r border-white/5 shadow-[4px_0_20px_rgba(0,0,0,0.3)]">
        <div className={`flex flex-col items-center gap-1 group cursor-pointer ${activeInstrument !== 'piano' && 'opacity-50 hover:opacity-100'}`} onClick={() => selectInstrument('piano')}>
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${activeInstrument === 'piano' ? 'bg-surface-bright text-primary shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-primary/20' : 'text-on-surface-variant group-hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>piano</span>
          </div>
          <span className={`font-headline text-[10px] font-medium ${activeInstrument === 'piano' ? 'text-primary' : 'text-on-surface-variant'}`}>Piano</span>
        </div>
        <div className={`flex flex-col items-center gap-1 group cursor-pointer ${activeInstrument !== 'synth' && 'opacity-50 hover:opacity-100'}`} onClick={() => selectInstrument('synth')}>
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 ${activeInstrument === 'synth' ? 'bg-surface-bright text-primary shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-primary/20' : 'text-on-surface-variant group-hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>keyboard</span>
          </div>
          <span className={`font-headline text-[10px] font-medium ${activeInstrument === 'synth' ? 'text-primary' : 'text-on-surface-variant'}`}>Synth</span>
        </div>
        <div className={`flex flex-col items-center gap-1 group cursor-pointer ${activeInstrument !== 'organ' && 'opacity-50 hover:opacity-100'}`} onClick={() => selectInstrument('organ')}>
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 ${activeInstrument === 'organ' ? 'bg-surface-bright text-primary shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-primary/20' : 'text-on-surface-variant group-hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>settings_input_component</span>
          </div>
          <span className={`font-headline text-[10px] font-medium ${activeInstrument === 'organ' ? 'text-primary' : 'text-on-surface-variant'}`}>Organ</span>
        </div>
      </aside>

      <main className="flex-grow pt-16 pl-0 md:pl-20 pb-28 flex flex-col items-center justify-center relative bg-surface overflow-x-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[150px] -z-10"></div>
        
        <div className="w-full max-w-7xl px-8 mb-8 flex flex-col xl:flex-row justify-between items-end gap-8 mt-4">
          <div className="flex flex-col">
            <span className="text-primary font-headline text-sm font-semibold tracking-widest uppercase mb-2">Maestro Mode {octave !== 0 && `(Octave: ${octave > 0 ? '+'+octave : octave})`}</span>
            <h1 className="text-on-surface font-headline text-5xl font-extrabold tracking-tighter shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Grand Piano</h1>
            <p className="text-on-surface-variant max-w-md mt-4 font-body leading-relaxed">
              Experience the resonance of a world-class concert grand. Use your computer keyboard to perform in real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            {(activePanel === 'recording' || recordedNotes.length > 0 || isRecording) && (
              <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 min-w-[320px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Playback</span>
                    <div className="px-2 py-0.5 rounded bg-surface-container-highest flex items-center gap-1.5 cursor-pointer hover:bg-surface-bright transition-colors overflow-hidden max-w-[120px]">
                      <span className="text-[10px] font-medium text-primary truncate" title={sessionName}>{sessionName}</span>
                    </div>
                  </div>
                  <span className="text-on-surface-variant text-[10px] font-mono tracking-tighter">00:00 / {getLatestTime()}</span>
                </div>
                
                <div className="relative w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden cursor-pointer group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`h-full relative transition-all duration-300 ${isPlayingBack ? 'bg-primary w-full' : 'bg-primary w-0'}`}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handlePlayback}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)] ${isPlayingBack ? 'bg-primary-dim text-on-primary' : 'bg-primary text-on-primary hover:bg-primary-dim'} active:scale-95`}
                      disabled={recordedNotes.length === 0}
                    >
                      <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'opsz' 24"}}>play_arrow</span>
                    </button>
                    <button 
                      onClick={stopPlayback}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-primary active:scale-95 transition-all text-xl"
                    >
                      <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>stop</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-mono">{recordedNotes.length} notes</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 backdrop-blur-md flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center gap-12">
                  <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">Reverb</span>
                  <span className="text-primary text-sm font-bold">{reverb}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={reverb}
                  onChange={(e) => setReverb(parseInt(e.target.value, 10))}
                  className="w-32 accent-primary h-1.5 bg-surface-container-highest appearance-none rounded-full cursor-pointer hover:shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-12 overflow-x-auto piano-scroll pb-8 mt-4">
          <div className="relative flex min-w-max h-[400px] items-start pb-4">
            <div className="flex h-full border border-white/5 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {PIANO_KEYS.filter(k => k.type === 'white').map((keyDef) => {
                const shiftedNote = getShiftedNote(keyDef.note, octave);
                const isActive = activeNotes.has(shiftedNote);
                const isSuggested = suggestedNotes.has(keyDef.note);
                return (
                  <div 
                    key={keyDef.note}
                    onMouseDown={() => handleNotePlay(keyDef.note)}
                    onMouseUp={() => handleNoteRelease(keyDef.note)}
                    onMouseLeave={() => {
                      if (activeNotes.has(shiftedNote)) handleNoteRelease(keyDef.note);
                    }}
                    className={`group relative w-[72px] h-[380px] bg-surface-container-highest flex flex-col justify-end items-center pb-6 transition-all duration-75 select-none hover:bg-surface-bright cursor-pointer shadow-inner ${isActive ? 'bg-gradient-to-b from-primary/10 to-primary/30 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.15)]' : ''} ${isSuggested && !isActive ? 'bg-tertiary/10 border-x border-b-4 border-tertiary/80 shadow-[inset_0_-20px_40px_rgba(163,230,53,0.2)]' : 'border-x border-outline-variant/10'}`}
                  >
                    <span className={`font-bold text-lg font-headline transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{keyDef.label}</span>
                    <span className="text-[10px] text-outline mt-1 font-body">{shiftedNote}</span>
                  </div>
                )
              })}
            </div>
            
            <div className="absolute top-0 left-0 w-full h-[240px] pointer-events-none drop-shadow-2xl">
              {PIANO_KEYS.filter(k => k.type === 'black').map((keyDef) => {
                const shiftedNote = getShiftedNote(keyDef.note, octave);
                const isActive = activeNotes.has(shiftedNote);
                const isSuggested = suggestedNotes.has(keyDef.note);
                return (
                  <div 
                    key={keyDef.note}
                    onMouseDown={() => handleNotePlay(keyDef.note)}
                    onMouseUp={() => handleNoteRelease(keyDef.note)}
                    onMouseLeave={() => {
                      if (activeNotes.has(shiftedNote)) handleNoteRelease(keyDef.note);
                    }}
                    style={{ left: `${keyDef.offset}px` }}
                    className={`pointer-events-auto absolute w-11 h-full flex flex-col justify-end items-center pb-4 transition-all duration-75 select-none cursor-pointer rounded-b-md shadow-[2px_4px_10px_rgba(0,0,0,0.8)] z-10 ${isActive ? 'bg-tertiary shadow-[0_0_20px_rgba(163,230,53,0.5)]' : (isSuggested ? 'bg-[#050505] border-x border-b-4 border-tertiary shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'bg-[#050505] hover:bg-[#121212] border-x border-b border-[#262626]/40')}`}
                  >
                    <span className={`font-bold text-sm font-headline transition-colors ${isActive ? 'text-[#050505]' : 'text-on-surface-variant'}`}>{keyDef.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <AITeacher onHighlight={setSuggestedNotes} />

      <footer className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 md:px-12 py-4 bg-surface/90 backdrop-blur-xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
        <button 
           onClick={() => setOctave(o => Math.max(o - 1, -2))}
           className="flex flex-col items-center justify-center text-on-surface-variant p-3 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>keyboard_double_arrow_left</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Octave Down</span>
        </button>
        <button 
           onClick={toggleSustain}
           className={`flex flex-col items-center justify-center p-3 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${sustainActive ? 'text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: sustainActive ? "'FILL' 1, 'wght' 400, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'opsz' 24"}}>vibration</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Sustain</span>
        </button>
        
        <div className="relative group mx-2 md:mx-0">
          <button 
            onClick={handleRecordToggle}
            className={`flex flex-col items-center justify-center rounded-full p-4 transition-all duration-300 md:scale-110 active:scale-95 border relative overflow-hidden group cursor-pointer ${isRecording ? 'bg-error-container/20 text-error border-error shadow-[0_0_20px_rgba(248,113,113,0.3)]' : 'bg-surface-bright text-on-surface-variant border-outline/20 hover:border-outline hover:text-on-surface'}`}
          >
            {isRecording && <div className="absolute inset-0 bg-error/5 animate-pulse-red opacity-100"></div>}
            <span className={`material-symbols-outlined z-10 ${isRecording ? 'animate-pulse-red text-error' : ''}`} style={{fontVariationSettings: isRecording ? "'FILL' 1, 'wght' 400, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'opsz' 24"}}>fiber_manual_record</span>
            <span className="font-headline text-[10px] uppercase tracking-widest mt-1 font-bold z-10">{isRecording ? "Recording" : "Record"}</span>
          </button>
          {isRecording && <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-ping"></div>}
        </div>
        
        <button 
           onClick={() => setMetronomeActive(!metronomeActive)}
           className={`flex flex-col items-center justify-center p-3 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${metronomeActive ? 'text-tertiary drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'text-on-surface-variant hover:text-tertiary'}`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: metronomeActive ? "'FILL' 1, 'wght' 400, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'opsz' 24"}}>timer</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Metronome</span>
        </button>
        <button 
           onClick={() => setOctave(o => Math.min(o + 1, 2))}
           className="flex flex-col items-center justify-center text-on-surface-variant p-3 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'opsz' 24"}}>keyboard_double_arrow_right</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Octave Up</span>
        </button>
      </footer>
    </div>
  )
}

export default App

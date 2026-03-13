import { useState } from 'react'
import usePianoStore from '../store/usePianoStore'
import { toneEngine } from '../audio/ToneEngine'
import { CONFIG } from '../constants/config'
// Using lucide-react icons for premium feel
import { Play, Square, Settings2 } from 'lucide-react'

export function BeginnerOverlay() {
  const [showTutorial, setShowTutorial] = useState(false)

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between overflow-hidden">
      
      {/* Top Bar for Mode Info */}
      <div className="flex justify-between items-start pointer-events-auto p-8 mt-12 w-full">
        <div>
          <h2 className="text-3xl font-light tracking-wide text-[#ededed]">Beginner</h2>
          <p className="text-sm font-light text-[#8a8a8a] mt-2 max-w-sm">
            Press the keys shown on the piano. The camera is focused on the middle octaves to help you learn.
          </p>
        </div>
        
        <button 
          onClick={() => setShowTutorial(!showTutorial)}
          className="px-6 py-3 border border-[#333333] bg-[#0a0a0a]/90 hover:bg-[#111111] text-[#ededed] uppercase tracking-widest text-xs transition-colors"
        >
          {showTutorial ? 'Hide Tutorial' : 'Show Tutorial'}
        </button>
      </div>

      {/* Slide-in YouTube Panel */}
      {showTutorial && (
        <div 
          className="absolute top-32 right-8 pointer-events-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222222] p-4 z-50 shadow-2xl transition-all duration-500 animate-in slide-in-from-right-8 fade-in"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs uppercase tracking-widest text-[#8a8a8a]">Learning Path</span>
            <button onClick={() => setShowTutorial(false)} className="text-[#8a8a8a] hover:text-white">✕</button>
          </div>
          <iframe 
            width="360" 
            height="202" 
            src={CONFIG.YOUTUBE_LINKS.BEGINNER} 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-500"
          ></iframe>
        </div>
      )}
    </div>
  )
}

export function IntermediateOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-8 mt-12">
      <div className="pointer-events-auto">
        <h2 className="text-3xl font-light tracking-wide text-[#ededed]">Intermediate</h2>
        <p className="text-sm font-light text-[#8a8a8a] mt-2 max-w-sm mb-8">
          Full polyphony enabled. Focus on finger positioning and wider octave jumps.
        </p>
        
        <div className="flex flex-col gap-4 w-64">
          <div className="border border-[#1a1a1a] bg-[#050505] p-5">
            <h3 className="text-xs uppercase tracking-widest text-[#8a8a8a] mb-2">Major Scale Focus</h3>
            <p className="font-light text-xl text-[#facc15]">C Major</p>
            <p className="text-xs text-[#525252] mt-1 font-mono tracking-widest">C D E F G A B C</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#050505] p-5">
            <h3 className="text-xs uppercase tracking-widest text-[#8a8a8a] mb-2">Minor Scale Focus</h3>
            <p className="font-light text-xl text-[#facc15]">A Minor</p>
            <p className="text-xs text-[#525252] mt-1 font-mono tracking-widest">A B C D E F G A</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExpertOverlay() {
  const { metronomeActive, toggleMetronome, metronomeBpm, setBpm, sustainMode, toggleSustain } = usePianoStore()

  const handleMetronome = () => {
    if (metronomeActive) {
      toneEngine.stopMetronome()
    } else {
      toneEngine.startMetronome(metronomeBpm)
    }
    toggleMetronome()
  }

  const handleSustain = () => {
    toneEngine.setSustain(!sustainMode)
    toggleSustain()
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-8">
      {/* Absolute top right for pure studio look */}
      <div className="absolute top-8 right-8 pointer-events-auto flex items-center gap-4 text-[#404040] select-none">
        <span className="uppercase tracking-[0.3em] text-xs font-semibold">{sustainMode ? 'SUSTAIN: ON' : 'SUSTAIN: OFF'}</span>
      </div>

      <div className="w-full flex justify-center pointer-events-auto mb-12">
        {/* Prominent, clean Metronome UI resembling studio equipment */}
        <div className="bg-[#020202] border border-[#111111] p-6 flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#555555] mb-2">Metronome</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={handleMetronome}
                className={`w-14 h-14 border flex items-center justify-center transition-all ${metronomeActive ? 'border-[#facc15] text-[#facc15] bg-[#facc15]/10' : 'border-[#333333] text-[#555555] hover:text-[#888888] hover:border-[#888888]'}`}
              >
                {metronomeActive ? <Square size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
              </button>
              
              <div className="flex flex-col items-center">
                <span className="font-light text-4xl tabular-nums tracking-tighter w-20 text-center">{metronomeBpm}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">BPM</span>
              </div>
            </div>
          </div>
          
          <div className="h-16 w-px bg-[#111111]" />
          
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#555555] mb-4 text-center">Tempo</span>
            <input 
              type="range" 
              min="60" max="240" 
              value={metronomeBpm}
              onChange={(e) => {
                const newBpm = parseInt(e.target.value)
                setBpm(newBpm)
                if (metronomeActive) toneEngine.updateBpm(newBpm)
              }}
              // Custom CSS slider styles usually go here, Tailwind handles standard range fine natively if accent colors are set, but let's use a very dark aesthetic.
              className="w-48 h-1 bg-[#1a1a1a] appearance-none cursor-pointer accent-[#facc15]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import Scene3D from './components/Scene3D'
import { BeginnerOverlay, IntermediateOverlay, ExpertOverlay } from './components/ModeOverlays'
import { usePianoEvents } from './hooks/usePianoEvents'
import { toneEngine } from './audio/ToneEngine'
import DesktopGate from './components/DesktopGate'
import LoadingScreen from './components/LoadingScreen'
import { CONFIG } from './constants/config'

function App() {
  const [currentMode, setCurrentMode] = useState(CONFIG.MODES.LANDING)
  const [isAudioInitialized, setAudioInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadStatus, setLoadStatus] = useState('')

  usePianoEvents(currentMode)

  const handleModeChange = async (mode) => {
    if (!isAudioInitialized) {
      setIsLoading(true)
      await Tone.start() // Required user gesture
      
      // Artificial short delay so React can paint the Loading Screen before the main thread locks up
      setTimeout(async () => {
        await toneEngine.init((progress, status) => {
          setLoadProgress(progress)
          setLoadStatus(status)
        })
        setAudioInitialized(true)
        setIsLoading(false)
        setCurrentMode(mode)
        
        // Kick off background loading of remaining octaves
        toneEngine.loadRemainingOctaves()
      }, 50)
    } else {
      setCurrentMode(mode)
    }
  }

  return (
    <DesktopGate>
      <div className="w-full h-screen bg-transparent text-[#ededed] overflow-hidden relative font-outfit">
        {isLoading && <LoadingScreen progress={loadProgress} status={loadStatus} />}
        
        {currentMode === CONFIG.MODES.LANDING && !isLoading && (
          <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col justify-end p-12 md:p-24 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent pointer-events-none">
            {/* Cinematic Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#facc15] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ffffff] rounded-full mix-blend-screen filter blur-[200px] opacity-5" />
            
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmZmZmZc1MiBmaWxsLW9wYWNpdHk9IjAuMDIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />

            <div className="max-w-3xl pointer-events-auto relative z-20">
              <div className="mb-4 inline-block">
                <span className="px-3 py-1 border border-[#333333] tracking-[0.2em] text-[10px] uppercase text-[#888888] bg-[#111111]/50 backdrop-blur-md">
                  Web Audio API + Three.js
                </span>
              </div>
              <h1 className="text-5xl md:text-[5rem] leading-[1.1] font-light mb-6 tracking-tight drop-shadow-2xl">
                Turn your keyboard <br />
                <span className="text-[#8a8a8a]">into a <span className="text-[#ededed]">Piano</span></span>
              </h1>
              <p className="text-lg md:text-xl text-[#8a8a8a] mb-12 font-light max-w-xl">
                A premium browser-based instrument designed for learning, practice, and performance. Select your proficiency to begin.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {[
                  { id: CONFIG.MODES.BEGINNER, name: 'Beginner', desc: 'Guided learning & tutorials' },
                  { id: CONFIG.MODES.INTERMEDIATE, name: 'Intermediate', desc: 'Scales & polyphony' },
                  { id: CONFIG.MODES.EXPERT, name: 'Expert', desc: 'Studio tools & metronome' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className="group relative overflow-hidden bg-[#050505] border border-[#222222] hover:border-[#facc15] px-8 py-6 text-left transition-all duration-500 w-full md:w-auto min-w-[200px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#facc15]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-lg font-light tracking-wider text-[#ededed] mb-1 group-hover:text-[#facc15] transition-colors">{mode.name}</h3>
                    <p className="text-xs tracking-widest uppercase text-[#555555]">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentMode !== CONFIG.MODES.LANDING && !isLoading && (
          <div className="absolute top-8 left-8 z-50">
            <button 
              onClick={() => setCurrentMode(CONFIG.MODES.LANDING)}
              className="px-6 py-2 rounded border border-gray-800 bg-[#020202]/80 hover:bg-[#121212] text-gray-300 text-sm transition-all uppercase tracking-widest"
            >
              Back to Menu
            </button>
          </div>
        )}

        {!isLoading && currentMode === CONFIG.MODES.BEGINNER && <BeginnerOverlay />}
        {!isLoading && currentMode === CONFIG.MODES.INTERMEDIATE && <IntermediateOverlay />}
        {!isLoading && currentMode === CONFIG.MODES.EXPERT && <ExpertOverlay />}

        {/* 3D Canvas goes here behind the UI */}
        <div className="absolute inset-0 z-0 bg-[#020202]">
          <Scene3D mode={currentMode} />
        </div>

      </div>
    </DesktopGate>
  )
}

export default App

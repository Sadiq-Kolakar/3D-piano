export default function LoadingScreen({ progress, status }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#131313] text-[#e2e2e2] font-sans px-8">
      <div className="max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-light tracking-widest uppercase mb-12 text-white font-['Manrope']">
          Initializing Instrument
        </h2>
        
        {/* Loading Bar */}
        <div className="w-full h-px bg-[#353535] relative overflow-hidden mb-6">
          <div 
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-xs font-semibold uppercase text-[#919191] tracking-[0.2em]">
          {status || 'Loading core audio samples...'}
        </p>
      </div>
    </div>
  )
}

export default function LoadingScreen({ progress, status }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-[#ededed] font-outfit px-8">
      <div className="max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-light tracking-widest uppercase mb-12 text-gray-200">
          Initializing Audio Engine
        </h2>
        
        {/* Cinematic Progress Bar */}
        <div className="w-full h-px bg-[#121212] relative overflow-hidden mb-6">
          <div 
            className="absolute top-0 left-0 h-full bg-[#facc15] transition-all duration-300 ease-out shadow-[0_0_10px_#facc15]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm font-light text-gray-500 tracking-wider">
          {status || 'Loading core audio samples...'}
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion' // Need to install framer-motion

export default function DesktopGate({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) 
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="w-full h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-light mb-4 tracking-wide text-gray-200">Desktop Recommended</h1>
        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
          This premium 3D piano experience is best enjoyed on a desktop viewport using a physical computer keyboard.
        </p>
      </div>
    )
  }

  return children
}

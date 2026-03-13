import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import PianoKeyboard3D from './PianoKeyboard3D'

// Animation component to transition camera
const CameraController = ({ mode }) => {
  const cameraRef = useRef()

  useFrame(() => {
    if (!cameraRef.current) return
    const cam = cameraRef.current

    // Target positions depending on mode
    let targetPos = [0, 4, 12]
    let targetLookAt = [0, 0, 0]

    switch (mode) {
      case 'landing':
        // Slowly rotating cinematic view
        targetPos = [0, 6, 20]
        break
      case 'beginner':
        // Zoomed in slightly on middle C area
        targetPos = [0, 6, 8]
        // Offset look at to center around C4
        break
      case 'intermediate':
        // Wider view
        targetPos = [0, 10, 14]
        break
      case 'expert':
        // Full view
        targetPos = [0, 16, 22]
        break
      default:
        targetPos = [0, 4, 12]
        break
    }

    cam.position.lerp({ x: targetPos[0], y: targetPos[1], z: targetPos[2] }, 0.02)
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 6, 20]} />
}

const RotatingGroup = ({ mode, children }) => {
  const groupRef = useRef()

  useFrame(() => {
    if (mode === 'landing') {
      groupRef.current.rotation.y += 0.002
    } else {
      // Smoothly return to center
      groupRef.current.rotation.y = groupRef.current.rotation.y * 0.95
    }
  })

  return <group ref={groupRef}>{children}</group>
}

export default function Scene3D({ mode }) {
  return (
    <Canvas shadows>
      <CameraController mode={mode} />
      
      {/* Orbit control limited differently than before to ensure it stays focused but allows slight tilt */}
      {mode !== 'landing' && (
        <OrbitControls 
          enableZoom={mode === 'expert'} 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
        />
      )}

      {/* Lighting for dark dramatic theme dependent on mode */}
      {mode === 'beginner' ? (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[0, 10, 5]} intensity={1.5} color="#fffcf2" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <spotLight position={[0, 8, 0]} intensity={2} color="#fdfaed" angle={Math.PI / 4} penumbra={1} castShadow />
        </>
      ) : mode === 'expert' ? (
        <>
          <ambientLight intensity={0.1} />
          <spotLight position={[0, 15, 0]} intensity={3} color="#ffffff" angle={Math.PI / 5} penumbra={0.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <pointLight position={[-10, 5, -5]} color="#111111" intensity={1} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <pointLight position={[-5, 5, -5]} color="#1a1a1a" intensity={0.5} />
        </>
      )}

      {/* Environment reflections */}
      <Environment preset="studio" />

      <Suspense fallback={null}>
        <RotatingGroup mode={mode}>
          <PianoKeyboard3D mode={mode} />
        </RotatingGroup>
      </Suspense>

      {/* Subtle floor reflection/shadow receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
      </mesh>
    </Canvas>
  )
}

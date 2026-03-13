import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import usePianoStore from '../store/usePianoStore'

const WHITE_KEY_WIDTH = 1.0
const WHITE_KEY_HEIGHT = 0.5
const WHITE_KEY_DEPTH = 5.0

const BLACK_KEY_WIDTH = 0.6
const BLACK_KEY_HEIGHT = 0.75
const BLACK_KEY_DEPTH = 3.2

// Build typical 88 key data
const buildKeyboardLayout = () => {
  const keys = []
  const notesStr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  let currentWhiteOffset = 0
  
  // Starting note for 88 keys is A0, which is index 9
  // We'll just generate from C1 to C8 for simplicity (7 octaves + 1 note)
  
  for (let octave = 1; octave <= 7; octave++) {
    notesStr.forEach((noteClass) => {
      const isBlack = noteClass.includes('#')
      const noteName = `${noteClass}${octave}`
      
      let xPos = 0
      if (!isBlack) {
        xPos = currentWhiteOffset * WHITE_KEY_WIDTH
        keys.push({ note: noteName, isBlack, x: xPos, z: 0 })
        currentWhiteOffset++
      } else {
        // Black keys are positioned between adjacent white keys
        xPos = (currentWhiteOffset - 1) * WHITE_KEY_WIDTH + (WHITE_KEY_WIDTH / 2)
        // Adjust slightly center them
        keys.push({ note: noteName, isBlack, x: xPos, z: -0.9 })
      }
    })
  }

  // Add final C8
  keys.push({ 
    note: 'C8', 
    isBlack: false, 
    x: currentWhiteOffset * WHITE_KEY_WIDTH, 
    z: 0 
  })

  return { keys, totalWidth: currentWhiteOffset * WHITE_KEY_WIDTH }
}

const PianoKey = ({ note, isBlack, position, showLabel, labelOverride }) => {
  const activeNotes = usePianoStore(state => state.activeNotes)
  const isActive = activeNotes.has(note)
  const keyRef = useRef()

  // Animate press with smooth damping instead of linear lerp for premium feel
  useFrame((state, delta) => {
    if (keyRef.current) {
      const targetRotationX = isActive ? 0.04 : 0 // slight tilt when pressed
      // Using damp for physics-like smoother easing
      keyRef.current.rotation.x = THREE.MathUtils.damp(keyRef.current.rotation.x, targetRotationX, 15, delta)
    }
  })

  // Premium colors
  const baseColor = isBlack ? '#111111' : '#f0f0f0'
  const activeColor = isBlack ? '#eab308' : '#fef08a' // Champagne yellow/gold tone

  const width = isBlack ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH
  const height = isBlack ? BLACK_KEY_HEIGHT : WHITE_KEY_HEIGHT
  const depth = isBlack ? BLACK_KEY_DEPTH : WHITE_KEY_DEPTH
  
  const yAdjust = isBlack ? height / 2 : 0

  return (
    <group position={position} ref={keyRef}>
      <mesh position={[0, yAdjust, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.9, height, depth]} />
        <meshStandardMaterial 
          color={isActive ? activeColor : baseColor} 
          roughness={0.15} 
          metalness={0.2}
          emissive={isActive ? activeColor : '#000000'}
          emissiveIntensity={isActive ? 0.4 : 0}
        />
      </mesh>
      
      {showLabel && (
        <Text
          position={[0, height + 0.05, depth / 2 - 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.25}
          color={isBlack ? '#999999' : '#333333'}
          font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0Ew.woff" // Using Outfit to match
        >
          {labelOverride || note}
        </Text>
      )}
    </group>
  )
}

export default function PianoKeyboard3D({ mode }) {
  const { keys, totalWidth } = useMemo(() => buildKeyboardLayout(), [])
  
  // Center the keyboard
  const xOffset = -totalWidth / 2

  // Only show labels in beginner mode
  const showLabels = mode === 'beginner'

  return (
    <group position={[xOffset, 0, 0]}>
      {keys.map((key) => {
        // In beginner mode, we only explicitly label the C4-C5 octave region or white keys, but for now label all.
        // The prompt asks to "tell the user what to press". Let's show the PC key mapping instead of just notes.
        let displayLabel = key.note
        if (mode === 'beginner') {
          // Find the PC key for this note to show it to the user directly on the 3D key!
          // We need an inverse map. Let's build a simple one locally for beginner display.
          const inverseMap = {
            'C4': 'A', 'C#4': 'W', 'D4': 'S', 'D#4': 'E', 'E4': 'D', 'F4': 'F',
            'F#4': 'T', 'G4': 'G', 'G#4': 'Y', 'A4': 'H', 'A#4': 'U', 'B4': 'J',
            'C3': 'Z', 'C#3': 'S', 'D3': 'X', 'D#3': 'D', 'E3': 'C', 'F3': 'V',
            'F#3': 'G', 'G3': 'B', 'G#3': 'H', 'A3': 'N', 'A#3': 'J', 'B3': 'M'
          }
          displayLabel = inverseMap[key.note] || ''
        }
        
        return (
          <PianoKey 
            key={key.note}
            note={key.note}
            isBlack={key.isBlack}
            position={[key.x, 0, key.z]}
            showLabel={showLabels && displayLabel !== ''}
            labelOverride={displayLabel}
          />
        )
      })}
    </group>
  )
}

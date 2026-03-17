'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import FloatingShapes from './FloatingShapes'

function CameraController() {
  const { camera, mouse } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8))

  useFrame(() => {
    // Enhanced mouse tracking with smooth parallax
    const x = mouse.x * 0.5
    const y = mouse.y * 0.3

    targetPosition.current.set(x, y, 8)
    
    // Smoother camera movement with easing
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.05
    camera.position.y += (targetPosition.current.y - camera.position.y) * 0.05
    camera.position.z += (targetPosition.current.z - camera.position.z) * 0.02
    
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Create a procedural environment map
function createEnvironmentMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Create a gradient background for environment
  const gradient = ctx.createLinearGradient(0, 0, 512, 512)
  gradient.addColorStop(0, '#0a0a1a')
  gradient.addColorStop(0.5, '#1a1a3f')
  gradient.addColorStop(1, '#0a0a1a')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)
  
  // Add subtle noise/texture
  const imageData = ctx.getImageData(0, 0, 512, 512)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 20
    data[i] += noise
    data[i + 1] += noise * 0.8
    data[i + 2] += noise * 1.2
  }
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function Scene() {
  const envTexture = useMemo(() => createEnvironmentMap(), [])
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
      <CameraController />
      
      {/* Enhanced lighting for better visual depth */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#6366f1" />
      <pointLight position={[0, 0, 10]} intensity={0.4} color="#a855f7" />
      
      {/* Improved fog for depth perception */}
      <fog attach="fog" args={['#000000', 5, 30]} />
      
      {/* Background environment sphere with shader for subtle glow */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial 
          map={envTexture}
          side={THREE.BackSide}
          transparent
          opacity={0.15}
        />
      </mesh>
      
      <FloatingShapes />
    </>
  )
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
        }}
        style={{ background: '#000000' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

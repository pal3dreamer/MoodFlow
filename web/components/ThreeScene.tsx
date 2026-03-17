'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import FloatingShapes from './FloatingShapes'

function CameraController() {
  const { camera, mouse } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8))

  useFrame(() => {
    const x = mouse.x * 0.3
    const y = mouse.y * 0.2

    targetPosition.current.set(x, y, 8)
    
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.02
    camera.position.y += (targetPosition.current.y - camera.position.y) * 0.02
    
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
      <CameraController />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6366f1" />
      
      <fog attach="fog" args={['#000000', 8, 25]} />
      
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
        }}
        style={{ background: '#000000' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ShapeData {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  type: 'cube' | 'sphere' | 'octahedron' | 'torus' | 'icosahedron'
  speed: number
}

function FloatingShape({ position, rotation, scale, color, type, speed }: ShapeData) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const initialY = position[1]
  const initialX = position[0]
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    meshRef.current.position.y = initialY + Math.sin(time * speed + position[0]) * 0.4
    meshRef.current.position.x = initialX + Math.cos(time * speed * 0.5) * 0.2
    meshRef.current.rotation.x += 0.001 * speed
    meshRef.current.rotation.y += 0.002 * speed
    
    const targetScale = hovered ? scale * 1.1 : scale
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  const geometry = useMemo(() => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1)
      case 'sphere':
        return new THREE.SphereGeometry(0.6, 24, 24)
      case 'octahedron':
        return new THREE.OctahedronGeometry(0.7)
      case 'torus':
        return new THREE.TorusGeometry(0.5, 0.2, 16, 32)
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(0.6)
    }
  }, [type])

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={geometry}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <meshStandardMaterial
        color={hovered ? '#ffffff' : color}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

export default function FloatingShapes() {
  const shapes: ShapeData[] = useMemo(() => [
    { position: [-6, 3, -6], rotation: [0.5, 0.3, 0], scale: 0.9, color: '#ffffff', type: 'cube', speed: 0.4 },
    { position: [-4, 1, -4], rotation: [0.2, 0.5, 0.1], scale: 0.5, color: '#6366f1', type: 'sphere', speed: 0.6 },
    { position: [-3, 4, -5], rotation: [0.3, 0.2, 0.4], scale: 0.6, color: '#a855f7', type: 'octahedron', speed: 0.5 },
    { position: [-2, 0, -3], rotation: [0.1, 0.4, 0.2], scale: 0.4, color: '#ec4899', type: 'torus', speed: 0.7 },
    { position: [-1, 2.5, -4], rotation: [0.4, 0.1, 0.3], scale: 0.5, color: '#14b8a6', type: 'icosahedron', speed: 0.5 },
    { position: [0, 0.5, -3], rotation: [0.2, 0.3, 0.1], scale: 0.6, color: '#f97316', type: 'cube', speed: 0.6 },
    
    { position: [1, 3.5, -5], rotation: [0.3, 0.2, 0.4], scale: 0.5, color: '#ffffff', type: 'octahedron', speed: 0.4 },
    { position: [2, 1, -4], rotation: [0.1, 0.4, 0.2], scale: 0.7, color: '#6366f1', type: 'sphere', speed: 0.5 },
    { position: [3, 4, -6], rotation: [0.4, 0.1, 0.3], scale: 0.4, color: '#a855f7', type: 'torus', speed: 0.6 },
    { position: [4, 0, -4], rotation: [0.2, 0.3, 0.1], scale: 0.8, color: '#ec4899', type: 'icosahedron', speed: 0.4 },
    { position: [5, 2, -5], rotation: [0.1, 0.2, 0.4], scale: 0.5, color: '#14b8a6', type: 'cube', speed: 0.7 },
    { position: [6, 3.5, -3], rotation: [0.3, 0.1, 0.2], scale: 0.6, color: '#f97316', type: 'sphere', speed: 0.5 },
    
    { position: [-5, -1, -5], rotation: [0.2, 0.4, 0.1], scale: 0.5, color: '#ffffff', type: 'octahedron', speed: 0.5 },
    { position: [-2, -1, -4], rotation: [0.1, 0.3, 0.2], scale: 0.6, color: '#6366f1', type: 'torus', speed: 0.6 },
    { position: [1, -1, -3], rotation: [0.4, 0.2, 0.1], scale: 0.4, color: '#a855f7', type: 'cube', speed: 0.7 },
    { position: [4, -1, -5], rotation: [0.3, 0.1, 0.4], scale: 0.7, color: '#ec4899', type: 'sphere', speed: 0.4 },
    
    { position: [-4, 5, -6], rotation: [0.1, 0.2, 0.3], scale: 0.5, color: '#14b8a6', type: 'icosahedron', speed: 0.5 },
    { position: [0, 5, -5], rotation: [0.2, 0.4, 0.1], scale: 0.6, color: '#f97316', type: 'octahedron', speed: 0.4 },
    { position: [5, 5, -6], rotation: [0.3, 0.2, 0.1], scale: 0.4, color: '#ffffff', type: 'torus', speed: 0.6 },
    
    { position: [-7, 2, -7], rotation: [0.4, 0.3, 0.2], scale: 0.4, color: '#6366f1', type: 'cube', speed: 0.3 },
    { position: [7, 1, -7], rotation: [0.2, 0.1, 0.4], scale: 0.5, color: '#a855f7', type: 'sphere', speed: 0.35 },
  ], [])

  return (
    <group>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </group>
  )
}

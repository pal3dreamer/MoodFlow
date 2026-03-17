'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const gridRef = useRef<THREE.Group>(null)

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#00f0ff') },
        uFadeDistance: { value: 30.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vDistance = length(worldPosition.xz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uFadeDistance;
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
          float fade = 1.0 - smoothstep(0.0, uFadeDistance, vDistance);
          float alpha = fade * 0.3;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  return (
    <group ref={gridRef} position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <gridHelper args={[40, 40, '#00f0ff', '#00f0ff']} />
      <mesh material={gridMaterial}>
        <planeGeometry args={[40, 40]} />
      </mesh>
    </group>
  )
}

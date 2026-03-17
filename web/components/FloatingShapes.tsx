'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'

interface ShapeData {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  type: 'roundedBox' | 'sphere' | 'roundedCylinder' | 'cone' | 'torus'
  speed: number
}

// Vertex shader for enhanced light reflection
const reflectionVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader for glossy Spline-style reflections
const reflectionFragmentShader = `
  uniform vec3 uColor;
  uniform float uMetalness;
  uniform float uRoughness;
  uniform vec3 uEmissive;
  uniform float uEmissiveIntensity;
  uniform samplerCube uEnvMap;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  // Light sources matching ThreeScene setup
  uniform vec3 uLightPos1;
  uniform vec3 uLightColor1;
  uniform float uLightIntensity1;

  uniform vec3 uLightPos2;
  uniform vec3 uLightColor2;
  uniform float uLightIntensity2;

  uniform vec3 uLightPos3;
  uniform vec3 uLightColor3;
  uniform float uLightIntensity3;

  uniform vec3 uAmbientLight;

  float specularHighlight(vec3 normal, vec3 lightDir, vec3 viewDir, float roughness) {
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), (1.0 - roughness) * 256.0);
    return spec;
  }

  vec3 fresnelEffect(vec3 viewDir, vec3 normal, vec3 baseColor) {
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.5);
    return mix(baseColor, vec3(1.0), fresnel * 0.5);
  }

  vec3 getEnvironmentColor(vec3 reflected) {
    return vec3(0.15, 0.2, 0.35);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDirection);
    
    // Base color with stronger fresnel effect for glossy look
    vec3 color = fresnelEffect(viewDir, normal, uColor);
    
    // Ambient lighting
    vec3 lighting = uAmbientLight * color * 0.8;
    
    // Calculate reflections from each light source with enhanced specular
    for(int i = 0; i < 3; i++) {
      vec3 lightPos, lightColor;
      float lightIntensity;
      
      if(i == 0) {
        lightPos = uLightPos1;
        lightColor = uLightColor1;
        lightIntensity = uLightIntensity1;
      } else if(i == 1) {
        lightPos = uLightPos2;
        lightColor = uLightColor2;
        lightIntensity = uLightIntensity2;
      } else {
        lightPos = uLightPos3;
        lightColor = uLightColor3;
        lightIntensity = uLightIntensity3;
      }
      
      vec3 lightDir = normalize(lightPos - vPosition);
      float distance = length(lightPos - vPosition);
      float attenuation = 1.0 / (1.0 + distance * 0.08);
      
      // Diffuse reflection
      float diffuse = max(dot(normal, lightDir), 0.0);
      
      // Enhanced specular reflection for glossy surface
      float specular = specularHighlight(normal, lightDir, viewDir, uRoughness);
      float metallicSpecular = mix(specular * 2.0, specular * 3.0 * uMetalness, 0.6);
      
      // Combine light contributions
      vec3 lightContribution = lightColor * lightIntensity * attenuation;
      lighting += lightContribution * (diffuse * color * 0.6 + metallicSpecular * 2.0);
    }
    
    // Strong environment reflection for glossy look
    if(uMetalness > 0.2) {
      vec3 reflected = reflect(-viewDir, normal);
      vec3 envColor = getEnvironmentColor(reflected);
      float reflectionInfluence = uMetalness * (1.0 - uRoughness) * 1.5;
      lighting += envColor * reflectionInfluence * 0.8;
    }
    
    // Add emissive glow with higher intensity
    lighting += uEmissive * uEmissiveIntensity * 1.2;
    
    // Strong specular shine for glossy plastic look
    if(uMetalness > 0.4) {
      vec3 reflectedView = reflect(-viewDir, normal);
      lighting += vec3(1.0) * uMetalness * pow(max(0.0, dot(reflectedView, -vViewDirection)), 1.5) * 0.6;
    }
    
    gl_FragColor = vec4(lighting, 1.0);
  }
`

function FloatingShape({ position, rotation, scale, color, type, speed }: ShapeData) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { mouse, scene } = useThree()
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3())
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const initialY = position[1]
  const initialX = position[0]
  const initialZ = position[2]
  
  // Convert hex color to THREE.Color for shader
  const colorObj = useMemo(() => new THREE.Color(color), [color])
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Base floating animation
    let targetX = initialX + Math.sin(time * speed * 0.5) * 0.8
    let targetY = initialY + Math.sin(time * speed + position[0]) * 0.6
    let targetZ = initialZ + Math.cos(time * speed * 0.3) * 0.4
    
    // Mouse parallax effect - objects follow mouse cursor
    if (!dragging) {
      targetX += mouse.x * 2
      targetY += mouse.y * 1.5
    }
    
    // Smooth animation to target position
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.08
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.08
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.08
    
    // Continuous rotation with mouse influence
    meshRef.current.rotation.x += 0.001 * speed
    meshRef.current.rotation.y += 0.002 * speed + mouse.x * 0.01
    meshRef.current.rotation.z += mouse.y * 0.005
    
    // Hover and drag scale animation
    const targetScale = hovered || dragging ? scale * 1.2 : scale
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
    
    // Update shader uniforms for glossy appearance
    const targetMetalness = (hovered || dragging) ? 0.9 : 0.6
    const targetRoughness = (hovered || dragging) ? 0.05 : 0.15
    const targetEmissiveIntensity = (hovered || dragging) ? 0.8 : 0.25
    
    materialRef.current.uniforms.uMetalness.value += (targetMetalness - materialRef.current.uniforms.uMetalness.value) * 0.1
    materialRef.current.uniforms.uRoughness.value += (targetRoughness - materialRef.current.uniforms.uRoughness.value) * 0.1
    materialRef.current.uniforms.uEmissiveIntensity.value += (targetEmissiveIntensity - materialRef.current.uniforms.uEmissiveIntensity.value) * 0.1
    
    // Update emissive color based on hover
    if (hovered || dragging) {
      materialRef.current.uniforms.uEmissive.value.lerp(colorObj, 0.2)
    } else {
      materialRef.current.uniforms.uEmissive.value.lerp(new THREE.Color(0, 0, 0), 0.1)
    }
  })

  const geometry = useMemo(() => {
    switch (type) {
      case 'roundedBox':
        // Create rounded box with smooth corners (radius 0.15)
        return new RoundedBoxGeometry(1, 1, 1, 4, 0.15)
      case 'sphere':
        // Create smooth sphere with high segment count
        return new THREE.SphereGeometry(0.6, 32, 32)
      case 'roundedCylinder':
        // Create cylinder with rounded edges
        const cylGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 16)
        // Apply smoothing to edges
        cylGeometry.deleteAttribute('normal')
        cylGeometry.computeVertexNormals()
        return cylGeometry
      case 'cone':
        // Create cone shape (naturally has rounded appearance with high segments)
        return new THREE.ConeGeometry(0.6, 1.2, 32, 16)
      case 'torus':
        // Create rounded torus
        return new THREE.TorusGeometry(0.5, 0.2, 32, 32)
      default:
        return new RoundedBoxGeometry(1, 1, 1, 4, 0.15)
    }
  }, [type])

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={geometry}
      onPointerOver={(e) => { 
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => { 
        setHovered(false)
        if (!dragging) document.body.style.cursor = 'auto'
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        setDragging(true)
        document.body.style.cursor = 'grabbing'
        if (meshRef.current) {
          setDragOffset(meshRef.current.position.clone())
        }
      }}
      onPointerUp={() => {
        setDragging(false)
        document.body.style.cursor = hovered ? 'grab' : 'auto'
      }}
      onPointerMove={(e: any) => {
        if (dragging && meshRef.current) {
          e.stopPropagation()
          // Allow mouse-based dragging
          meshRef.current.position.x = dragOffset.x + e.ndc.x * 3
          meshRef.current.position.y = dragOffset.y - e.ndc.y * 3
        }
      }}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={reflectionVertexShader}
        fragmentShader={reflectionFragmentShader}
        uniforms={{
          uColor: { value: colorObj },
          uMetalness: { value: 0.6 },
          uRoughness: { value: 0.15 },
          uEmissive: { value: new THREE.Color(0, 0, 0) },
          uEmissiveIntensity: { value: 0.25 },
          
          // Main light (white)
          uLightPos1: { value: new THREE.Vector3(10, 10, 10) },
          uLightColor1: { value: new THREE.Color('#ffffff') },
          uLightIntensity1: { value: 1.2 },
          
          // Secondary light (blue)
          uLightPos2: { value: new THREE.Vector3(-10, -10, -10) },
          uLightColor2: { value: new THREE.Color('#6366f1') },
          uLightIntensity2: { value: 0.6 },
          
          // Tertiary light (purple)
          uLightPos3: { value: new THREE.Vector3(0, 0, 10) },
          uLightColor3: { value: new THREE.Color('#a855f7') },
          uLightIntensity3: { value: 0.4 },
          
          // Ambient light
          uAmbientLight: { value: new THREE.Color(0.6, 0.6, 0.6) },
        }}
      />
    </mesh>
  )
}

export default function FloatingShapes() {
  const shapes: ShapeData[] = useMemo(() => [
    // Vibrant Spline-inspired color palette with variety of shapes
    { position: [-6, 3, -6], rotation: [0.5, 0.3, 0], scale: 0.9, color: '#ec4899', type: 'roundedBox', speed: 0.4 },
    { position: [-4, 1, -4], rotation: [0.2, 0.5, 0.1], scale: 0.5, color: '#3b82f6', type: 'sphere', speed: 0.6 },
    { position: [-3, 4, -5], rotation: [0.3, 0.2, 0.4], scale: 0.6, color: '#a855f7', type: 'roundedCylinder', speed: 0.5 },
    { position: [-2, 0, -3], rotation: [0.1, 0.4, 0.2], scale: 0.4, color: '#ec4899', type: 'cone', speed: 0.7 },
    { position: [-1, 2.5, -4], rotation: [0.4, 0.1, 0.3], scale: 0.5, color: '#10b981', type: 'torus', speed: 0.5 },
    { position: [0, 0.5, -3], rotation: [0.2, 0.3, 0.1], scale: 0.6, color: '#fbbf24', type: 'roundedBox', speed: 0.6 },
    
    { position: [1, 3.5, -5], rotation: [0.3, 0.2, 0.4], scale: 0.5, color: '#ffffff', type: 'sphere', speed: 0.4 },
    { position: [2, 1, -4], rotation: [0.1, 0.4, 0.2], scale: 0.7, color: '#3b82f6', type: 'roundedBox', speed: 0.5 },
    { position: [3, 4, -6], rotation: [0.4, 0.1, 0.3], scale: 0.4, color: '#a855f7', type: 'cone', speed: 0.6 },
    { position: [4, 0, -4], rotation: [0.2, 0.3, 0.1], scale: 0.8, color: '#ec4899', type: 'torus', speed: 0.4 },
    { position: [5, 2, -5], rotation: [0.1, 0.2, 0.4], scale: 0.5, color: '#10b981', type: 'roundedCylinder', speed: 0.7 },
    { position: [6, 3.5, -3], rotation: [0.3, 0.1, 0.2], scale: 0.6, color: '#fbbf24', type: 'sphere', speed: 0.5 },
    
    { position: [-5, -1, -5], rotation: [0.2, 0.4, 0.1], scale: 0.5, color: '#ffffff', type: 'roundedBox', speed: 0.5 },
    { position: [-2, -1, -4], rotation: [0.1, 0.3, 0.2], scale: 0.6, color: '#3b82f6', type: 'cone', speed: 0.6 },
    { position: [1, -1, -3], rotation: [0.4, 0.2, 0.1], scale: 0.4, color: '#a855f7', type: 'roundedCylinder', speed: 0.7 },
    { position: [4, -1, -5], rotation: [0.3, 0.1, 0.4], scale: 0.7, color: '#ec4899', type: 'sphere', speed: 0.4 },
    
    { position: [-4, 5, -6], rotation: [0.1, 0.2, 0.3], scale: 0.5, color: '#10b981', type: 'torus', speed: 0.5 },
    { position: [0, 5, -5], rotation: [0.2, 0.4, 0.1], scale: 0.6, color: '#fbbf24', type: 'roundedBox', speed: 0.4 },
    { position: [5, 5, -6], rotation: [0.3, 0.2, 0.1], scale: 0.4, color: '#ffffff', type: 'sphere', speed: 0.6 },
    
    { position: [-7, 2, -7], rotation: [0.4, 0.3, 0.2], scale: 0.4, color: '#3b82f6', type: 'roundedCylinder', speed: 0.3 },
    { position: [7, 1, -7], rotation: [0.2, 0.1, 0.4], scale: 0.5, color: '#a855f7', type: 'cone', speed: 0.35 },
  ], [])

  return (
    <group>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </group>
  )
}

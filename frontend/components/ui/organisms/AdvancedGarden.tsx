'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Sparkles, MeshReflectorMaterial, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Vector3, MathUtils, Color } from 'three'
import * as THREE from 'three'

interface Echo {
  id: number
  mood_score: number
  emotion_tags: string[]
  seed_type: string
  growth_stage: number
  created_at: string
}

interface AdvancedGardenProps {
  echoes: Echo[]
  wellness_score: number
}

// Procedural flower component with physics and interactive glow
function ProceduralFlower({ position, moodScore, emotionTags, growthStage, seedType }: {
  position: [number, number, number]
  moodScore: number
  emotionTags: string[]
  growthStage: number
  seedType: string
}) {
  const flowerRef = useRef<THREE.Group>(null)
  const petalRefs = useRef<THREE.Mesh[]>([])
  const [hovered, setHovered] = useState(false)
  
  // Enhanced color mapping based on specific emotions and scenarios
  const emotionColorMap: Record<string, { color: string, glow: string, description: string }> = {
    // Positive Emotions
    joy: { color: '#FFD700', glow: '#FFA500', description: 'Radiant golden sunshine' },
    gratitude: { color: '#FF69B4', glow: '#FF1493', description: 'Warm pink appreciation' },
    hope: { color: '#98FB98', glow: '#00FF00', description: 'Fresh green optimism' },
    calm: { color: '#87CEEB', glow: '#4682B4', description: 'Peaceful sky blue' },
    excited: { color: '#FF6347', glow: '#FF4500', description: 'Vibrant coral energy' },
    proud: { color: '#9370DB', glow: '#8A2BE2', description: 'Royal purple confidence' },
    love: { color: '#FF1493', glow: '#C71585', description: 'Deep magenta affection' },
    
    // Growth & Learning
    growth: { color: '#32CD32', glow: '#228B22', description: 'Lush green progress' },
    inspired: { color: '#FFB6C1', glow: '#FF69B4', description: 'Light pink creativity' },
    motivated: { color: '#FFA500', glow: '#FF8C00', description: 'Bright orange drive' },
    
    // Challenging Emotions
    anxiety: { color: '#9370DB', glow: '#6A5ACD', description: 'Soft purple worry' },
    sadness: { color: '#4682B4', glow: '#1E90FF', description: 'Deep blue melancholy' },
    anger: { color: '#DC143C', glow: '#B22222', description: 'Intense red fire' },
    fear: { color: '#8B4789', glow: '#663399', description: 'Dark purple concern' },
    overwhelmed: { color: '#708090', glow: '#2F4F4F', description: 'Heavy slate gray' },
    lonely: { color: '#6495ED', glow: '#4169E1', description: 'Distant cornflower blue' },
    frustrated: { color: '#CD5C5C', glow: '#8B0000', description: 'Burnt coral tension' },
    
    // Neutral & Reflective
    neutral: { color: '#F0E68C', glow: '#DAA520', description: 'Gentle khaki balance' },
    reflective: { color: '#B0C4DE', glow: '#778899', description: 'Thoughtful steel blue' },
    curious: { color: '#20B2AA', glow: '#008B8B', description: 'Teal exploration' },
    peaceful: { color: '#AFEEEE', glow: '#48D1CC', description: 'Tranquil turquoise' }
  }
  
  const primaryEmotion = emotionTags[0]?.toLowerCase() || 'neutral'
  const emotionData = emotionColorMap[primaryEmotion] || emotionColorMap.neutral
  const flowerColor = emotionData.color
  const glowColor = emotionData.glow
  
  // Unique positioning based on emotion intensity
  const heightVariation = moodScore > 0 ? 0.3 : -0.05 // Positive emotions grow taller
  const adjustedPosition: [number, number, number] = [
    position[0], 
    position[1] + heightVariation, 
    position[2]
  ]
  
  // Scale based on growth stage, mood, and seed type
  const baseScale = growthStage * (0.4 + Math.abs(moodScore) * 0.3)
  const scale = seedType === 'gratitude' ? baseScale * 1.3 : baseScale
  
  // Petal count varies by seed type and emotion
  const petalCount = 
    seedType === 'gratitude' ? 8 : 
    seedType === 'joy' ? 12 : 
    primaryEmotion === 'love' ? 10 :
    primaryEmotion === 'hope' ? 7 : 6
  
  // Animate flower swaying and interactive blooming
  useFrame((state) => {
    if (!flowerRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Gentle swaying
    flowerRef.current.rotation.z = Math.sin(time * 0.5) * 0.15
    flowerRef.current.rotation.x = Math.cos(time * 0.3) * 0.05
    
    // Breathing effect
    const breathe = 1 + Math.sin(time * 0.8) * 0.05
    flowerRef.current.scale.set(scale * breathe, scale * breathe, scale * breathe)
    
    // Interactive petal animation on hover
    petalRefs.current.forEach((petal, i) => {
      if (petal) {
        const hoverScale = hovered ? 1.2 : 1
        const wiggle = Math.sin(time * 2 + i) * 0.1
        petal.rotation.x = (hovered ? Math.PI / 2.5 : Math.PI / 3) + wiggle
      }
    })
  })
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group 
        ref={flowerRef} 
        position={adjustedPosition} 
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Glowing stem with gradient */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 1, 12]} />
          <meshStandardMaterial 
            color="#3d5a28" 
            emissive="#2d4518"
            emissiveIntensity={0.2}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        
        {/* Enhanced leaves with veins */}
        {[...Array(4)].map((_, i) => (
          <group key={`leaf-group-${i}`}>
            <mesh 
              position={[
                Math.cos(i * 1.5) * 0.18,
                -0.25 + i * 0.12,
                Math.sin(i * 1.5) * 0.18
              ]}
              rotation={[0, i * 1.5, Math.PI / 3.5]}
              castShadow
            >
              <sphereGeometry args={[0.1, 12, 12, 0, Math.PI]} />
              <meshStandardMaterial 
                color="#5a8c2a" 
                emissive="#3d5a18"
                emissiveIntensity={0.15}
                roughness={0.5}
                metalness={0.05}
              />
            </mesh>
            {/* Leaf veins */}
            <mesh
              position={[
                Math.cos(i * 1.5) * 0.18,
                -0.25 + i * 0.12,
                Math.sin(i * 1.5) * 0.18
              ]}
              rotation={[0, i * 1.5, Math.PI / 3.5]}
            >
              <sphereGeometry args={[0.095, 8, 8, 0, Math.PI]} />
              <meshBasicMaterial color="#4a7020" wireframe />
            </mesh>
          </group>
        ))}
        
        {/* Flower head with complex structure */}
        <group position={[0, 0.5, 0]}>
          {/* Center with pulsating glow */}
          <mesh castShadow>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial 
              color={glowColor} 
              emissive={glowColor} 
              emissiveIntensity={hovered ? 1.2 : 0.8} 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          
          {/* Inner glow sphere */}
          <mesh scale={1.1}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshBasicMaterial 
              color={glowColor} 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* Petals with layered design */}
          {[...Array(petalCount)].map((_, i) => {
            const angle = (i / petalCount) * Math.PI * 2
            const x = Math.cos(angle) * 0.18
            const z = Math.sin(angle) * 0.18
            
            return (
              <group key={i} rotation={[0, angle, 0]}>
                {/* Main petal */}
                <mesh
                  ref={(el) => { if (el) petalRefs.current[i] = el }}
                  position={[x, 0, z]}
                  rotation={[Math.PI / 3, 0, 0]}
                  castShadow
                >
                  <sphereGeometry args={[0.12, 16, 16, 0, Math.PI, 0, Math.PI]} />
                  <meshStandardMaterial 
                    color={flowerColor} 
                    emissive={flowerColor}
                    emissiveIntensity={moodScore > 0 ? 0.6 : 0.2}
                    roughness={0.3}
                    metalness={0.3}
                  />
                </mesh>
                
                {/* Petal outline for depth */}
                <mesh
                  position={[x, 0, z]}
                  rotation={[Math.PI / 3, 0, 0]}
                  scale={1.02}
                >
                  <sphereGeometry args={[0.12, 12, 12, 0, Math.PI, 0, Math.PI]} />
                  <meshBasicMaterial 
                    color={glowColor} 
                    wireframe
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              </group>
            )
          })}
          
          {/* Dynamic light for positive emotions */}
          {moodScore > 0.2 && (
            <pointLight 
              color={flowerColor} 
              intensity={hovered ? moodScore * 4 : moodScore * 2} 
              distance={2}
              decay={2}
            />
          )}
          
          {/* Sparkle ring for high growth */}
          {growthStage >= 3 && (
            <Sparkles
              count={20}
              scale={0.8}
              size={2}
              speed={0.4}
              opacity={0.6}
              color={flowerColor}
            />
          )}
        </group>
        
        {/* Magical particle aura for fully grown flowers */}
        {growthStage >= 3 && (
          <MagicAura color={flowerColor} intensity={moodScore} />
        )}
        
        {/* Floating pollen particles */}
        {hovered && <FloatingPollen color={flowerColor} />}
      </group>
    </Float>
  )
}

// Magical aura effect for fully grown flowers
function MagicAura({ color, intensity }: { color: string, intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <torusGeometry args={[0.4, 0.05, 16, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={Math.abs(intensity) * 0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Floating pollen particles on hover
function FloatingPollen({ color }: { color: string }) {
  const particles = useMemo(() => {
    return [...Array(15)].map(() => ({
      position: new Vector3(
        MathUtils.randFloatSpread(0.6),
        MathUtils.randFloat(0.3, 1),
        MathUtils.randFloatSpread(0.6)
      ),
      speed: MathUtils.randFloat(0.5, 1.5)
    }))
  }, [])
  
  return (
    <>
      {particles.map((particle, i) => (
        <PollenParticle 
          key={i} 
          position={particle.position} 
          color={color}
          speed={particle.speed}
        />
      ))}
    </>
  )
}

function PollenParticle({ position, color, speed }: { position: Vector3, color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * speed) * 0.3
      meshRef.current.position.x = position.x + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8}
      />
    </mesh>
  )
}

// GPU-based particle system for ambient atmosphere
function GPUParticleSystem({ count, color }: { count: number, color: string }) {
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new Vector3(
          MathUtils.randFloatSpread(15),
          MathUtils.randFloat(0, 5),
          MathUtils.randFloatSpread(15)
        ),
        scale: MathUtils.randFloat(0.01, 0.04),
        speed: MathUtils.randFloat(0.3, 1)
      })
    }
    return temp
  }, [count])
  
  return (
    <>
      {particles.map((particle, i) => (
        <Float key={i} speed={particle.speed} floatIntensity={1}>
          <mesh position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.4} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// Magical particle system with trails
function ParticleSystem({ color, count, spread }: { color: string, count: number, spread: number }) {
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new Vector3(
          MathUtils.randFloatSpread(spread),
          MathUtils.randFloat(0.5, 1.5),
          MathUtils.randFloatSpread(spread)
        ),
        scale: MathUtils.randFloat(0.015, 0.04)
      })
    }
    return temp
  }, [count, spread])
  
  return (
    <>
      {particles.map((particle, i) => (
        <Float key={i} speed={MathUtils.randFloat(1, 3)} floatIntensity={2}>
          <mesh position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// Enhanced ground with reflections and organic grass
function Garden({ size, wellness_score }: { size: number, wellness_score: number }) {
  // Ground color changes based on wellness score
  const groundColor = useMemo(() => {
    if (wellness_score > 70) return '#3a6a2a' // Vibrant green
    if (wellness_score > 40) return '#3a5a2a' // Medium green
    return '#2a4a2a' // Darker green
  }, [wellness_score])
  
  return (
    <group>
      {/* Reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[size, 64]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.5}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={groundColor}
          metalness={0.2}
        />
      </mesh>
      
      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.4}
        scale={size * 1.5}
        blur={2}
        far={4}
      />
      
      {/* Enhanced grass blades - More numerous and varied */}
      {[...Array(120)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * size * 0.95
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = Math.random() * 0.3 + 0.15
        const bendAngle = Math.random() * 0.4
        
        return (
          <Float key={i} speed={0.5} floatIntensity={0.2}>
            <mesh
              position={[x, -0.48, z]}
              rotation={[bendAngle, Math.random() * Math.PI, 0]}
              scale={[0.02, height, 0.02]}
              castShadow
            >
              <coneGeometry args={[0.5, 1, 4]} />
              <meshStandardMaterial 
                color={i % 3 === 0 ? '#5a8c3a' : '#4a7c2a'} 
                roughness={0.9}
                emissive={wellness_score > 70 ? '#2d4518' : '#1d3508'}
                emissiveIntensity={0.1}
              />
            </mesh>
          </Float>
        )
      })}
      
      {/* Decorative rocks and mushrooms */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5
        const radius = size * 0.7 + Math.random() * size * 0.2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return i % 2 === 0 ? (
          // Rocks
          <mesh
            key={`rock-${i}`}
            position={[x, -0.45, z]}
            rotation={[Math.random(), Math.random(), Math.random()]}
            scale={[0.15, 0.1, 0.15]}
            castShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#6a6a5a" roughness={0.9} />
          </mesh>
        ) : (
          // Magical mushrooms
          <group key={`mushroom-${i}`} position={[x, -0.48, z]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
              <meshStandardMaterial color="#f0e8d0" />
            </mesh>
            <mesh position={[0, 0.12, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial 
                color="#ff6b6b" 
                emissive="#ff6b6b"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* White spots on mushroom */}
            {[...Array(3)].map((_, j) => {
              const spotAngle = (j / 3) * Math.PI * 2
              return (
                <mesh
                  key={`spot-${j}`}
                  position={[
                    Math.cos(spotAngle) * 0.05,
                    0.15,
                    Math.sin(spotAngle) * 0.05
                  ]}
                  scale={0.02}
                >
                  <sphereGeometry args={[1, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              )
            })}
          </group>
        )
      })}
      
      {/* Mystical fog patches */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const radius = size * 0.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Float key={`fog-${i}`} speed={0.3} floatIntensity={0.5}>
            <mesh position={[x, -0.3, z]} scale={[1.5, 0.3, 1.5]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial 
                color="#e0f0ff" 
                transparent 
                opacity={0.1}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

// Enhanced wellness score display with dynamic effects
function WellnessDisplay({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRefs = useRef<THREE.Mesh[]>([])
  
  const color = useMemo(() => {
    if (score > 70) return new Color('#00ff88')
    if (score > 40) return new Color('#ffff00')
    return new Color('#ff6b6b')
  }, [score])
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
    
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = state.clock.elapsedTime * (0.5 + i * 0.2)
        ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (1 + i)) * 0.05)
      }
    })
  })
  
  return (
    <Float speed={0.8} floatIntensity={0.5}>
      <group position={[0, 3.5, 0]}>
        {/* Central orb */}
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={0.9}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        
        {/* Outer glow sphere */}
        <mesh scale={1.3}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.2}
          />
        </mesh>
        
        {/* Rotating energy rings */}
        {[...Array(3)].map((_, i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) ringRefs.current[i] = el }}
            rotation={[Math.PI / 2 * i, 0, 0]}
            scale={1 + i * 0.2}
          >
            <torusGeometry args={[0.5, 0.02, 16, 32]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.6 - i * 0.15}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
        
        {/* Point light emanating from orb */}
        <pointLight 
          color={color} 
          intensity={score / 20} 
          distance={5}
          decay={2}
        />
        
        {/* Sparkles around the orb */}
        <Sparkles
          count={score > 70 ? 50 : 30}
          scale={2}
          size={3}
          speed={0.3}
          opacity={0.6}
          color={color}
        />
      </group>
    </Float>
  )
}

// Simple animated cloud component
function SimpleCloud({ position, opacity, color }: { position: [number, number, number], opacity: number, color: Color }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.1) * 2
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

// Dynamic atmosphere based on wellness score (simplified for stability)
function DynamicAtmosphere({ wellness_score }: { wellness_score: number }) {
  const { skyColor, cloudOpacity, fogColor } = useMemo(() => {
    // High wellness = bright sunny day
    if (wellness_score > 70) {
      return {
        skyColor: new Color('#87CEEB'),
        cloudOpacity: 0.15,
        fogColor: '#B0D4E8'
      }
    }
    // Medium wellness = partly cloudy
    if (wellness_score > 40) {
      return {
        skyColor: new Color('#B0C4DE'),
        cloudOpacity: 0.25,
        fogColor: '#9AB8D4'
      }
    }
    // Low wellness = overcast but not gloomy
    return {
      skyColor: new Color('#98A8B8'),
      cloudOpacity: 0.35,
      fogColor: '#7A8A9A'
    }
  }, [wellness_score])
  
  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
      </mesh>
      
      {/* Fog for depth */}
      <fog attach="fog" args={[fogColor, 15, 60]} />
      
      {/* Animated clouds */}
      <SimpleCloud
        position={[-5, 8, -15]}
        opacity={cloudOpacity}
        color={new Color('#ffffff')}
      />
      <SimpleCloud
        position={[5, 10, -20]}
        opacity={cloudOpacity * 0.8}
        color={new Color('#ffffff')}
      />
      <SimpleCloud
        position={[0, 12, -25]}
        opacity={cloudOpacity * 0.6}
        color={new Color('#ffffff')}
      />
    </>
  )
}

export function AdvancedGarden({ echoes, wellness_score }: AdvancedGardenProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Position flowers in spiral pattern (Fibonacci/Golden angle)
  const flowerPositions = useMemo(() => {
    return echoes.map((echo, index) => {
      const angle = index * 0.618 * Math.PI * 2 // Golden angle
      const radius = Math.sqrt(index) * 0.9
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      return { x, z, echo }
    })
  }, [echoes])
  
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-navy to-navy-light rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-moss border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-quicksand">Cultivating your garden...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [6, 6, 6], fov: 65 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.5} color="#fff8e7" />
          <directionalLight 
            position={[10, 12, 8]} 
            intensity={wellness_score > 70 ? 2 : 1.5} 
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <hemisphereLight 
            args={['#87CEEB', '#3a5a2a', 0.6]} 
          />
          <pointLight 
            position={[0, 5, 0]} 
            intensity={0.8} 
            color="#FFE4B5" 
            distance={15}
            decay={2}
          />
          
          {/* Dynamic sky and atmosphere */}
          <DynamicAtmosphere wellness_score={wellness_score} />
          
          {/* Distant stars for magical ambiance */}
          <Stars 
            radius={100} 
            depth={50} 
            count={wellness_score > 70 ? 500 : 300} 
            factor={wellness_score > 70 ? 3 : 2} 
            saturation={0.5} 
            fade 
            speed={0.5} 
          />
          
          {/* Enhanced garden ground */}
          <Garden size={10} wellness_score={wellness_score} />
          
          {/* Flowers from echoes */}
          {flowerPositions.map(({ x, z, echo }) => (
            <ProceduralFlower
              key={echo.id}
              position={[x, 0, z]}
              moodScore={echo.mood_score}
              emotionTags={echo.emotion_tags}
              growthStage={echo.growth_stage}
              seedType={echo.seed_type}
            />
          ))}
          
          {/* Ambient GPU particles (fireflies/pollen) */}
          <GPUParticleSystem 
            count={wellness_score > 70 ? 100 : 60} 
            color={wellness_score > 70 ? "#FFD700" : "#B8E6F0"} 
          />
          
          {/* Wellness score display orb */}
          <WellnessDisplay score={wellness_score} />
          
          {/* Post-processing effects */}
          <EffectComposer multisampling={4}>
            {/* Bloom for glowing flowers */}
            <Bloom
              intensity={wellness_score > 70 ? 1.5 : 1.0}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              height={300}
              opacity={1}
              blendFunction={BlendFunction.SCREEN}
            />
            
            {/* Depth of field for cinematic focus */}
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.05}
              bokehScale={wellness_score > 70 ? 3 : 2}
              height={480}
            />
            
            {/* Vignette for frame focus */}
            <Vignette
              offset={0.3}
              darkness={0.5}
              blendFunction={BlendFunction.NORMAL}
            />
            
            {/* Subtle chromatic aberration for dreamlike quality */}
            <ChromaticAberration
              offset={[0.0005, 0.0005]}
              blendFunction={BlendFunction.NORMAL}
            />
            
            {/* Tone mapping for better color */}
            <ToneMapping
              mode={ToneMappingMode.ACES_FILMIC}
              resolution={256}
              whitePoint={wellness_score > 70 ? 4.0 : 3.0}
              middleGrey={0.6}
              minLuminance={0.01}
              averageLuminance={1.0}
              adaptationRate={wellness_score > 70 ? 2.0 : 1.0}
            />
          </EffectComposer>
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={4} 
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={wellness_score > 70}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

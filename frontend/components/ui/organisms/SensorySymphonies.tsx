'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Volume2, VolumeX, Sparkles, Waves, Play, Pause, Info } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

interface SensorySymphoniesProps {
  userId: string
}

interface AudioConfig {
  base_drone: {
    frequency: number
    type: 'sine' | 'triangle' | 'sawtooth' | 'square'
    gain: number
    detune: number
  }
  harmonic_pad: {
    frequency: number
    type: 'sine' | 'triangle' | 'sawtooth' | 'square'
    gain: number
    detune: number
  }
  high_shimmer: {
    frequency: number
    type: 'sine' | 'triangle' | 'sawtooth' | 'square'
    gain: number
    detune: number
    enabled: boolean
  }
  rhythm_pulse: {
    frequency: number
    depth: number
    enabled: boolean
  }
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass'
    frequency: number
    q: number
  }
  reverb: {
    wetness: number
    decay: number
  }
  nature_sounds: Array<{
    type: string
    volume: number
    reason: string
  }>
  emotional_tone: string
  therapeutic_intent: string
}

interface GardenState {
  overall_mood: number
  mood_variance: number
  dominant_emotions: string[]
  garden_density: number
  plant_diversity: number
  emotional_intensity: number
}

interface SoundscapeResponse {
  audio_config: AudioConfig
  garden_state: GardenState
  message: string
}

export const SensorySymphonies: React.FC<SensorySymphoniesProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [soundscapeData, setSoundscapeData] = useState<SoundscapeResponse | null>(null)
  const [currentMood, setCurrentMood] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)
  
  // Canvas for waveform visualization
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  
  // Web Audio API references
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<{
    baseDrone?: OscillatorNode
    harmonicPad?: OscillatorNode
    highShimmer?: OscillatorNode
    lfo?: OscillatorNode
  }>({})
  const gainNodesRef = useRef<{
    baseDrone?: GainNode
    harmonicPad?: GainNode
    highShimmer?: GainNode
    master?: GainNode
  }>({})
  const analyserRef = useRef<AnalyserNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)

  useEffect(() => {
    // Fetch current mood on mount
    fetchCurrentMood()
    
    return () => {
      // Cleanup audio on unmount
      stopSoundscape()
    }
  }, [userId])

  const fetchCurrentMood = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/soundscape/current-mood/${userId}`)
      const data = await response.json()
      setCurrentMood(data)
    } catch (error) {
      console.error('Error fetching mood:', error)
    }
  }

  const generateSoundscape = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/soundscape/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, include_recent_echoes: 5 })
      })
      
      const data = await response.json()
      setSoundscapeData(data)
      
      // Auto-start playback
      setTimeout(() => {
        startSoundscape(data.audio_config)
      }, 500)
      
    } catch (error) {
      console.error('Error generating soundscape:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSoundscape = (config: AudioConfig) => {
    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    
    // Create master gain
    const masterGain = ctx.createGain()
    masterGain.gain.value = volume
    masterGain.connect(ctx.destination)
    gainNodesRef.current.master = masterGain
    
    // Create analyser for visualization
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.connect(masterGain)
    analyserRef.current = analyser
    
    // Create filter
    const filter = ctx.createBiquadFilter()
    filter.type = config.filter.type
    filter.frequency.value = config.filter.frequency
    filter.Q.value = config.filter.q
    filter.connect(analyser)
    filterRef.current = filter

    // Base Drone Layer
    const baseDrone = ctx.createOscillator()
    const baseDroneGain = ctx.createGain()
    baseDrone.type = config.base_drone.type
    baseDrone.frequency.value = config.base_drone.frequency
    baseDrone.detune.value = config.base_drone.detune
    baseDroneGain.gain.value = config.base_drone.gain
    baseDrone.connect(baseDroneGain)
    baseDroneGain.connect(filter)
    oscillatorsRef.current.baseDrone = baseDrone
    gainNodesRef.current.baseDrone = baseDroneGain

    // Harmonic Pad Layer
    const harmonicPad = ctx.createOscillator()
    const harmonicPadGain = ctx.createGain()
    harmonicPad.type = config.harmonic_pad.type
    harmonicPad.frequency.value = config.harmonic_pad.frequency
    harmonicPad.detune.value = config.harmonic_pad.detune
    harmonicPadGain.gain.value = config.harmonic_pad.gain
    harmonicPad.connect(harmonicPadGain)
    harmonicPadGain.connect(filter)
    oscillatorsRef.current.harmonicPad = harmonicPad
    gainNodesRef.current.harmonicPad = harmonicPadGain

    // High Shimmer Layer (optional)
    if (config.high_shimmer.enabled) {
      const highShimmer = ctx.createOscillator()
      const highShimmerGain = ctx.createGain()
      highShimmer.type = config.high_shimmer.type
      highShimmer.frequency.value = config.high_shimmer.frequency
      highShimmer.detune.value = config.high_shimmer.detune
      highShimmerGain.gain.value = config.high_shimmer.gain
      highShimmer.connect(highShimmerGain)
      highShimmerGain.connect(filter)
      oscillatorsRef.current.highShimmer = highShimmer
      gainNodesRef.current.highShimmer = highShimmerGain
    }

    // Rhythm Pulse (LFO modulation) - optional
    if (config.rhythm_pulse.enabled) {
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.type = 'sine'
      lfo.frequency.value = config.rhythm_pulse.frequency
      lfoGain.gain.value = config.rhythm_pulse.depth
      lfo.connect(lfoGain)
      lfoGain.connect(baseDroneGain.gain)
      oscillatorsRef.current.lfo = lfo
    }

    // Start all oscillators
    const now = ctx.currentTime
    baseDrone.start(now)
    harmonicPad.start(now)
    if (oscillatorsRef.current.highShimmer) {
      oscillatorsRef.current.highShimmer.start(now)
    }
    if (oscillatorsRef.current.lfo) {
      oscillatorsRef.current.lfo.start(now)
    }

    setIsPlaying(true)
    startVisualization()
  }

  const stopSoundscape = () => {
    // Stop all oscillators
    Object.values(oscillatorsRef.current).forEach(osc => {
      if (osc) {
        try {
          osc.stop()
          osc.disconnect()
        } catch (e) {
          // Already stopped
        }
      }
    })

    // Clear references
    oscillatorsRef.current = {}
    gainNodesRef.current = {}
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsPlaying(false)
    stopVisualization()
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSoundscape()
    } else if (soundscapeData) {
      startSoundscape(soundscapeData.audio_config)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (gainNodesRef.current.master) {
      gainNodesRef.current.master.gain.value = newVolume
    }
  }

  const startVisualization = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(6, 29, 44, 0.3)')
      gradient.addColorStop(1, 'rgba(6, 29, 44, 0.8)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waveform with petal-like petals
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(167, 215, 187, 0.8)' // moss color
      ctx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()

      // Add floating orbs based on frequency peaks
      ctx.fillStyle = 'rgba(250, 181, 124, 0.4)' // sunset color
      for (let i = 0; i < bufferLength; i += 50) {
        const v = dataArray[i] / 255.0
        if (v > 0.6) {
          const orbX = (i / bufferLength) * canvas.width
          const orbY = canvas.height * 0.5 + Math.sin(Date.now() / 1000 + i) * 30
          const orbSize = v * 8
          ctx.beginPath()
          ctx.arc(orbX, orbY, orbSize, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }

    draw()
  }

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  if (!currentMood?.has_data) {
    return null // Don't show button if user has no echoes
  }

  return (
    <>
      {/* Floating Music Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="fixed bottom-32 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-sky-500 rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform group"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ rotate: 360 }}
      >
        <Music className="text-white w-7 h-7 group-hover:animate-pulse" />
        
        {/* Pulsing Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Soundscape Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false)
              if (isPlaying) stopSoundscape()
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <GlassCard className="relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-sky-500 rounded-xl flex items-center justify-center">
                      <Waves className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-quicksand font-bold text-white">Sensory Symphonies</h2>
                      <p className="text-white/60 text-sm font-quicksand">
                        Your garden's therapeutic soundscape
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Info className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Info Panel */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="p-4 bg-sky/20 rounded-xl border border-sky/30">
                        <p className="text-white/90 text-sm font-quicksand leading-relaxed">
                          <Sparkles className="inline w-4 h-4 text-sky mr-2" />
                          This soundscape is procedurally generated using Web Audio API based on your recent echoes. 
                          The frequencies, harmonics, and nature sounds are chosen to match your emotional garden state - 
                          lower tones for grounding, higher crystalline sounds for uplift.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current Mood Status */}
                {currentMood && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-moss/20 to-sunset/20 rounded-xl border border-moss/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-xs font-quicksand uppercase mb-1">Current Garden Mood</p>
                        <p className="text-white text-lg font-quicksand font-semibold">
                          {currentMood.soundscape_style}
                        </p>
                        <p className="text-white/70 text-sm font-quicksand mt-1">
                          {currentMood.suggestion}
                        </p>
                      </div>
                      <div className="text-4xl">
                        {currentMood.current_mood < -0.3 ? '🌧️' : currentMood.current_mood > 0.3 ? '☀️' : '🌤️'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Waveform Visualization Canvas */}
                <div className="mb-6 rounded-xl overflow-hidden border-2 border-white/20">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={200}
                    className="w-full h-[200px] bg-gradient-to-br from-navy to-navy-light"
                  />
                </div>

                {/* Generate Button */}
                {!soundscapeData && (
                  <motion.button
                    onClick={generateSoundscape}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-sky-500 text-white rounded-xl font-quicksand font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Composing your garden's sound...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate My Soundscape
                      </>
                    )}
                  </motion.button>
                )}

                {/* Soundscape Info & Controls */}
                {soundscapeData && (
                  <div className="space-y-4">
                    {/* Emotional Tone */}
                    <div className="p-4 bg-gradient-to-br from-sunset/20 to-purple-500/20 rounded-xl border border-sunset/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-sunset" />
                        <h3 className="text-white font-quicksand font-semibold">
                          {soundscapeData.audio_config.emotional_tone}
                        </h3>
                      </div>
                      <p className="text-white/80 text-sm font-quicksand leading-relaxed">
                        {soundscapeData.audio_config.therapeutic_intent}
                      </p>
                    </div>

                    {/* Nature Sounds */}
                    {soundscapeData.audio_config.nature_sounds.length > 0 && (
                      <div className="p-4 bg-moss/20 rounded-xl border border-moss/30">
                        <h4 className="text-white font-quicksand font-semibold mb-2 text-sm flex items-center gap-2">
                          <Waves className="w-4 h-4 text-moss" />
                          Nature Layer
                        </h4>
                        {soundscapeData.audio_config.nature_sounds.map((sound, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {sound.type === 'rain' ? '🌧️' : 
                               sound.type === 'birds' ? '🐦' : 
                               sound.type === 'stream' ? '💧' : 
                               sound.type === 'forest' ? '🌲' : '🌬️'}
                            </span>
                            <p className="text-white/70 text-sm font-quicksand">{sound.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Playback Controls */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-sky-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>

                      {/* Volume Slider */}
                      <div className="flex-1 flex items-center gap-3">
                        {volume === 0 ? (
                          <VolumeX className="w-5 h-5 text-white/60" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white/60" />
                        )}
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                        />
                        <span className="text-white/60 text-sm font-quicksand w-12">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Garden State Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-white/60 text-xs font-quicksand mb-1">Mood</p>
                        <p className="text-white text-lg font-bold">
                          {soundscapeData.garden_state.overall_mood > 0 ? '+' : ''}
                          {soundscapeData.garden_state.overall_mood.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-white/60 text-xs font-quicksand mb-1">Density</p>
                        <p className="text-white text-lg font-bold">
                          {soundscapeData.garden_state.garden_density} 🌱
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-white/60 text-xs font-quicksand mb-1">Diversity</p>
                        <p className="text-white text-lg font-bold">
                          {soundscapeData.garden_state.plant_diversity} types
                        </p>
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    <button
                      onClick={() => {
                        if (isPlaying) stopSoundscape()
                        setSoundscapeData(null)
                      }}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-quicksand transition-all"
                    >
                      Generate New Soundscape
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a7d7bb 0%, #5ba0c8 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a7d7bb 0%, #5ba0c8 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: none;
        }
      `}</style>
    </>
  )
}

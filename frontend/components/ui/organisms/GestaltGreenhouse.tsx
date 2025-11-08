'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Flame, X, Info, RotateCcw, Lightbulb } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'
import { apiFetch } from '@/lib/api'

interface GestaltGreenhouseProps {
  userId: string
}

interface EmotionToken {
  name: string
  color: string
  description: string
}

interface Fusion {
  fusion_name: string
  fusion_description: string
  visual_metaphor: string
  alchemical_formula: string
  when_this_appears: string
  therapeutic_insight: string
  color_palette: string
  texture: string
  movement_quality: string
}

interface FusionResponse {
  success: boolean
  fusion: Fusion
  emotions_used: string[]
}

interface SuggestedPair {
  emotion1: string
  emotion2: string
  reason: string
}

export const GestaltGreenhouse: React.FC<GestaltGreenhouseProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false)
  const [emotions, setEmotions] = useState<EmotionToken[]>([])
  const [selectedEmotion1, setSelectedEmotion1] = useState<EmotionToken | null>(null)
  const [selectedEmotion2, setSelectedEmotion2] = useState<EmotionToken | null>(null)
  const [fusionData, setFusionData] = useState<FusionResponse | null>(null)
  const [isFusing, setIsFusing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [suggestedPairs, setSuggestedPairs] = useState<SuggestedPair[]>([])
  const [draggedEmotion, setDraggedEmotion] = useState<EmotionToken | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  
  const fusionZoneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Fetch emotion palette on mount
    fetchEmotionPalette()
    fetchSuggestedPairs()
  }, [userId])

  useEffect(() => {
    // Start particle animation when fusion zone is active
    if ((selectedEmotion1 || selectedEmotion2) && canvasRef.current) {
      startParticleAnimation()
    }
  }, [selectedEmotion1, selectedEmotion2])

  const fetchEmotionPalette = async () => {
    try {
      const response = await apiFetch('/api/alchemy/emotion-palette')
      const data = await response.json()
      setEmotions(data.emotions)
    } catch (error) {
      console.error('Error fetching emotions:', error)
    }
  }

  const fetchSuggestedPairs = async () => {
    try {
      const response = await apiFetch(`/api/alchemy/suggested-pairs/${userId}`)
      const data = await response.json()
      setSuggestedPairs(data.suggested_pairs || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleEmotionDragStart = (e: React.DragEvent, emotion: EmotionToken) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('emotion', JSON.stringify(emotion))
    setDraggedEmotion(emotion)
  }

  const handleFusionZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDraggingOver(true)
  }

  const handleFusionZoneDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleFusionZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    
    const emotionData = e.dataTransfer.getData('emotion')
    if (emotionData) {
      const emotion: EmotionToken = JSON.parse(emotionData)
      
      if (!selectedEmotion1) {
        setSelectedEmotion1(emotion)
      } else if (!selectedEmotion2 && emotion.name !== selectedEmotion1.name) {
        setSelectedEmotion2(emotion)
      }
    }
    
    setDraggedEmotion(null)
  }

  const fuseEmotions = async () => {
    if (!selectedEmotion1 || !selectedEmotion2) return

    setIsFusing(true)
    try {
      const response = await apiFetch('/api/alchemy/fuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          emotion1: selectedEmotion1.name,
          emotion2: selectedEmotion2.name
        })
      })

      const data = await response.json()
      setFusionData(data)
    } catch (error) {
      console.error('Error fusing emotions:', error)
    } finally {
      setIsFusing(false)
    }
  }

  const resetFusion = () => {
    setSelectedEmotion1(null)
    setSelectedEmotion2(null)
    setFusionData(null)
  }

  const applySuggestedPair = (pair: SuggestedPair) => {
    const emotion1 = emotions.find(e => e.name === pair.emotion1)
    const emotion2 = emotions.find(e => e.name === pair.emotion2)
    
    if (emotion1 && emotion2) {
      setSelectedEmotion1(emotion1)
      setSelectedEmotion2(emotion2)
    }
  }

  const startParticleAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple particle effect
    let particles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = []
    
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1.0
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, index) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.01
        
        if (p.life <= 0) {
          particles[index] = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1.0
          }
        }
        
        ctx.fillStyle = `rgba(167, 215, 187, ${p.life * 0.6})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
      
      if (selectedEmotion1 || selectedEmotion2) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  return (
    <>
      {/* Floating Lab Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="fixed bottom-48 right-8 w-16 h-16 bg-gradient-to-br from-moss via-sunset to-moss rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform group"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        whileHover={{ rotate: 180 }}
      >
        <Flame className="text-white w-7 h-7 group-hover:animate-pulse" />
        
        {/* Pulsing Rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-sunset"
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-moss"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
      </motion.button>

      {/* Alchemy Lab Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => {
              setShowModal(false)
              resetFusion()
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <GlassCard className="relative overflow-hidden">
                <div className="overflow-y-auto max-h-[85vh] custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                  }}
                >
                {/* Close and Info Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 bg-moss/20 hover:bg-moss/30 rounded-lg transition-colors backdrop-blur-sm border border-moss/30"
                  >
                    <Info className="w-5 h-5 text-moss" />
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      resetFusion()
                    }}
                    className="p-2 bg-sunset/20 hover:bg-sunset/30 rounded-lg transition-colors backdrop-blur-sm border border-sunset/30"
                  >
                    <X className="w-5 h-5 text-sunset" />
                  </button>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pr-24">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-moss via-sunset to-moss rounded-2xl flex items-center justify-center relative"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(168, 213, 186, 0.4)',
                          '0 0 40px rgba(251, 166, 131, 0.6)',
                          '0 0 20px rgba(168, 213, 186, 0.4)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Flame className="text-white w-8 h-8" />
                    </motion.div>
                    
                    <div>
                      <h2 className="text-3xl font-quicksand font-bold text-white">Gestalt Greenhouse</h2>
                      <p className="text-white/70 text-sm font-quicksand">
                        Emotion Alchemy Lab
                      </p>
                    </div>
                  </div>
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
                      <div className="p-4 bg-moss/20 rounded-xl border border-moss/30">
                        <p className="text-white/90 text-sm font-quicksand leading-relaxed">
                          <Sparkles className="inline w-4 h-4 text-moss mr-2" />
                          Emotions rarely exist in isolation. This lab lets you explore how feelings combine, conflict, 
                          and create new complex emotional states. Drag two emotions into the fusion zone to discover 
                          what emerges when they meet - like alchemy for your inner world.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggested Pairs */}
                {suggestedPairs.length > 0 && !fusionData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-sunset" />
                      <h3 className="text-white font-quicksand font-semibold text-sm">
                        Suggested for You
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {suggestedPairs.map((pair, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => applySuggestedPair(pair)}
                          className="p-3 bg-gradient-to-br from-sunset/20 to-purple-500/20 rounded-lg border border-sunset/30 hover:border-sunset/50 transition-all text-left"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-quicksand font-semibold text-sm">
                              {pair.emotion1} + {pair.emotion2}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs font-quicksand">
                            {pair.reason}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Main Lab Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Emotion Palette */}
                  <div className="lg:col-span-1">
                    <h3 className="text-white font-quicksand font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-moss" />
                      Emotion Tokens
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {emotions.map((emotion, index) => (
                        <motion.div
                          key={emotion.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          draggable
                          onDragStart={(e) => handleEmotionDragStart(e, emotion)}
                          onDragEnd={() => setDraggedEmotion(null)}
                          className={`p-3 bg-gradient-to-r ${emotion.color} rounded-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
                            draggedEmotion?.name === emotion.name ? 'opacity-50' : ''
                          } ${
                            selectedEmotion1?.name === emotion.name || selectedEmotion2?.name === emotion.name
                              ? 'ring-2 ring-white'
                              : ''
                          }`}
                        >
                          <p className="text-white font-quicksand font-bold text-sm mb-1">
                            {emotion.name}
                          </p>
                          <p className="text-white/80 text-xs font-quicksand">
                            {emotion.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Center: Fusion Zone */}
                  <div className="lg:col-span-2">
                    {!fusionData ? (
                      <div className="space-y-4">
                        <h3 className="text-white font-quicksand font-semibold flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          Fusion Zone
                        </h3>
                        
                        {/* Fusion Zone Drop Area */}
                        <div
                          ref={fusionZoneRef}
                          onDragOver={handleFusionZoneDragOver}
                          onDragLeave={handleFusionZoneDragLeave}
                          onDrop={handleFusionZoneDrop}
                          className={`relative min-h-[300px] rounded-2xl border-4 border-dashed transition-all ${
                            isDraggingOver
                              ? 'border-sunset bg-sunset/20'
                              : 'border-moss/40 bg-gradient-to-br from-moss/10 to-sunset/10'
                          }`}
                        >
                          {/* Canvas for particle effects */}
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={300}
                            className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
                          />
                          
                          {/* Content */}
                          <div className="relative z-10 p-6 flex flex-col items-center justify-center h-full">
                            {!selectedEmotion1 && !selectedEmotion2 && (
                              <div className="text-center">
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Flame className="w-16 h-16 text-sunset/50 mx-auto mb-4" />
                                </motion.div>
                                <p className="text-white font-quicksand text-lg">
                                  Drag two emotions here to fuse them
                                </p>
                                <p className="text-white/60 text-sm font-quicksand mt-2">
                                  Explore how feelings combine and transform
                                </p>
                              </div>
                            )}
                            
                            {/* Selected Emotions */}
                            <div className="flex items-center gap-4 w-full justify-center">
                              {selectedEmotion1 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`p-4 bg-gradient-to-r ${selectedEmotion1.color} rounded-xl shadow-2xl`}
                                >
                                  <p className="text-white font-quicksand font-bold text-lg text-center">
                                    {selectedEmotion1.name}
                                  </p>
                                </motion.div>
                              )}
                              
                              {selectedEmotion1 && selectedEmotion2 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <Sparkles className="w-8 h-8 text-yellow-400" />
                                </motion.div>
                              )}
                              
                              {selectedEmotion2 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`p-4 bg-gradient-to-r ${selectedEmotion2.color} rounded-xl shadow-2xl`}
                                >
                                  <p className="text-white font-quicksand font-bold text-lg text-center">
                                    {selectedEmotion2.name}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={fuseEmotions}
                            disabled={!selectedEmotion1 || !selectedEmotion2 || isFusing}
                            className="flex-1 py-3 bg-gradient-to-r from-moss to-sunset hover:from-moss/90 hover:to-sunset/90 text-white rounded-xl font-quicksand font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isFusing ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Fusing...
                              </>
                            ) : (
                              <>
                                <Flame className="w-5 h-5" />
                                Fuse Emotions
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={resetFusion}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                            title="Reset"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Fusion Result */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {/* Fusion Name */}
                        <div className="text-center">
                          <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl font-quicksand font-bold text-transparent bg-clip-text bg-gradient-to-r from-moss via-sunset to-moss mb-2"
                          >
                            {fusionData.fusion.fusion_name}
                          </motion.h3>
                          <p className="text-white/60 text-sm font-quicksand">
                            {fusionData.emotions_used[0]} × {fusionData.emotions_used[1]}
                          </p>
                        </div>

                        {/* Alchemical Formula */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="p-4 bg-gradient-to-r from-moss/20 to-sunset/20 rounded-xl border border-moss/30 text-center"
                        >
                          <p className="text-white font-quicksand text-lg">
                            {fusionData.fusion.alchemical_formula}
                          </p>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="p-5 bg-white/5 rounded-xl"
                        >
                          <p className="text-white font-quicksand leading-relaxed">
                            {fusionData.fusion.fusion_description}
                          </p>
                        </motion.div>

                        {/* Visual Metaphor */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="p-4 bg-moss/20 rounded-xl border border-moss/30"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🌿</span>
                            <div>
                              <p className="text-moss text-xs font-quicksand font-semibold uppercase mb-1">
                                In Your Garden
                              </p>
                              <p className="text-white/90 font-quicksand text-sm leading-relaxed">
                                {fusionData.fusion.visual_metaphor}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Additional Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 bg-white/5 rounded-xl"
                          >
                            <p className="text-white/60 text-xs font-quicksand uppercase mb-2">Color Palette</p>
                            <p className="text-white font-quicksand text-sm">
                              {fusionData.fusion.color_palette}
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-4 bg-white/5 rounded-xl"
                          >
                            <p className="text-white/60 text-xs font-quicksand uppercase mb-2">Texture</p>
                            <p className="text-white font-quicksand text-sm">
                              {fusionData.fusion.texture}
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="p-4 bg-white/5 rounded-xl"
                          >
                            <p className="text-white/60 text-xs font-quicksand uppercase mb-2">Movement Quality</p>
                            <p className="text-white font-quicksand text-sm">
                              {fusionData.fusion.movement_quality}
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="p-4 bg-white/5 rounded-xl"
                          >
                            <p className="text-white/60 text-xs font-quicksand uppercase mb-2">When This Appears</p>
                            <p className="text-white font-quicksand text-sm">
                              {fusionData.fusion.when_this_appears}
                            </p>
                          </motion.div>
                        </div>

                        {/* Therapeutic Insight */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="p-5 bg-gradient-to-br from-sunset/20 to-purple-500/20 rounded-xl border-2 border-sunset/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-sunset" />
                            <p className="text-sunset text-xs font-quicksand font-semibold uppercase tracking-wider">
                              Therapeutic Insight
                            </p>
                          </div>
                          <p className="text-white font-quicksand leading-relaxed">
                            {fusionData.fusion.therapeutic_insight}
                          </p>
                        </motion.div>

                        {/* Create Another Button */}
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          onClick={resetFusion}
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-quicksand transition-all"
                        >
                          Explore Another Fusion
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

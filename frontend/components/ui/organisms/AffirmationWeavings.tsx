'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Volume2, VolumeX, Heart, BookHeart, X, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

interface AffirmationWeavingsProps {
  userId: string
  mostRecentEcho?: {
    id: number
    content: string
    mood_score: number
    emotion_tags: string[]
  } | null
  onAffirmationComplete?: () => void
}

interface Affirmation {
  title: string
  affirmation: string
  mantra_line: string
  emotional_acknowledgment: string
  garden_metaphor: string
  voice_guidance: 'gentle' | 'grounding' | 'empowering' | 'soothing'
}

interface AffirmationResponse {
  success: boolean
  affirmation: Affirmation
  original_echo: {
    content: string
    mood_score: number
    emotions: string[]
  }
}

export const AffirmationWeavings: React.FC<AffirmationWeavingsProps> = ({ 
  userId, 
  mostRecentEcho,
  onAffirmationComplete 
}) => {
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [affirmationData, setAffirmationData] = useState<AffirmationResponse | null>(null)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStanza, setCurrentStanza] = useState(0)
  
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Auto-check for affirmation trigger on mount and when echo changes
  useEffect(() => {
    if (mostRecentEcho && mostRecentEcho.mood_score < -0.2) {
      // Small delay before showing to let the echo planting animation complete
      setTimeout(() => {
        setShowModal(true)
        generateAffirmation()
      }, 1500)
    }
  }, [mostRecentEcho?.id])

  useEffect(() => {
    // Cleanup speech on unmount
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const generateAffirmation = async () => {
    if (!mostRecentEcho) return

    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:8000/api/weave/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          echo_id: mostRecentEcho.id,
          echo_content: mostRecentEcho.content,
          mood_score: mostRecentEcho.mood_score,
          emotion_tags: mostRecentEcho.emotion_tags
        })
      })

      const data = await response.json()
      setAffirmationData(data)
    } catch (error) {
      console.error('Error generating affirmation:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const speakAffirmation = () => {
    if (!affirmationData || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsVoiceEnabled(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(affirmationData.affirmation.affirmation)
    
    // Voice settings based on guidance
    const voiceSettings = {
      gentle: { rate: 0.8, pitch: 1.0 },
      grounding: { rate: 0.7, pitch: 0.9 },
      empowering: { rate: 0.9, pitch: 1.1 },
      soothing: { rate: 0.75, pitch: 0.95 }
    }
    
    const settings = voiceSettings[affirmationData.affirmation.voice_guidance] || { rate: 0.8, pitch: 1.0 }
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsVoiceEnabled(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsVoiceEnabled(false)
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handleVoiceToggle = () => {
    if (isVoiceEnabled) {
      window.speechSynthesis.cancel()
      setIsVoiceEnabled(false)
      setIsSpeaking(false)
    } else {
      speakAffirmation()
    }
  }

  const handleClose = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
    }
    setShowModal(false)
    setAffirmationData(null)
    setIsVoiceEnabled(false)
    setIsSpeaking(false)
    
    if (onAffirmationComplete) {
      onAffirmationComplete()
    }
  }

  const handleRegenerate = () => {
    setAffirmationData(null)
    generateAffirmation()
  }

  // Split affirmation into stanzas for animated reveal
  const getStanzas = () => {
    if (!affirmationData) return []
    return affirmationData.affirmation.affirmation
      .split('\n\n')
      .filter(s => s.trim().length > 0)
  }

  if (!mostRecentEcho || mostRecentEcho.mood_score >= -0.2) {
    return null // Don't render if no recent negative echo
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.3 }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <GlassCard className="relative overflow-hidden">
              <div className="overflow-y-auto max-h-[85vh] custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                }}
              >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-sky-500 rounded-2xl flex items-center justify-center relative"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(219, 39, 119, 0.3)',
                      '0 0 40px rgba(147, 51, 234, 0.5)',
                      '0 0 20px rgba(219, 39, 119, 0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <BookHeart className="text-white w-8 h-8" />
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      backgroundSize: '200% 200%'
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-quicksand font-bold text-white mb-1">Affirmation Weaving</h2>
                  <p className="text-white/70 text-sm font-quicksand">
                    Transmuting difficulty into resilience
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 rounded-full" />
                  </motion.div>
                  <p className="text-white/80 font-quicksand">Weaving your affirmation...</p>
                  <p className="text-white/50 text-sm font-quicksand mt-2">Transmuting pain into wisdom</p>
                </motion.div>
              )}

              {/* Affirmation Content */}
              {!isGenerating && affirmationData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Emotional Acknowledgment */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                      <p className="text-white/90 font-quicksand text-sm leading-relaxed">
                        {affirmationData.affirmation.emotional_acknowledgment}
                      </p>
                    </div>
                  </motion.div>

                  {/* Affirmation Title */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <h3 className="text-3xl font-quicksand font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">
                      {affirmationData.affirmation.title}
                    </h3>
                  </motion.div>

                  {/* Affirmation Text - Stanza by Stanza with Unfurling Animation */}
                  <div className="space-y-4">
                    {getStanzas().map((stanza, index) => (
                      <motion.div
                        key={index}
                        initial={{ 
                          opacity: 0, 
                          scale: 0.95,
                          y: 20
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          y: 0
                        }}
                        transition={{ 
                          delay: 0.5 + index * 0.3,
                          duration: 0.6,
                          ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                        className="relative"
                      >
                        <motion.div
                          className="p-5 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/20 backdrop-blur-sm"
                          whileHover={{ 
                            scale: 1.02,
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          <p className="text-white font-quicksand text-lg leading-relaxed whitespace-pre-line">
                            {stanza}
                          </p>
                          
                          {/* Decorative corner element */}
                          <motion.div
                            className="absolute top-2 right-2 text-pink-400/30 text-xl"
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            ✨
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mantra Line - Highlighted */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + getStanzas().length * 0.3 }}
                    className="relative overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-r from-sunset/30 via-pink-500/30 to-purple-500/30 rounded-xl border-2 border-sunset/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-sunset" />
                        <p className="text-sunset text-xs font-quicksand font-semibold uppercase tracking-wider">
                          Repeat This
                        </p>
                      </div>
                      <p className="text-white text-xl font-quicksand font-bold leading-relaxed text-center">
                        {affirmationData.affirmation.mantra_line}
                      </p>
                      
                      {/* Animated glow */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(250, 181, 124, 0.2) 0%, transparent 70%)'
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  {/* Garden Metaphor */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + getStanzas().length * 0.3 }}
                    className="p-4 bg-moss/20 rounded-xl border border-moss/30"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🌱</span>
                      <div>
                        <p className="text-moss text-xs font-quicksand font-semibold uppercase mb-1">
                          In Your Garden
                        </p>
                        <p className="text-white/80 font-quicksand text-sm leading-relaxed">
                          {affirmationData.affirmation.garden_metaphor}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Voice Control & Actions */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + getStanzas().length * 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={handleVoiceToggle}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-quicksand font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isVoiceEnabled ? (
                        <>
                          <VolumeX className="w-5 h-5" />
                          Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                          Listen with Voice
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRegenerate}
                      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                      title="Generate new affirmation"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </motion.div>

                  {/* Save to Vault - Coming Soon */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + getStanzas().length * 0.3 }}
                    className="text-center"
                  >
                    <p className="text-white/50 text-xs font-quicksand">
                      💫 Weave Vault (save feature) coming soon
                    </p>
                  </motion.div>
                </motion.div>
              )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

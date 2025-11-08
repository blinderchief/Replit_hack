'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Book, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'
import { apiFetch } from '@/lib/api'

interface Tale {
  title: string
  fable: string
  moral: string
  garden_metaphor: string
  reflection_prompt: string
}

interface TaleResponse {
  success: boolean
  tale: Tale
  narrative_data?: any
  created_at: string
  error?: string
}

interface WhisperWeaveProps {
  userId: string
}

export function WhisperWeave({ userId }: WhisperWeaveProps) {
  const [showStorybook, setShowStorybook] = useState(false)
  const [taleData, setTaleData] = useState<TaleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [readyForTale, setReadyForTale] = useState(false)
  const [echoCount, setEchoCount] = useState(0)

  // Check if user has enough echoes for tale generation
  useEffect(() => {
    const checkReadiness = async () => {
      try {
        const response = await apiFetch(`/api/weave/preview-data/${userId}?days=7`)
        if (response.ok) {
          const data = await response.json()
          setReadyForTale(data.ready_for_tale)
          setEchoCount(data.echo_count)
        }
      } catch (error) {
        console.error('Failed to check tale readiness:', error)
      }
    }

    checkReadiness()
  }, [userId])

  const generateTale = async () => {
    setIsLoading(true)
    try {
      const response = await apiFetch('/api/weave/create-tale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, days: 7 })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success || data.tale) {
          setTaleData(data)
          setShowStorybook(true)
          setCurrentPage(0)
        } else {
          alert(data.message || 'Need more echoes to create a tale')
        }
      }
    } catch (error) {
      console.error('Failed to generate tale:', error)
      alert('Failed to generate tale. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for ASMR effect
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsVoiceEnabled(false)
    } else {
      setIsVoiceEnabled(!isVoiceEnabled)
      if (!isVoiceEnabled && taleData) {
        // Start reading current page
        const pageContent = getPageContent(currentPage)
        if (pageContent) speakText(pageContent)
      }
    }
  }

  const getPageContent = (page: number): string => {
    if (!taleData?.tale) return ''

    switch (page) {
      case 0: return taleData.tale.title
      case 1: return taleData.tale.garden_metaphor
      case 2: 
        // Split fable into paragraphs for pages 2-4
        const paragraphs = taleData.tale.fable.split('\n\n')
        return paragraphs[0] || ''
      case 3:
        const paras2 = taleData.tale.fable.split('\n\n')
        return paras2.slice(1, 3).join('\n\n') || ''
      case 4:
        const paras3 = taleData.tale.fable.split('\n\n')
        return paras3.slice(3).join('\n\n') || ''
      case 5: return taleData.tale.moral
      case 6: return taleData.tale.reflection_prompt
      default: return ''
    }
  }

  const nextPage = () => {
    if (currentPage < 6) {
      setCurrentPage(currentPage + 1)
      if (isVoiceEnabled) {
        const content = getPageContent(currentPage + 1)
        if (content) speakText(content)
      }
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      if (isVoiceEnabled) {
        const content = getPageContent(currentPage - 1)
        if (content) speakText(content)
      }
    }
  }

  const closeStorybook = () => {
    stopSpeaking()
    setShowStorybook(false)
    setIsVoiceEnabled(false)
    setCurrentPage(0)
  }

  // Page content renderer
  const renderPage = () => {
    if (!taleData?.tale) return null

    const tale = taleData.tale

    switch (currentPage) {
      case 0: // Title page
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-6xl mb-4">📖</div>
              <h1 className="text-4xl font-quicksand font-bold text-white mb-4">
                {tale.title}
              </h1>
              <p className="text-white/70 font-quicksand text-lg">
                Your week's story, woven from {taleData.narrative_data?.echo_count} echoes
              </p>
              <div className="flex items-center gap-2 justify-center text-moss text-sm font-quicksand">
                <Sparkles size={16} />
                <span>A Whisper Weave Tale</span>
              </div>
            </motion.div>
          </div>
        )

      case 1: // Garden metaphor
        return (
          <div className="flex flex-col justify-center h-full px-12 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-5xl mb-4">🌿</div>
              <h2 className="text-2xl font-quicksand font-semibold text-moss mb-4">
                Your Garden This Week
              </h2>
              <p className="text-white font-quicksand text-lg leading-relaxed">
                {tale.garden_metaphor}
              </p>
            </motion.div>
          </div>
        )

      case 2: // Fable part 1
      case 3: // Fable part 2
      case 4: // Fable part 3
        const content = getPageContent(currentPage)
        return (
          <div className="flex flex-col justify-center h-full px-12 py-8">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="prose prose-invert max-w-none">
                <p className="text-white font-quicksand text-lg leading-relaxed whitespace-pre-line">
                  {content}
                </p>
              </div>
              
              {/* Decorative vine illustrations */}
              <div className="flex justify-center gap-2 mt-8 opacity-40">
                <span className="text-moss">🌿</span>
                <span className="text-sky">✨</span>
                <span className="text-moss">🌿</span>
              </div>
            </motion.div>
          </div>
        )

      case 5: // Moral
        return (
          <div className="flex flex-col justify-center h-full px-12 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-5xl mb-4 text-center">🌸</div>
              <h2 className="text-2xl font-quicksand font-semibold text-sunset text-center mb-4">
                The Garden's Wisdom
              </h2>
              <div className="p-6 bg-gradient-to-br from-sunset/20 to-purple-500/20 rounded-2xl border border-sunset/30">
                <p className="text-white font-quicksand text-xl text-center italic leading-relaxed">
                  "{tale.moral}"
                </p>
              </div>
            </motion.div>
          </div>
        )

      case 6: // Reflection prompt
        return (
          <div className="flex flex-col justify-center h-full px-12 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-5xl mb-4 text-center">💭</div>
              <h2 className="text-2xl font-quicksand font-semibold text-sky text-center mb-4">
                A Question to Carry Forward
              </h2>
              <p className="text-white font-quicksand text-lg text-center leading-relaxed">
                {tale.reflection_prompt}
              </p>
              
              <div className="text-center mt-8">
                <p className="text-white/60 font-quicksand text-sm">
                  May your garden continue to grow with each echo planted 🌱
                </p>
              </div>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Floating Book Button */}
      {readyForTale && !showStorybook && (
        <motion.button
          onClick={generateTale}
          disabled={isLoading}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-24 right-8 z-40 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              {isLoading ? (
                <Loader2 className="text-white w-8 h-8 animate-spin" />
              ) : (
                <Book className="text-white w-8 h-8" />
              )}
            </div>

            {/* Pulse */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-purple-400/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <GlassCard className="px-4 py-2 whitespace-nowrap">
              <p className="text-white text-sm font-quicksand">
                {isLoading ? 'Weaving your tale...' : 'Read your week\'s story'}
              </p>
            </GlassCard>
          </div>
        </motion.button>
      )}

      {/* Not enough echoes indicator */}
      {!readyForTale && echoCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 right-8 z-40"
        >
          <GlassCard className="px-4 py-3">
            <p className="text-white/70 font-quicksand text-sm flex items-center gap-2">
              <Book size={16} className="text-purple-400" />
              {3 - echoCount} more echo{3 - echoCount !== 1 ? 's' : ''} for your tale
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Storybook Modal */}
      <AnimatePresence>
        {showStorybook && taleData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, rotateY: -10 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.9, rotateY: 10 }}
              className="relative w-full max-w-4xl h-[700px]"
            >
              {/* Close button */}
              <button
                onClick={closeStorybook}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              {/* Storybook */}
              <div className="relative w-full h-full">
                <GlassCard className="w-full h-full relative overflow-hidden">
                  {/* Page content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      {renderPage()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy/90 to-transparent">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="text-white" size={24} />
                      </button>

                      <div className="flex items-center gap-4">
                        {/* Voice control */}
                        <button
                          onClick={handleVoiceToggle}
                          className={`p-3 rounded-full transition-all ${
                            isVoiceEnabled 
                              ? 'bg-gradient-to-r from-moss to-sky text-white' 
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isSpeaking ? (
                            <Volume2 size={20} className="animate-pulse" />
                          ) : isVoiceEnabled ? (
                            <Volume2 size={20} />
                          ) : (
                            <VolumeX size={20} />
                          )}
                        </button>

                        {/* Page indicator */}
                        <div className="flex gap-2">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i === currentPage 
                                  ? 'bg-moss w-8' 
                                  : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={nextPage}
                        disabled={currentPage === 6}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="text-white" size={24} />
                      </button>
                    </div>
                  </div>
                </GlassCard>

                {/* Decorative vines */}
                <div className="absolute -top-8 -left-8 text-6xl opacity-30 pointer-events-none">
                  🌿
                </div>
                <div className="absolute -bottom-8 -right-8 text-6xl opacity-30 pointer-events-none">
                  🌸
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

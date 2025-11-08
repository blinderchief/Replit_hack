'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Leaf, Apple, Coffee, Heart } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

interface WhispererNudge {
  message: string
  rescue_tier: 'quick' | 'medium' | 'deep'
  suggestions: Array<{
    type: 'food' | 'activity' | 'sojourn'
    title: string
    description: string
    icon: string
  }>
  affirmation: string
}

interface WhispererResponse {
  needs_intervention: boolean
  nudge?: WhispererNudge
  pattern?: string
  severity?: number
  message?: string
}

interface MoodFoodBasket {
  basket_theme: string
  foods: Array<{
    name: string
    emoji: string
    benefit: string
    science: string
  }>
  ritual: string
}

interface GardenWhispererProps {
  userId: string
  onClose?: () => void
}

export function GardenWhisperer({ userId, onClose }: GardenWhispererProps) {
  const [whispererData, setWhispererData] = useState<WhispererResponse | null>(null)
  const [showNudge, setShowNudge] = useState(false)
  const [showBasket, setShowBasket] = useState(false)
  const [basketData, setBasketData] = useState<MoodFoodBasket | null>(null)
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  // Check for patterns every 30 minutes
  useEffect(() => {
    const checkPatterns = async () => {
      try {
        const response = await fetch('/api/whisperer/check-patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        })
        
        if (response.ok) {
          const data = await response.json()
          setWhispererData(data)
          setLastCheck(new Date())
          
          if (data.needs_intervention) {
            setShowNudge(true)
          }
        }
      } catch (error) {
        console.error('Garden Whisperer check failed:', error)
      }
    }

    // Check immediately on mount
    checkPatterns()

    // Then check every 30 minutes
    const interval = setInterval(checkPatterns, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [userId])

  const fetchMoodFoodBasket = async () => {
    setIsLoadingBasket(true)
    try {
      const response = await fetch(`/api/whisperer/mood-food-basket/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBasketData(data.basket)
        setShowBasket(true)
      }
    } catch (error) {
      console.error('Failed to fetch mood-food basket:', error)
    } finally {
      setIsLoadingBasket(false)
    }
  }

  const handleDismissNudge = () => {
    setShowNudge(false)
    if (onClose) onClose()
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'quick': return 'from-green-400 to-emerald-500'
      case 'medium': return 'from-yellow-400 to-orange-500'
      case 'deep': return 'from-purple-400 to-pink-500'
      default: return 'from-moss to-sky'
    }
  }

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'quick': return <Leaf className="w-6 h-6" />
      case 'medium': return <Heart className="w-6 h-6" />
      case 'deep': return <Sparkles className="w-6 h-6" />
      default: return <Leaf className="w-6 h-6" />
    }
  }

  // Floating Whisperer Avatar (always visible when intervention needed)
  if (whispererData?.needs_intervention && !showNudge) {
    return (
      <motion.button
        onClick={() => setShowNudge(true)}
        className="fixed bottom-24 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="text-white w-8 h-8" />
        </motion.div>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-400/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    )
  }

  return (
    <>
      {/* Whisperer Nudge Modal */}
      <AnimatePresence>
        {showNudge && whispererData?.needs_intervention && whispererData.nudge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleDismissNudge}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              <GlassCard className="relative">
                <button
                  onClick={handleDismissNudge}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Header with tier indicator */}
                <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl bg-gradient-to-r ${getTierColor(whispererData.nudge.rescue_tier)}`}>
                  {getTierIcon(whispererData.nudge.rescue_tier)}
                  <div>
                    <h3 className="text-white font-quicksand font-bold text-lg">
                      Garden Whisperer
                    </h3>
                    <p className="text-white/80 text-xs font-quicksand">
                      {whispererData.nudge.rescue_tier === 'quick' && '🌱 Quick Care'}
                      {whispererData.nudge.rescue_tier === 'medium' && '💚 Gentle Support'}
                      {whispererData.nudge.rescue_tier === 'deep' && '✨ Deep Nurture'}
                    </p>
                  </div>
                </div>

                {/* Whisperer's message */}
                <div className="mb-6">
                  <p className="text-white font-quicksand leading-relaxed">
                    {whispererData.nudge.message}
                  </p>
                </div>

                {/* Suggestions */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-white/80 font-quicksand font-semibold text-sm mb-2">
                    Try one of these:
                  </h4>
                  {whispererData.nudge.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => {
                        if (suggestion.type === 'food') {
                          fetchMoodFoodBasket()
                        } else if (suggestion.type === 'activity') {
                          window.location.href = '/activities'
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-quicksand font-semibold">
                            {suggestion.title}
                          </h5>
                          <p className="text-white/70 text-sm font-quicksand">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Affirmation */}
                <div className="p-4 bg-gradient-to-r from-moss/20 to-sky/20 rounded-lg border border-moss/30">
                  <p className="text-white font-quicksand italic text-center">
                    "{whispererData.nudge.affirmation}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDismissNudge}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-colors"
                  >
                    Not right now
                  </button>
                  <button
                    onClick={() => window.location.href = '/activities'}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-moss to-sky text-white rounded-lg font-quicksand font-semibold hover:shadow-lg transition-all"
                  >
                    Explore Activities
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood-Food Basket Modal */}
      <AnimatePresence>
        {showBasket && basketData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => setShowBasket(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[85vh] overflow-hidden"
            >
              <GlassCard className="relative overflow-hidden">
                <div className="overflow-y-auto max-h-[80vh] custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                  }}
                >
                <button
                  onClick={() => setShowBasket(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Apple className="text-moss w-8 h-8" />
                    <h3 className="text-white font-quicksand font-bold text-2xl">
                      {basketData.basket_theme}
                    </h3>
                  </div>
                  <p className="text-white/70 font-quicksand text-sm">
                    Mood-boosting foods curated just for you
                  </p>
                </div>

                {/* Foods */}
                <div className="space-y-4 mb-6">
                  {basketData.foods.map((food, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-moss/20 to-sky/20 rounded-lg border border-moss/30"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{food.emoji}</span>
                        <div className="flex-1">
                          <h4 className="text-white font-quicksand font-bold mb-1">
                            {food.name}
                          </h4>
                          <p className="text-white/80 text-sm font-quicksand mb-2">
                            {food.benefit}
                          </p>
                          <p className="text-moss text-xs font-quicksand italic">
                            💡 {food.science}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Ritual */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                  <div className="flex items-start gap-2 mb-2">
                    <Coffee className="text-purple-300 w-5 h-5 mt-0.5" />
                    <h4 className="text-white font-quicksand font-semibold">Mindful Ritual</h4>
                  </div>
                  <p className="text-white/80 font-quicksand text-sm">
                    {basketData.ritual}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowBasket(false)}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-moss to-sky text-white rounded-lg font-quicksand font-semibold hover:shadow-lg transition-all"
                >
                  Close Basket
                </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingBasket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="text-moss w-8 h-8" />
              </motion.div>
              <p className="text-white font-quicksand">Preparing your basket...</p>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  )
}

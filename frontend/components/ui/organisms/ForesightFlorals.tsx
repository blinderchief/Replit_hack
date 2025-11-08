'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, TrendingUp, TrendingDown, Minus, Lightbulb, Send } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

interface Scenario {
  type: 'pessimistic' | 'realistic' | 'optimistic'
  title: string
  garden_state: string
  wellness_delta: number
  mood_prediction: number
  key_outcomes: string[]
  emotional_tone: string
  gentle_warning?: string
  encouragement?: string
  inspiration?: string
}

interface SimulationResponse {
  success: boolean
  simulations: {
    scenarios: Scenario[]
    suggested_first_step: string
  }
  what_if_scenario: string
  baseline_state: any
}

interface ForesightFloralsProps {
  userId: string
}

export function ForesightFlorals({ userId }: ForesightFloralsProps) {
  const [showModal, setShowModal] = useState(false)
  const [whatIfInput, setWhatIfInput] = useState('')
  const [simulations, setSimulations] = useState<SimulationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Fetch suggested scenarios
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/simulate/suggested-scenarios/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      }
    }

    if (showModal) {
      fetchSuggestions()
    }
  }, [userId, showModal])

  const runSimulation = async () => {
    if (!whatIfInput.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/simulate/futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          what_if_scenario: whatIfInput,
          timeframe_days: 30
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSimulations(data)
        setSelectedScenario(1) // Default to realistic view
      }
    } catch (error) {
      console.error('Simulation failed:', error)
      alert('Failed to generate simulation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'pessimistic': return { bg: 'from-gray-500 to-slate-600', text: 'text-gray-300', icon: <TrendingDown size={20} /> }
      case 'realistic': return { bg: 'from-sky to-moss', text: 'text-sky', icon: <Minus size={20} /> }
      case 'optimistic': return { bg: 'from-sunset to-pink-500', text: 'text-sunset', icon: <TrendingUp size={20} /> }
      default: return { bg: 'from-moss to-sky', text: 'text-moss', icon: <Sparkles size={20} /> }
    }
  }

  const resetSimulation = () => {
    setSimulations(null)
    setSelectedScenario(null)
    setWhatIfInput('')
  }

  return (
    <>
      {/* Floating Crystal Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 left-24 z-40 group"
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-sky to-purple-500 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden transform rotate-45">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <motion.div
              className="transform -rotate-45"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-white w-8 h-8" />
            </motion.div>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-sky/30 transform rotate-45"
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Tooltip */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <GlassCard className="px-4 py-2 whitespace-nowrap">
            <p className="text-white text-sm font-quicksand">
              Explore future possibilities
            </p>
          </GlassCard>
        </div>
      </motion.button>

      {/* Foresight Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => !isLoading && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              <GlassCard className="relative overflow-hidden">
                <div className="overflow-y-auto max-h-[85vh] custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                  }}
                >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky to-purple-500 rounded-xl flex items-center justify-center transform rotate-45">
                      <Sparkles className="text-white transform -rotate-45" size={24} />
                    </div>
                    <div>
                      <h2 className="text-white font-quicksand font-bold text-3xl">
                        Foresight Florals
                      </h2>
                      <p className="text-white/70 font-quicksand text-sm">
                        Explore what-if scenarios for your garden's future
                      </p>
                    </div>
                  </div>
                </div>

                {!simulations ? (
                  <>
                    {/* What-If Input */}
                    <div className="mb-6">
                      <label className="text-white font-quicksand font-semibold mb-2 block">
                        What if...
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={whatIfInput}
                          onChange={(e) => setWhatIfInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && runSimulation()}
                          placeholder="I start journaling every morning..."
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky font-quicksand"
                          disabled={isLoading}
                        />
                        <button
                          onClick={runSimulation}
                          disabled={!whatIfInput.trim() || isLoading}
                          className="px-6 py-3 bg-gradient-to-r from-sky to-purple-500 text-white rounded-xl font-quicksand font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Sparkles size={20} />
                            </motion.div>
                          ) : (
                            <Send size={20} />
                          )}
                          {isLoading ? 'Simulating...' : 'Simulate'}
                        </button>
                      </div>
                    </div>

                    {/* Suggested Scenarios */}
                    {suggestions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="text-moss" size={18} />
                          <h3 className="text-white font-quicksand font-semibold">
                            Suggested Scenarios
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => setWhatIfInput(suggestion)}
                              className="text-left p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                            >
                              <p className="text-white font-quicksand text-sm">
                                {suggestion}
                              </p>
                              <span className="text-sky text-xs font-quicksand opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to simulate →
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Simulation Results */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-quicksand font-semibold text-lg">
                          Scenario: "{simulations.what_if_scenario}"
                        </h3>
                        <button
                          onClick={resetSimulation}
                          className="text-white/60 hover:text-white text-sm font-quicksand transition-colors"
                        >
                          Try another scenario
                        </button>
                      </div>

                      {/* Scenario Tabs */}
                      <div className="flex gap-2 mb-6">
                        {simulations.simulations.scenarios.map((scenario, index) => {
                          const colors = getScenarioColor(scenario.type)
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedScenario(index)}
                              className={`flex-1 py-3 px-4 rounded-xl font-quicksand font-semibold transition-all ${
                                selectedScenario === index
                                  ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg`
                                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {colors.icon}
                                <span className="capitalize">{scenario.type}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Selected Scenario Details */}
                      {selectedScenario !== null && (
                        <motion.div
                          key={selectedScenario}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          {(() => {
                            const scenario = simulations.simulations.scenarios[selectedScenario]
                            const colors = getScenarioColor(scenario.type)
                            
                            return (
                              <>
                                <GlassCard className={`bg-gradient-to-br ${colors.bg.replace('to-', 'to-transparent ')}/20 border-2 border-${colors.text.replace('text-', '')}/30`}>
                                  <h4 className={`${colors.text} font-quicksand font-bold text-2xl mb-3`}>
                                    {scenario.title}
                                  </h4>
                                  <p className="text-white font-quicksand leading-relaxed mb-4">
                                    {scenario.garden_state}
                                  </p>
                                  
                                  {/* Metrics */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-white/10 rounded-lg">
                                      <p className="text-white/60 text-xs font-quicksand mb-1">Wellness Change</p>
                                      <p className={`text-2xl font-bold font-quicksand ${scenario.wellness_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {scenario.wellness_delta > 0 ? '+' : ''}{scenario.wellness_delta}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-lg">
                                      <p className="text-white/60 text-xs font-quicksand mb-1">Mood Shift</p>
                                      <p className={`text-2xl font-bold font-quicksand ${scenario.mood_prediction > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {scenario.mood_prediction > 0 ? '+' : ''}{scenario.mood_prediction.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Key Outcomes */}
                                  <div className="mb-4">
                                    <h5 className="text-white font-quicksand font-semibold mb-2">Key Outcomes:</h5>
                                    <ul className="space-y-2">
                                      {scenario.key_outcomes.map((outcome, i) => (
                                        <li key={i} className="flex items-start gap-2 text-white/90 font-quicksand text-sm">
                                          <span className={colors.text}>•</span>
                                          {outcome}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Emotional Tone */}
                                  <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-white/70 font-quicksand text-sm">
                                      <span className="font-semibold">Emotional tone:</span> {scenario.emotional_tone}
                                    </p>
                                  </div>

                                  {/* Message */}
                                  {scenario.gentle_warning && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-4">
                                      <p className="text-white font-quicksand text-sm italic">
                                        💭 {scenario.gentle_warning}
                                      </p>
                                    </div>
                                  )}
                                  {scenario.encouragement && (
                                    <div className="p-4 bg-sky/10 border border-sky/30 rounded-lg mt-4">
                                      <p className="text-white font-quicksand text-sm italic">
                                        💙 {scenario.encouragement}
                                      </p>
                                    </div>
                                  )}
                                  {scenario.inspiration && (
                                    <div className="p-4 bg-sunset/10 border border-sunset/30 rounded-lg mt-4">
                                      <p className="text-white font-quicksand text-sm italic">
                                        ✨ {scenario.inspiration}
                                      </p>
                                    </div>
                                  )}
                                </GlassCard>
                              </>
                            )
                          })()}
                        </motion.div>
                      )}

                      {/* First Step */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-moss/20 to-sky/20 rounded-xl border border-moss/30">
                        <h4 className="text-white font-quicksand font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="text-moss" size={18} />
                          Your First Step
                        </h4>
                        <p className="text-white/90 font-quicksand">
                          {simulations.simulations.suggested_first_step}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

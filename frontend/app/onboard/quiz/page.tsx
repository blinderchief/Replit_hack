'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sparkles, Wind, BookOpen, Heart, Droplet, ChevronRight, ChevronLeft } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'
import { FloatingOrb } from '@/components/ui/atoms/FloatingOrb'

interface QuizCard {
  id: string
  question: string
  icon: React.ReactNode
  options: {
    value: string
    label: string
    description: string
    icon: string
  }[]
}

const quizCards: QuizCard[] = [
  {
    id: 'ritual_type',
    question: 'What whispers your calm?',
    icon: <Sparkles className="w-12 h-12" />,
    options: [
      { value: 'sounds', label: 'Sounds & Music', description: 'Ambient soundscapes and melodies', icon: '🎵' },
      { value: 'stories', label: 'Stories & Tales', description: 'Narrative journeys and fables', icon: '📖' },
      { value: 'activities', label: 'Active Rituals', description: 'Breathing, journaling, movement', icon: '🌬️' }
    ]
  },
  {
    id: 'stress_response',
    question: 'When stress blooms, you prefer to...',
    icon: <Wind className="w-12 h-12" />,
    options: [
      { value: 'breathe', label: 'Breathe Deeply', description: 'Calm through mindful breathing', icon: '🫁' },
      { value: 'express', label: 'Express & Write', description: 'Journal thoughts and feelings', icon: '✍️' },
      { value: 'ground', label: 'Ground Senses', description: 'Connect with present moment', icon: '🧘' }
    ]
  },
  {
    id: 'creative_outlet',
    question: 'Your creative spark ignites through...',
    icon: <Heart className="w-12 h-12" />,
    options: [
      { value: 'words', label: 'Words & Poetry', description: 'Written expression and verses', icon: '📝' },
      { value: 'visual', label: 'Visual Imagery', description: 'Colors, shapes, and art', icon: '🎨' },
      { value: 'sound', label: 'Sound & Voice', description: 'Music, audio, and spoken word', icon: '🎤' }
    ]
  },
  {
    id: 'support_style',
    question: 'In difficult moments, you seek...',
    icon: <Droplet className="w-12 h-12" />,
    options: [
      { value: 'proactive', label: 'Proactive Guidance', description: 'Anticipate needs before they arise', icon: '🔮' },
      { value: 'responsive', label: 'Responsive Support', description: 'Help when you ask for it', icon: '🤝' },
      { value: 'reflective', label: 'Reflective Insights', description: 'Understand patterns over time', icon: '🌙' }
    ]
  },
  {
    id: 'connection_preference',
    question: 'You feel most connected through...',
    icon: <BookOpen className="w-12 h-12" />,
    options: [
      { value: 'community', label: 'Shared Wisdom', description: 'Anonymous community seeds', icon: '🌍' },
      { value: 'personal', label: 'Personal Journey', description: 'Solo reflection and growth', icon: '🌱' },
      { value: 'both', label: 'Balance of Both', description: 'Mix of community and solitude', icon: '⚖️' }
    ]
  }
]

export default function RitualQuiz() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const [currentCard, setCurrentCard] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/onboard')
    }
  }, [isSignedIn, router])

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Auto-advance after selection
    setTimeout(() => {
      if (currentCard < quizCards.length - 1) {
        setDirection(1)
        setCurrentCard(prev => prev + 1)
      }
    }, 300)
  }

  const handlePrevious = () => {
    if (currentCard > 0) {
      setDirection(-1)
      setCurrentCard(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizCards.length) return

    setIsSubmitting(true)

    try {
      // Save preferences to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          preferences: answers
        })
      })

      if (response.ok) {
        // Redirect to garden with sprouting animation
        router.push('/garden?welcome=true')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentCard + 1) / quizCards.length) * 100
  const currentQuestion = quizCards[currentCard]
  const isLastCard = currentCard === quizCards.length - 1
  const canProceed = answers[currentQuestion.id]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy via-navy-light to-moss flex items-center justify-center p-4">
      {/* Background orbs */}
      <FloatingOrb size={200} color="#A8D5BA" delay={0} className="top-10 left-10" />
      <FloatingOrb size={150} color="#F4A261" delay={1.5} className="bottom-20 right-20" />
      <FloatingOrb size={180} color="#FFB6D9" delay={3} className="top-1/2 right-10" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 font-quicksand text-sm">
              Question {currentCard + 1} of {quizCards.length}
            </span>
            <span className="text-moss font-quicksand font-semibold text-sm">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-moss to-sunset"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Card container */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCard}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard hover={false}>
              {/* Question header */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-moss to-sunset text-white mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentQuestion.icon}
                </motion.div>
                <h2 className="text-2xl font-bold font-quicksand text-white mb-2">
                  {currentQuestion.question}
                </h2>
                <p className="text-white/60 font-quicksand text-sm">
                  Choose what resonates with your soul
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className={`w-full p-4 rounded-xl transition-all text-left ${
                      answers[currentQuestion.id] === option.value
                        ? 'bg-gradient-to-r from-moss/30 to-sunset/30 border-2 border-moss'
                        : 'bg-white/5 border-2 border-white/10 hover:border-moss/50'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-quicksand font-semibold text-white mb-1">
                          {option.label}
                        </div>
                        <div className="font-quicksand text-sm text-white/60">
                          {option.description}
                        </div>
                      </div>
                      {answers[currentQuestion.id] === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-moss flex items-center justify-center"
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentCard === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-quicksand"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {isLastCard && canProceed ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-moss to-sunset text-white font-semibold font-quicksand hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Growing Your Garden...' : 'Begin Journey'}
                    <Sparkles className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="text-white/40 font-quicksand text-sm">
                    {canProceed ? 'Auto-advancing...' : 'Select an option'}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Sprouting animation for last card */}
        {isLastCard && canProceed && (
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-2"
            >
              🌱
            </motion.div>
            <p className="text-white/80 font-quicksand">
              Your personalized garden is ready to bloom
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

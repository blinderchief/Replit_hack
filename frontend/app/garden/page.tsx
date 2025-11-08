'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdvancedGarden } from '@/components/ui/organisms/AdvancedGarden'
import { InsightGrove } from '@/components/ui/organisms/InsightGrove'
import { GardenWhisperer } from '@/components/ui/organisms/GardenWhisperer'
import { DawnWeaves } from '@/components/ui/organisms/DawnWeaves'
import { WhisperWeave } from '@/components/ui/organisms/WhisperWeave'
import { ForesightFlorals } from '@/components/ui/organisms/ForesightFlorals'
import { SensorySymphonies } from '@/components/ui/organisms/SensorySymphonies'
import { AffirmationWeavings } from '@/components/ui/organisms/AffirmationWeavings'
import { GestaltGreenhouse } from '@/components/ui/organisms/GestaltGreenhouse'
import { GlassCard } from '@/components/ui/molecules/GlassCard'
import { Mic, Send, Sparkles, TrendingUp, Heart, Award, Target, Brain, Activity } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'

interface Echo {
  id: number
  content: string
  ai_response: string
  mood_score: number
  emotion_tags: string[]
  seed_type: string
  growth_stage: number
  created_at: string
  timestamp?: string
}

interface UserProfile {
  total_echoes: number
  wellness_score: number
  mood_average: number
  current_streak: number
  achievements: string[]
  mood_trend_week: number[]
  mood_trend_direction: string
}

interface WellnessInsights {
  mood_trend: string
  dominant_emotion: string
  wellness_score: number
  streak: number
  total_reflections: number
  suggestion: string
}

type GardenView = 'garden' | 'insights'

export default function Garden() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [echoes, setEchoes] = useState<Echo[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentResponse, setCurrentResponse] = useState('')
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentView, setCurrentView] = useState<GardenView>('garden')
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [notification, setNotification] = useState('')
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [activityStats, setActivityStats] = useState<any>(null)
  const [mostRecentEcho, setMostRecentEcho] = useState<Echo | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/onboard')
    }
  }, [isSignedIn, router])

  // Fetch user profile and echoes on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserData()
    }
  }, [user?.id])

  const fetchUserData = async () => {
    if (!user?.id) return
    
    try {
      // Fetch profile
      const profileRes = await apiFetch(`/api/profile/${user.id}`)
      const profileData = await profileRes.json()
      setProfile(profileData)
      
      // Fetch echoes
      const echoesRes = await apiFetch(`/api/echoes/${user.id}`)
      const echoesData = await echoesRes.json()
      setEchoes(echoesData.echoes || [])
      
      // Fetch activity stats
      const statsRes = await apiFetch(`/api/activities/stats/${user.id}`)
      const statsData = await statsRes.json()
      setActivityStats(statsData)
      
      // Fetch recent activities (last 5 from each type)
      const activities = []
      try {
        const breathingRes = await apiFetch(`/api/activities/breathing/${user.id}?limit=3`)
        const breathingData = await breathingRes.json()
        activities.push(...(breathingData.sessions || []).map((s: any) => ({ ...s, type: 'breathing' })))
      } catch (e) {}
      
      try {
        const journalRes = await apiFetch(`/api/activities/journal/${user.id}?limit=3`)
        const journalData = await journalRes.json()
        activities.push(...(journalData.entries || []).map((e: any) => ({ ...e, type: 'journal' })))
      } catch (e) {}
      
      try {
        const gratitudeRes = await apiFetch(`/api/activities/gratitude/${user.id}?limit=3`)
        const gratitudeData = await gratitudeRes.json()
        activities.push(...(gratitudeData.entries || []).map((e: any) => ({ ...e, type: 'gratitude' })))
      } catch (e) {}
      
      try {
        const groundingRes = await apiFetch(`/api/activities/grounding/${user.id}?limit=3`)
        const groundingData = await groundingRes.json()
        activities.push(...(groundingData.sessions || []).map((s: any) => ({ ...s, type: 'grounding' })))
      } catch (e) {}
      
      // Sort by date and take top 5
      activities.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handlePlantEcho = async () => {
    if (!input.trim() || !user?.id) return

    setIsLoading(true)
    setShowPlantModal(false)

    try {
      const response = await apiFetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input,
          userId: user.id 
        })
      })

      const data = await response.json()
      
      setCurrentResponse(data.response)
      setWellnessInsights(data.wellness_insights)
      setInput('')
      
      // Show AI response
      setNotification(`🌱 ${data.response}`)
      setTimeout(() => setNotification(''), 8000)
      
      // Refresh data and get the newly planted echo
      await fetchUserData()
      
      // Set the most recent echo for affirmation trigger
      // The newest echo will be at the end of the echoes array after refresh
      if (data.echo) {
        setMostRecentEcho({
          id: data.echo.id,
          content: data.echo.content,
          mood_score: data.echo.mood_score,
          emotion_tags: data.echo.emotion_tags,
          ai_response: data.echo.ai_response || '',
          seed_type: data.echo.seed_type || '',
          growth_stage: data.echo.growth_stage || 1,
          created_at: data.echo.created_at || new Date().toISOString()
        })
      }
      
      setTimeout(() => setCurrentResponse(''), 10000)
    } catch (error) {
      console.error('Error planting echo:', error)
      setNotification('❌ Failed to plant echo. Please try again.')
      setTimeout(() => setNotification(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setNotification('⚠️ Voice input not supported in your browser. Try Chrome or Edge.')
      setTimeout(() => setNotification(''), 3000)
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setNotification('🎤 Listening... Speak now!')
      setTimeout(() => setNotification(''), 3000)
    }
    
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setNotification(`✅ Got it: "${transcript}"`)
      setTimeout(() => setNotification(''), 3000)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      
      // Handle different error types with appropriate messages
      const errorMessages: Record<string, string> = {
        'no-speech': '🎤 No speech detected. Please try again and speak clearly.',
        'audio-capture': '❌ Microphone not found. Please check your microphone settings.',
        'not-allowed': '❌ Microphone access denied. Please allow microphone permissions.',
        'network': '❌ Network error. Please check your internet connection.',
        'aborted': '⚠️ Voice input cancelled.',
        'language-not-supported': '❌ Language not supported. Try switching to English.',
      }
      
      const userMessage = errorMessages[event.error] || `❌ Voice input error: ${event.error}`
      
      // Only log actual errors (not no-speech which is common/expected)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
      
      setNotification(userMessage)
      setTimeout(() => setNotification(''), 5000) // Longer timeout for error messages
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsListening(false)
      setNotification('❌ Could not start voice input. Please try again.')
      setTimeout(() => setNotification(''), 3000)
    }
  }

  const achievementIcons: Record<string, string> = {
    first_bloom: '🌱',
    week_warrior: '🔥',
    gratitude_guru: '🙏',
    mood_master: '😊'
  }

  if (!isSignedIn || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-moss">
      {/* Header */}
      <div className="relative z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-quicksand font-bold text-white flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Sparkles className="text-sunset" />
            Your Wellness Garden
          </motion.h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/insights')}
              className="px-4 py-2 bg-sky/80 hover:bg-sky text-white rounded-lg font-quicksand transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => router.push('/activities')}
              className="px-4 py-2 bg-sunset/80 hover:bg-sunset text-white rounded-lg font-quicksand transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Activities
            </button>
            <button
              onClick={() => router.push('/seeds')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-all"
            >
              Explore Seeds
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-all"
            >
              Profile
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl"
          >
            <GlassCard className="px-6 py-4">
              <p className="text-white font-quicksand text-center">{notification}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Wellness Stats */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Wellness Score */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-quicksand font-semibold flex items-center gap-2">
                <Brain className="text-moss" size={20} />
                Wellness Score
              </h3>
            </div>
            <div className="relative">
              <div className="text-5xl font-bold text-center mb-2">
                <span className="bg-gradient-to-r from-moss to-sunset bg-clip-text text-transparent">
                  {profile?.wellness_score || 50}
                </span>
              </div>
              <p className="text-white/60 text-center text-sm font-quicksand">
                {profile?.mood_trend_direction === 'improving' ? '📈 Improving!' : '🌟 Stay consistent'}
              </p>
            </div>
          </GlassCard>

          {/* Streak */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-quicksand">Current Streak</p>
                <p className="text-2xl font-bold text-sunset">{profile?.current_streak || 0} days 🔥</p>
              </div>
              <Activity className="text-moss" size={32} />
            </div>
          </GlassCard>

          {/* Total Echoes */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-quicksand">Total Reflections</p>
                <p className="text-2xl font-bold text-moss">{profile?.total_echoes || 0}</p>
              </div>
              <Heart className="text-petal" size={32} />
            </div>
          </GlassCard>

          {/* Achievements */}
          {profile?.achievements && profile.achievements.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="text-white font-quicksand font-semibold mb-3 flex items-center gap-2">
                <Award className="text-sunset" size={20} />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.map((achievement) => (
                  <span
                    key={achievement}
                    className="text-2xl"
                    title={achievement.replace('_', ' ')}
                  >
                    {achievementIcons[achievement] || '🏆'}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Wellness Suggestion */}
          {wellnessInsights?.suggestion && (
            <GlassCard hover={false} className="bg-moss/20">
              <h3 className="text-white font-quicksand font-semibold mb-2 flex items-center gap-2">
                <Target className="text-moss" size={18} />
                Today's Practice
              </h3>
              <p className="text-white/80 text-sm font-quicksand">
                {wellnessInsights.suggestion}
              </p>
            </GlassCard>
          )}

          {/* AI Activity Recommendations */}
          {echoes.length > 0 && (
            <GlassCard hover={false} className="bg-sky/20 border-sky/30">
              <h3 className="text-white font-quicksand font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="text-sky" size={18} />
                Recommended for You
              </h3>
              {(() => {
                const recentMood = echoes[echoes.length - 1]?.mood_score || 0
                const recentEmotion = echoes[echoes.length - 1]?.emotion_tags?.[0] || ''
                
                if (recentMood < -0.3 || ['anxious', 'stressed', 'overwhelmed'].includes(recentEmotion.toLowerCase())) {
                  return (
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push('/activities/breathing')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">🌬️</span>
                          <span className="text-sm font-quicksand">Try breathing exercises</span>
                        </div>
                      </button>
                      <button
                        onClick={() => router.push('/activities/grounding')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">🧘</span>
                          <span className="text-sm font-quicksand">Practice grounding</span>
                        </div>
                      </button>
                    </div>
                  )
                } else if (recentMood < 0 || ['sad', 'lonely', 'disappointed'].includes(recentEmotion.toLowerCase())) {
                  return (
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push('/activities/gratitude')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">🙏</span>
                          <span className="text-sm font-quicksand">Practice gratitude</span>
                        </div>
                      </button>
                      <button
                        onClick={() => router.push('/activities/journal')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">📝</span>
                          <span className="text-sm font-quicksand">Journal your thoughts</span>
                        </div>
                      </button>
                    </div>
                  )
                } else {
                  return (
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push('/activities/gratitude')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">🙏</span>
                          <span className="text-sm font-quicksand">Amplify your positivity</span>
                        </div>
                      </button>
                      <button
                        onClick={() => router.push('/activities/breathing')}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">🌬️</span>
                          <span className="text-sm font-quicksand">Maintain your calm</span>
                        </div>
                      </button>
                    </div>
                  )
                }
              })()}
            </GlassCard>
          )}

          {/* Recent Activities */}
          {recentActivities.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="text-white font-quicksand font-semibold mb-3 flex items-center gap-2">
                <Activity className="text-sunset" size={18} />
                Recent Activities
              </h3>
              <div className="space-y-2">
                {recentActivities.map((activity, index) => {
                  const activityIcons: Record<string, string> = {
                    breathing: '🌬️',
                    journal: '📝',
                    gratitude: '🙏',
                    grounding: '🧘'
                  }
                  const activityNames: Record<string, string> = {
                    breathing: 'Breathing',
                    journal: 'Journal',
                    gratitude: 'Gratitude',
                    grounding: 'Grounding'
                  }
                  const timeAgo = (date: string) => {
                    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
                    if (seconds < 60) return 'just now'
                    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
                    return `${Math.floor(seconds / 86400)}d ago`
                  }
                  
                  return (
                    <motion.div
                      key={`${activity.type}-${activity.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                    >
                      <span className="text-xl">{activityIcons[activity.type]}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-quicksand">{activityNames[activity.type]}</p>
                        <p className="text-white/50 text-xs">{timeAgo(activity.completed_at)}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          )}

          {/* Activity Stats Summary */}
          {activityStats && activityStats.total > 0 && (
            <GlassCard hover={false} className="bg-gradient-to-br from-moss/20 to-sunset/20">
              <h3 className="text-white font-quicksand font-semibold mb-3 text-center">
                This Week
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-moss">{activityStats.this_week_count || 0}</p>
                  <p className="text-white/60 text-xs font-quicksand">Activities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-sunset">{activityStats.total || 0}</p>
                  <p className="text-white/60 text-xs font-quicksand">Total</p>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>

        {/* Center - Garden & Insights */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          {/* View Toggle Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentView('garden')}
              className={`flex-1 py-3 px-4 rounded-xl font-quicksand font-semibold transition-all flex items-center justify-center gap-2 ${
                currentView === 'garden'
                  ? 'bg-gradient-to-r from-moss to-sky text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Sparkles size={18} />
              3D Garden
            </button>
            <button
              onClick={() => setCurrentView('insights')}
              className={`flex-1 py-3 px-4 rounded-xl font-quicksand font-semibold transition-all flex items-center justify-center gap-2 ${
                currentView === 'insights'
                  ? 'bg-gradient-to-r from-sunset to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Brain size={18} />
              Insight Grove
            </button>
          </div>

          <GlassCard className="h-[600px] p-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentView === 'garden' ? (
                <motion.div
                  key="garden-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full h-full"
                >
                  {echoes.length > 0 ? (
                    <AdvancedGarden 
                      echoes={echoes} 
                      wellness_score={profile?.wellness_score || 50}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <Sparkles className="text-moss" size={64} />
                      <p className="text-white font-quicksand text-xl">Your garden awaits...</p>
                      <p className="text-white/60 text-center font-quicksand max-w-md">
                        Plant your first echo to begin your wellness journey. Share your thoughts, feelings, or gratitude.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="insights-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full overflow-y-auto p-6"
                >
                  <InsightGrove echoes={echoes} activities={recentActivities} />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Plant Echo Button */}
          <motion.button
            onClick={() => setShowPlantModal(true)}
            className="mt-6 w-full py-4 bg-gradient-to-r from-moss to-sunset text-white rounded-xl font-quicksand font-semibold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={24} />
            Plant an Echo
          </motion.button>
        </motion.div>

        {/* Right Sidebar - Recent Echoes */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 space-y-4"
        >
          <GlassCard hover={false}>
            <h3 className="text-white font-quicksand font-semibold mb-4">Recent Reflections</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {echoes.slice(0, 10).map((echo) => {
                // Color mapping for emotion tags
                const emotionColors: Record<string, string> = {
                  joy: 'bg-yellow-400/30 text-yellow-200',
                  gratitude: 'bg-pink-400/30 text-pink-200',
                  hope: 'bg-green-400/30 text-green-200',
                  calm: 'bg-blue-400/30 text-blue-200',
                  anxiety: 'bg-purple-400/30 text-purple-200',
                  sad: 'bg-blue-600/30 text-blue-300',
                  anger: 'bg-red-400/30 text-red-200',
                  excited: 'bg-orange-400/30 text-orange-200',
                  proud: 'bg-indigo-400/30 text-indigo-200',
                  love: 'bg-pink-600/30 text-pink-300'
                }
                
                return (
                  <motion.div
                    key={echo.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {echo.mood_score > 0.3 ? '🌟' : echo.mood_score > 0 ? '🌼' : echo.mood_score > -0.3 ? '🌿' : '🍂'}
                      </span>
                      <p className="text-white/90 text-sm font-quicksand line-clamp-2 flex-1">
                        {echo.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {echo.emotion_tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs font-quicksand ${
                            emotionColors[tag.toLowerCase()] || 'bg-moss/30 text-moss'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs font-quicksand">
                        {new Date(echo.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(echo.growth_stage)].map((_, i) => (
                          <span key={i} className="text-xs">
                            {i === echo.growth_stage - 1 ? '🌸' : '🌱'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Plant Modal */}
      <AnimatePresence>
        {showPlantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlantModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <GlassCard>
                <h2 className="text-2xl font-quicksand font-bold text-white mb-4 flex items-center gap-3">
                  <Sparkles className="text-sunset" />
                  Plant Your Echo
                </h2>
                <p className="text-white/70 font-quicksand mb-6">
                  Share what's on your mind. Express gratitude, concerns, joys, or reflections. Your garden is here to listen.
                </p>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What are you feeling today?..."
                  className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-moss font-quicksand resize-none"
                  autoFocus
                />
                
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleVoiceInput}
                    disabled={isListening}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Mic size={18} className={isListening ? 'animate-pulse text-red-400' : ''} />
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPlantModal(false)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePlantEcho}
                      disabled={!input.trim() || isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-moss to-sunset text-white rounded-lg font-quicksand font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Planting...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Plant Echo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden Whisperer - Proactive AI Support */}
      {user?.id && <GardenWhisperer userId={user.id} />}
      
      {/* Dawn Weaves - Predictive Mood Alerts */}
      {user?.id && <DawnWeaves userId={user.id} />}
      
      {/* Whisper Weave - AI-Coauthored Tales */}
      {user?.id && <WhisperWeave userId={user.id} />}
      
      {/* Foresight Florals - Future-Self Simulations */}
      {user?.id && <ForesightFlorals userId={user.id} />}
      
      {/* Sensory Symphonies - Procedural Soundscapes */}
      {user?.id && <SensorySymphonies userId={user.id} />}
      
      {/* Affirmation Weavings - Vent→Mantra Transformation */}
      {user?.id && (
        <AffirmationWeavings 
          userId={user.id} 
          mostRecentEcho={mostRecentEcho}
          onAffirmationComplete={() => setMostRecentEcho(null)}
        />
      )}
      
      {/* Gestalt Greenhouse - Emotion Alchemy Lab */}
      {user?.id && <GestaltGreenhouse userId={user.id} />}
    </div>
  )
}

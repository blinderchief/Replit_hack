'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Calendar, Activity, Sparkles, X } from 'lucide-react'

interface Pattern {
  id: string
  title: string
  description: string
  confidence: number
  type: 'positive' | 'neutral' | 'concern'
  recommendations: string[]
  data: {
    day?: string
    activity?: string
    emotion?: string
    trend?: string
  }
}

interface InsightGroveProps {
  echoes: any[]
  activities: any[]
}

export function InsightGrove({ echoes, activities }: InsightGroveProps) {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)

  // Analyze patterns from echoes and activities
  const patterns = useMemo(() => {
    const detectedPatterns: Pattern[] = []

    if (echoes.length === 0) return detectedPatterns

    // Day of week pattern analysis
    const dayMoodMap: Record<string, number[]> = {}
    echoes.forEach(echo => {
      const date = new Date(echo.timestamp)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      if (!dayMoodMap[day]) dayMoodMap[day] = []
      dayMoodMap[day].push(echo.mood_score)
    })

    // Find worst day
    let worstDay = ''
    let worstAvg = 1
    Object.entries(dayMoodMap).forEach(([day, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg < worstAvg) {
        worstAvg = avg
        worstDay = day
      }
    })

    if (worstDay && worstAvg < -0.2) {
      detectedPatterns.push({
        id: 'day-pattern',
        title: `Your ${worstDay}s tend to wilt`,
        description: `Pattern detected: Mood dips on ${worstDay}s (avg mood: ${(worstAvg * 100).toFixed(0)}/100). This could indicate end-of-week fatigue or routine disruption.`,
        confidence: Math.min(dayMoodMap[worstDay].length * 10, 95),
        type: 'concern',
        recommendations: [
          `Schedule self-care rituals on ${worstDay} mornings`,
          'Try box breathing during ${worstDay} afternoon slumps',
          'Plan lighter workloads or rest activities for ${worstDay}s'
        ],
        data: { day: worstDay, trend: 'declining' }
      })
    }

    // Activity correlation analysis
    const activityMoodMap: Record<string, number[]> = {}
    activities.forEach(act => {
      if (!activityMoodMap[act.activity_type]) activityMoodMap[act.activity_type] = []
      // Find echoes near this activity time
      const actTime = new Date(act.completed_at).getTime()
      const nearbyEchoes = echoes.filter(e => {
        const diff = Math.abs(new Date(e.timestamp).getTime() - actTime)
        return diff < 3600000 * 2 // Within 2 hours
      })
      nearbyEchoes.forEach(e => activityMoodMap[act.activity_type].push(e.mood_score))
    })

    // Find best activity
    let bestActivity = ''
    let bestAvg = -1
    Object.entries(activityMoodMap).forEach(([activity, scores]) => {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        if (avg > bestAvg) {
          bestAvg = avg
          bestActivity = activity
        }
      }
    })

    if (bestActivity && bestAvg > 0.1) {
      const activityNames: Record<string, string> = {
        breathing: 'Box Breathing',
        journal: 'Journaling',
        gratitude: 'Gratitude Practice',
        grounding: 'Grounding Exercise'
      }

      detectedPatterns.push({
        id: 'activity-pattern',
        title: `${activityNames[bestActivity] || bestActivity} blooms brightest`,
        description: `Your mood lifts most after ${activityNames[bestActivity] || bestActivity} sessions (avg boost: +${(bestAvg * 100).toFixed(0)} points). This ritual resonates with your nervous system.`,
        confidence: Math.min(activityMoodMap[bestActivity].length * 15, 90),
        type: 'positive',
        recommendations: [
          `Practice ${activityNames[bestActivity] || bestActivity} during stress peaks`,
          'Increase frequency to 2-3x per week for sustained uplift',
          `Share ${bestActivity} seeds with community for mutual support`
        ],
        data: { activity: bestActivity, trend: 'improving' }
      })
    }

    // Recent trend analysis
    if (echoes.length >= 7) {
      const recentEchoes = echoes.slice(-7)
      const olderEchoes = echoes.slice(Math.max(0, echoes.length - 14), echoes.length - 7)
      
      const recentAvg = recentEchoes.reduce((sum, e) => sum + e.mood_score, 0) / recentEchoes.length
      const olderAvg = olderEchoes.length > 0 
        ? olderEchoes.reduce((sum, e) => sum + e.mood_score, 0) / olderEchoes.length 
        : 0

      const change = recentAvg - olderAvg
      
      if (Math.abs(change) > 0.1) {
        detectedPatterns.push({
          id: 'trend-pattern',
          title: change > 0 ? 'Your garden is blooming stronger' : 'Recent clouds gathering',
          description: change > 0
            ? `Upward trend detected: Mood improved by ${(change * 100).toFixed(0)} points over the past week. Your rituals are working!`
            : `Gentle dip noticed: Mood decreased by ${(-change * 100).toFixed(0)} points recently. This is temporary—let's nurture your roots.`,
          confidence: Math.min(recentEchoes.length * 12, 85),
          type: change > 0 ? 'positive' : 'concern',
          recommendations: change > 0 ? [
            'Maintain current ritual frequency',
            'Document what\'s working in journal entries',
            'Consider sharing your growth journey as seeds'
          ] : [
            'Return to activities that previously helped',
            'Reach out to someone you trust',
            'Try the 5-4-3-2-1 grounding exercise'
          ],
          data: { trend: change > 0 ? 'improving' : 'declining' }
        })
      }
    }

    // Emotion pattern detection
    const emotionCounts: Record<string, number> = {}
    echoes.forEach(echo => {
      echo.emotion_tags?.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    })

    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]

    if (dominantEmotion && dominantEmotion[1] >= 3) {
      const [emotion, count] = dominantEmotion
      const percentage = ((count / echoes.length) * 100).toFixed(0)

      detectedPatterns.push({
        id: 'emotion-pattern',
        title: `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} echoes most`,
        description: `"${emotion}" appears in ${percentage}% of your echoes. This recurring theme shapes your emotional landscape and offers insight into your inner world.`,
        confidence: Math.min(count * 8, 80),
        type: ['anxiety', 'sad', 'overwhelmed'].includes(emotion.toLowerCase()) ? 'concern' : 'neutral',
        recommendations: [
          `Explore the roots of ${emotion} in guided journal prompts`,
          `Practice opposite emotions through gratitude when ${emotion} rises`,
          `Consider: What does ${emotion} need from you?`
        ],
        data: { emotion }
      })
    }

    return detectedPatterns
  }, [echoes, activities])

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'positive': return { icon: TrendingUp, color: 'text-moss' }
      case 'concern': return { icon: TrendingDown, color: 'text-sunset' }
      default: return { icon: Brain, color: 'text-sky' }
    }
  }

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'positive': return 'from-moss/20 to-moss/10 border-moss/30'
      case 'concern': return 'from-sunset/20 to-petal/10 border-sunset/30'
      default: return 'from-sky/20 to-sky/10 border-sky/30'
    }
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-moss/10 mb-4"
        >
          <Brain className="w-10 h-10 text-moss" />
        </motion.div>
        <h3 className="text-xl font-quicksand font-semibold text-white mb-2">
          Your Insight Grove is Growing
        </h3>
        <p className="text-white/60 font-quicksand max-w-md mx-auto">
          Plant more echoes and complete activities to uncover patterns and wisdom from your journey.
          Insights emerge after 5+ echoes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-moss to-sunset">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-quicksand font-bold text-white">Insight Grove</h3>
          <p className="text-white/60 text-sm font-quicksand">
            AI-discovered patterns from your garden
          </p>
        </div>
      </div>

      {/* Pattern nodes */}
      <div className="grid gap-4 md:grid-cols-2">
        {patterns.map((pattern, index) => {
          const { icon: Icon, color } = getPatternIcon(pattern.type)
          
          return (
            <motion.button
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-5 rounded-xl bg-gradient-to-br ${getPatternColor(pattern.type)} border-2 text-left transition-all hover:shadow-xl`}
            >
              {/* Confidence indicator */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70 font-quicksand">
                {pattern.confidence}% confident
              </div>

              {/* Icon and title */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="flex-1 font-quicksand font-semibold text-white text-lg leading-tight">
                  {pattern.title}
                </h4>
              </div>

              {/* Description preview */}
              <p className="text-white/70 text-sm font-quicksand line-clamp-2 mb-3">
                {pattern.description}
              </p>

              {/* Tap to expand hint */}
              <div className="flex items-center gap-2 text-white/50 text-xs font-quicksand">
                <Sparkles className="w-3 h-3" />
                <span>Tap to unfurl recommendations</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedPattern && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPattern(null)}
            className="fixed inset-0 bg-navy/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl bg-gradient-to-br ${getPatternColor(selectedPattern.type)} border-2 rounded-2xl p-8 relative`}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPattern(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-white/10 ${getPatternIcon(selectedPattern.type).color}`}>
                  {(() => {
                    const { icon: Icon } = getPatternIcon(selectedPattern.type)
                    return <Icon className="w-8 h-8" />
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-quicksand font-bold text-white mb-2">
                    {selectedPattern.title}
                  </h3>
                  <p className="text-white/80 font-quicksand">
                    {selectedPattern.description}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h4 className="font-quicksand font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-moss" />
                  Ritual Recommendations
                </h4>
                <ul className="space-y-3">
                  {selectedPattern.recommendations.map((rec, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-white/90 font-quicksand"
                    >
                      <span className="text-sunset font-bold">•</span>
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-sm text-white/50 font-quicksand">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Based on {echoes.length} echoes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>{selectedPattern.confidence}% confidence</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

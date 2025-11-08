'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sunrise, AlertCircle, ChevronRight, Calendar, Heart } from 'lucide-react'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

interface MicroRitual {
  time: 'morning' | 'afternoon' | 'evening'
  action: string
  why: string
}

interface ShieldStory {
  title: string
  story: string
  micro_rituals: MicroRitual[]
  affirmation: string
  metaphor: string
}

interface DawnWeaveAlert {
  shield_story: ShieldStory
  predicted_day: string
  next_date: string
  confidence: number
  days_away: number
  is_urgent: boolean
  alert_message: string
}

interface DawnWeavesProps {
  userId: string
}

export function DawnWeaves({ userId }: DawnWeavesProps) {
  const [alerts, setAlerts] = useState<DawnWeaveAlert[]>([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<DawnWeaveAlert | null>(null)
  const [hasUrgentAlert, setHasUrgentAlert] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchDawnWeaves = async () => {
      try {
        const response = await fetch(`/api/patterns/dawn-drawer/${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.alerts && data.alerts.length > 0) {
            setAlerts(data.alerts)
            
            // Check for urgent alerts (1 day or less)
            const urgent = data.alerts.some((alert: DawnWeaveAlert) => 
              alert.is_urgent && !dismissedAlerts.has(alert.predicted_day)
            )
            setHasUrgentAlert(urgent)
          }
        }
      } catch (error) {
        console.error('Failed to fetch dawn weaves:', error)
      }
    }

    fetchDawnWeaves()
    
    // Refresh every 6 hours
    const interval = setInterval(fetchDawnWeaves, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId, dismissedAlerts])

  const handleAlertClick = (alert: DawnWeaveAlert) => {
    setSelectedAlert(alert)
    setShowDrawer(false)
  }

  const handleDismissAlert = (alertDay: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertDay))
    setHasUrgentAlert(false)
    setSelectedAlert(null)
  }

  const getRitualIcon = (time: string) => {
    switch (time) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌙'
      default: return '✨'
    }
  }

  // Floating petal notification (urgent alerts)
  const visibleUrgentAlerts = alerts.filter(
    alert => alert.is_urgent && !dismissedAlerts.has(alert.predicted_day)
  )

  return (
    <>
      {/* Petal Notification - Floating Alert */}
      <AnimatePresence>
        {hasUrgentAlert && visibleUrgentAlerts.length > 0 && !selectedAlert && (
          <motion.button
            onClick={() => handleAlertClick(visibleUrgentAlerts[0])}
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-8 z-40 group"
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {/* Petal shape background */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* Petal texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sunrise className="text-white w-10 h-10" />
                </motion.div>
              </div>

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-400/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Urgency badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{visibleUrgentAlerts.length}</span>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute left-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <GlassCard className="px-4 py-2 whitespace-nowrap">
                <p className="text-white text-sm font-quicksand">
                  {visibleUrgentAlerts[0].alert_message}
                </p>
              </GlassCard>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dawn Drawer Toggle Button */}
      {alerts.length > 0 && !hasUrgentAlert && (
        <motion.button
          onClick={() => setShowDrawer(true)}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-8 left-8 z-40 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-quicksand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sunrise size={20} />
          <span className="text-sm font-semibold">Dawn Weaves ({alerts.length})</span>
        </motion.button>
      )}

      {/* Dawn Drawer - Sliding Preview */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowDrawer(false)}
          >
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 h-full w-96 bg-gradient-to-br from-navy via-navy-light to-purple-900 shadow-2xl overflow-hidden"
            >
              <div className="p-6 h-full overflow-y-auto custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-quicksand font-bold text-2xl flex items-center gap-2">
                    <Sunrise className="text-amber-400" />
                    Dawn Weaves
                  </h2>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-white/70 font-quicksand text-sm mb-6">
                  Protective stories for your upcoming week
                </p>

                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <motion.button
                      key={alert.predicted_day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAlertClick(alert)}
                      className="w-full text-left"
                    >
                      <GlassCard hover className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            alert.is_urgent 
                              ? 'bg-gradient-to-br from-red-400 to-orange-500' 
                              : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                          }`}>
                            {alert.is_urgent ? (
                              <AlertCircle className="text-white" size={24} />
                            ) : (
                              <Calendar className="text-white" size={24} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-white font-quicksand font-semibold mb-1">
                              {alert.predicted_day}
                            </h3>
                            <p className="text-white/70 text-sm font-quicksand mb-2">
                              {alert.alert_message}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                  style={{ width: `${alert.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-white/50 text-xs font-quicksand">
                                {Math.round(alert.confidence * 100)}%
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="text-white/40" size={20} />
                        </div>
                      </GlassCard>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shield Story Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <GlassCard className="relative overflow-hidden">
                <div className="overflow-y-auto max-h-[85vh] custom-scrollbar"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(168, 213, 186, 0.3) transparent'
                  }}
                >
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sunrise className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-white font-quicksand font-bold text-2xl">
                        {selectedAlert.shield_story.title}
                      </h2>
                      <p className="text-white/60 text-sm font-quicksand">
                        {selectedAlert.alert_message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story */}
                <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                  <p className="text-white font-quicksand leading-relaxed whitespace-pre-line">
                    {selectedAlert.shield_story.story}
                  </p>
                </div>

                {/* Micro-Rituals */}
                <div className="mb-6">
                  <h3 className="text-white font-quicksand font-semibold mb-3 flex items-center gap-2">
                    <Heart className="text-pink-400" size={18} />
                    Micro-Rituals for {selectedAlert.predicted_day}
                  </h3>
                  <div className="space-y-3">
                    {selectedAlert.shield_story.micro_rituals.map((ritual, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-white/10 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getRitualIcon(ritual.time)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white/60 text-xs font-quicksand uppercase tracking-wide">
                                {ritual.time}
                              </span>
                            </div>
                            <p className="text-white font-quicksand font-semibold mb-1">
                              {ritual.action}
                            </p>
                            <p className="text-white/70 text-sm font-quicksand italic">
                              {ritual.why}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Affirmation */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30 mb-4">
                  <p className="text-white font-quicksand text-center italic">
                    "{selectedAlert.shield_story.affirmation}"
                  </p>
                </div>

                {/* Metaphor */}
                <div className="p-3 bg-white/5 rounded-lg mb-6">
                  <p className="text-white/80 font-quicksand text-sm text-center italic">
                    {selectedAlert.shield_story.metaphor}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDismissAlert(selectedAlert.predicted_day)}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-quicksand transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      // Save to profile/favorites (future feature)
                      alert('Shield story saved to your Weave Vault!')
                      setSelectedAlert(null)
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-quicksand font-semibold hover:shadow-lg transition-all"
                  >
                    Save to Vault
                  </button>
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

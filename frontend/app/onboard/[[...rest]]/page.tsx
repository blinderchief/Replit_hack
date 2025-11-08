'use client'

import { motion } from 'framer-motion'
import { SignIn, SignUp, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatedLogo } from '@/components/ui/atoms/AnimatedLogo'
import { FloatingOrb } from '@/components/ui/atoms/FloatingOrb'
import { GlassCard } from '@/components/ui/molecules/GlassCard'

export default function Onboard() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    if (isSignedIn) {
      // Check if user has completed quiz
      const checkQuizStatus = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/preferences/${user?.id}`)
          const data = await response.json()
          
          if (data.preferences && Object.keys(data.preferences).length > 0) {
            router.push('/garden')
          } else {
            router.push('/onboard/quiz')
          }
        } catch (error) {
          // If error, redirect to quiz to be safe
          router.push('/onboard/quiz')
        }
      }
      
      checkQuizStatus()
    }
  }, [isSignedIn, router, user])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-navy via-navy-light to-moss flex items-center justify-center p-4">
      {/* Floating orbs background */}
      <FloatingOrb size={250} color="#A8D5BA" delay={0} className="top-10 left-10" />
      <FloatingOrb size={180} color="#F4A261" delay={1.5} className="bottom-20 right-20" />
      <FloatingOrb size={200} color="#FFB6D9" delay={3} className="top-1/2 right-10" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <AnimatedLogo size="md" className="justify-center mb-4" />
          <motion.p
            className="text-white/90 font-quicksand text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Begin your journey to emotional wellness
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GlassCard hover={false}>
            <div className="flex justify-center mb-6">
              <div className="flex bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setShowSignUp(false)}
                  className={`px-6 py-2 rounded-full font-quicksand transition-all ${
                    !showSignUp
                      ? 'bg-moss text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowSignUp(true)}
                  className={`px-6 py-2 rounded-full font-quicksand transition-all ${
                    showSignUp
                      ? 'bg-sunset text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              {showSignUp ? (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none',
                    }
                  }}
                  redirectUrl="/garden"
                />
              ) : (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none',
                    }
                  }}
                  redirectUrl="/garden"
                />
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-white/60 text-sm font-quicksand"
        >
          <p>Protected by GDPR-compliant encryption</p>
          <p className="mt-2">Your emotional journey, safely nurtured</p>
        </motion.div>
      </div>
    </div>
  )
}

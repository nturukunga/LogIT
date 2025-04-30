'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const [authType, setAuthType] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DevIT</h1>
          <p className="text-white/80">Your developer documentation tool</p>
        </div>
        
        <div className="mb-6 flex rounded-md overflow-hidden">
          <button
            className={`flex-1 py-2 px-4 text-center ${
              authType === 'login'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
            onClick={() => setAuthType('login')}
          >
            Log In
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${
              authType === 'signup'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
            onClick={() => setAuthType('signup')}
          >
            Sign Up
          </button>
        </div>
        
        <motion.div
          key={authType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {authType === 'login' ? <LoginForm /> : <SignupForm />}
        </motion.div>
      </div>
    </div>
  )
} 
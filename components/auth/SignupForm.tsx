'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required')
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: ''
    }
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName
          }
        }
      })
      
      if (signUpError) {
        throw signUpError
      }
      
      // Create profile record
      const { data: authData } = await supabase.auth.getSession()
      
      if (authData?.session?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.session.user.id,
            email: data.email,
            full_name: data.fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
        if (profileError) {
          console.error('Error creating profile', profileError)
        }
      }
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during Google sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className="glass w-full max-w-md p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full p-2 rounded border bg-white/10 border-gray-300"
            disabled={isLoading}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 rounded border bg-white/10 border-gray-300"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 rounded border bg-white/10 border-gray-300"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          {isLoading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4">
        <button
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="w-full bg-white text-gray-800 py-2 px-4 rounded border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </button>
      </div>
    </div>
  )
} 
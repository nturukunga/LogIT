import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=Authentication failed`)
    }
    
    // Get user data to create profile if needed
    const { data: userData } = await supabase.auth.getUser()
    
    if (userData?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()
      
      // Create profile if it doesn't exist
      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: userData.user.email || '',
            full_name: userData.user.user_metadata.full_name || '',
            avatar_url: userData.user.user_metadata.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
        if (profileError) {
          console.error('Error creating profile', profileError)
        }
      }
    }
  }
  
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
} 
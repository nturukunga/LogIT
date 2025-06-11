import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardView from '@/components/dashboard/DashboardView'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  // Get user's notes
  const { data: notes, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      note_collaborators (
        user_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
  
  // Get notes where user is a collaborator
  const { data: collaborativeNotes, error: collaborativeError } = await supabase
    .from('note_collaborators')
    .select(`
      note_id,
      notes (
        id,
        title,
        created_at,
        updated_at,
        user_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', session.user.id)
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return <DashboardView 
    userNotes={notes || []} 
    collaborativeNotes={collaborativeNotes || []} 
    userProfile={profile || null} 
    userId={session.user.id}
  />
} 
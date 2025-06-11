import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteEditor from '@/components/notes/NoteEditor'

interface NotePageProps {
  params: {
    id: string
  }
}

export default async function NotePage({ params }: NotePageProps) {
  const noteId = params.id
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  // Get note details
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single()
  
  if (error || !note) {
    // Check if user is a collaborator
    const { data: collaboratorAccess, error: collaboratorError } = await supabase
      .from('note_collaborators')
      .select('*')
      .eq('note_id', noteId)
      .eq('user_id', session.user.id)
      .single()
    
    if (collaboratorError || !collaboratorAccess) {
      // User does not have access to this note
      redirect('/dashboard')
    }
    
    // Get note details as collaborator
    const { data: sharedNote, error: sharedNoteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()
    
    if (sharedNoteError || !sharedNote) {
      redirect('/dashboard')
    }
    
    note = sharedNote
  }
  
  // Get collaborators
  const { data: collaborators, error: collaboratorsError } = await supabase
    .from('note_collaborators')
    .select(`
      user_id,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('note_id', noteId)
  
  // Get note owner
  const { data: owner } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, email')
    .eq('id', note.user_id)
    .single()
  
  // Combine owner and collaborators
  const allCollaborators = [
    {
      id: owner.id,
      full_name: owner.full_name,
      avatar_url: owner.avatar_url,
      email: owner.email
    },
    ...(collaborators || []).map(collab => ({
      id: collab.profiles.id,
      full_name: collab.profiles.full_name,
      avatar_url: collab.profiles.avatar_url,
      email: collab.profiles.email
    }))
  ]
  
  const isOwner = note.user_id === session.user.id
  
  return (
    <NoteEditor
      noteId={noteId}
      initialContent={note.content}
      title={note.title}
      userId={session.user.id}
      isOwner={isOwner}
      collaborators={allCollaborators}
    />
  )
} 
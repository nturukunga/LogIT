'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type CollaboratorProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

type NoteCollaborator = {
  user_id: string
  profiles: CollaboratorProfile
}

type Note = {
  id: string
  title: string
  created_at: string
  updated_at: string
  note_collaborators?: NoteCollaborator[]
}

type CollaborativeNote = {
  note_id: string
  notes: {
    id: string
    title: string
    created_at: string
    updated_at: string
    user_id: string
    profiles: CollaboratorProfile
  }
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

interface DashboardViewProps {
  userNotes: Note[]
  collaborativeNotes: CollaborativeNote[]
  userProfile: Profile | null
  userId: string
}

export default function DashboardView({ 
  userNotes, 
  collaborativeNotes, 
  userProfile,
  userId
}: DashboardViewProps) {
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const createNewNote = async () => {
    if (!newNoteTitle.trim()) return
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: newNoteTitle,
        content: `# ${newNoteTitle}\n\n${format(new Date(), 'MMMM dd, yyyy')}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('Error creating note', error)
      return
    }
    
    if (data && data[0]) {
      router.push(`/notes/${data[0].id}`)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-700">
      <header className="bg-black/30 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">DevIT</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userProfile && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mr-2">
                  {userProfile.avatar_url ? (
                    <Image 
                      src={userProfile.avatar_url} 
                      alt={userProfile.full_name || ''} 
                      width={32} 
                      height={32} 
                    />
                  ) : (
                    <span className="text-sm">{userProfile.full_name?.charAt(0) || userProfile.email.charAt(0)}</span>
                  )}
                </div>
                <span className="text-white/80 text-sm">{userProfile.full_name || userProfile.email}</span>
              </div>
            )}
            <button 
              onClick={handleSignOut}
              className="text-white/80 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Your Projects</h2>
          <button
            onClick={() => setIsCreatingNote(true)}
            className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded flex items-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            New Project
          </button>
        </div>

        {isCreatingNote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-8 p-4 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-4 text-white">Create New Project</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter project title..."
              className="w-full p-2 mb-4 rounded bg-white/10 border border-white/20 text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreatingNote(false)}
                className="py-2 px-4 rounded text-white/80 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createNewNote}
                disabled={!newNoteTitle.trim()}
                className="bg-blue-500 py-2 px-4 rounded text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </motion.div>
        )}

        {userNotes.length === 0 && collaborativeNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-white/60">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-white/60 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setIsCreatingNote(true)}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userNotes.map((note) => (
              <Link href={`/notes/${note.id}`} key={note.id}>
                <div className="glass h-48 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2 text-white truncate">{note.title}</h3>
                  <p className="text-white/60 text-sm mb-4">
                    {format(new Date(note.updated_at), 'MMM d, yyyy')}
                  </p>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center z-10 border-2 border-indigo-900">
                        <span className="text-sm">{userProfile?.full_name?.charAt(0) || 'U'}</span>
                      </div>
                      {note.note_collaborators && note.note_collaborators.map((collab) => (
                        <div 
                          key={collab.user_id} 
                          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-0 border-2 border-indigo-900"
                        >
                          <span className="text-sm">{collab.profiles.full_name?.charAt(0) || 'C'}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-white/60 text-sm">PROJECT</span>
                  </div>
                </div>
              </Link>
            ))}
            
            {collaborativeNotes.map((collab) => (
              <Link href={`/notes/${collab.note_id}`} key={collab.note_id}>
                <div className="glass-dark h-48 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2 text-white truncate">{collab.notes.title}</h3>
                  <p className="text-white/60 text-sm mb-4">
                    {format(new Date(collab.notes.updated_at), 'MMM d, yyyy')}
                  </p>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center z-10 border-2 border-indigo-900">
                        <span className="text-sm">{collab.notes.profiles.full_name?.charAt(0) || 'O'}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center z-0 border-2 border-indigo-900">
                        <span className="text-sm">{userProfile?.full_name?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <span className="text-white/60 text-sm">SHARED</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 
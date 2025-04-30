'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import EditorToolbar from './EditorToolbar'

interface NoteEditorProps {
  noteId: string
  initialContent: string
  title: string
  userId: string
  isOwner: boolean
  collaborators: Array<{
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string
  }>
}

export default function NoteEditor({
  noteId,
  initialContent,
  title,
  userId,
  isOwner,
  collaborators
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [editableTitle, setEditableTitle] = useState(title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [showCollabMenu, setShowCollabMenu] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingTitle])

  useEffect(() => {
    // Make the editor content editable
    if (editorRef.current) {
      editorRef.current.contentEditable = 'true'
    }

    return () => {
      // Clear any pending save operations when unmounting
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const saveChanges = async () => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          content,
          title: editableTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
      
      if (error) {
        console.error('Error saving note', error)
      }
    } catch (err) {
      console.error('Error saving changes', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML
    setContent(newContent)
    
    // Debounce saving to prevent too many requests
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges()
    }, 1000)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    saveChanges()
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false)
      saveChanges()
    }
  }

  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail.trim()) return
    
    try {
      // First get the user ID for the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', collaboratorEmail)
        .single()
      
      if (userError || !userData) {
        console.error('User not found', userError)
        return
      }
      
      // Then add the collaborator
      const { error } = await supabase
        .from('note_collaborators')
        .insert({
          note_id: noteId,
          user_id: userData.id,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error adding collaborator', error)
        return
      }
      
      setCollaboratorEmail('')
      setShowCollabMenu(false)
      router.refresh()
    } catch (err) {
      console.error('Error adding collaborator', err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editableTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-white"
            />
          ) : (
            <h1
              onClick={() => isOwner && setIsEditingTitle(true)}
              className={`text-xl font-semibold dark:text-white ${isOwner ? 'cursor-pointer hover:text-blue-500' : ''}`}
            >
              {editableTitle}
            </h1>
          )}
          
          {isSaving && (
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Saving...</span>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="flex mr-3">
            {[...collaborators].map((collaborator) => (
              <div 
                key={collaborator.id}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center -ml-2 first:ml-0 border-2 border-white dark:border-gray-800"
                title={collaborator.full_name || collaborator.email}
              >
                {collaborator.avatar_url ? (
                  <img
                    src={collaborator.avatar_url}
                    alt={collaborator.full_name || ''}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-white text-sm">
                    {collaborator.full_name?.charAt(0) || collaborator.email.charAt(0)}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {isOwner && (
            <div className="relative">
              <button 
                onClick={() => setShowCollabMenu(!showCollabMenu)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              
              {showCollabMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded shadow-lg z-10 p-3">
                  <h3 className="text-sm font-medium mb-2 dark:text-white">Add Collaborator</h3>
                  <div className="flex">
                    <input
                      type="email"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      placeholder="Enter email..."
                      className="flex-1 p-2 text-sm border rounded-l dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={handleAddCollaborator}
                      className="bg-blue-500 text-white px-3 rounded-r"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      <EditorToolbar formatText={formatText} />
      
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800 m-4 rounded shadow">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose dark:prose-invert prose-lg max-w-none"
            ref={editorRef}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
} 
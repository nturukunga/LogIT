export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          avatar_url: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          avatar_url?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          avatar_url?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      note_collaborators: {
        Row: {
          id: string
          note_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
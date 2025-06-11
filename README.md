# DevIT - Developer Documentation Tool

A collaborative documentation tool for developers with rich text editing, real-time collaboration, and Google authentication.

## Features

- **Authentication**: Email/password and Google OAuth via Supabase
- **Rich Text Editor**: MS Word-style editor with formatting options
- **Collaboration**: Work on documents with other users in real-time
- **Dashboard**: View and manage all your documents
- **Modern UI**: Glassmorphism and Fluent Design with Tailwind CSS

## Tech Stack

- **Frontend**: React with Next.js 14 App Router
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the following tables in your Supabase database:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create note_collaborators table
CREATE TABLE note_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID REFERENCES notes NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(note_id, user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Notes are viewable by owner and collaborators" 
  ON notes FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM note_collaborators 
      WHERE note_id = notes.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Notes are editable by owner and collaborators" 
  ON notes FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM note_collaborators 
      WHERE note_id = notes.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Notes are insertable by authenticated users" 
  ON notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collaborators are viewable by note owner and collaborators" 
  ON note_collaborators FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_collaborators.note_id AND (user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM note_collaborators nc 
          WHERE nc.note_id = note_collaborators.note_id AND nc.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Collaborators are insertable by note owner" 
  ON note_collaborators FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_collaborators.note_id AND user_id = auth.uid()
    )
  );
```

3. Enable Google OAuth in Supabase Authentication settings
4. Note your Supabase URL and public anon key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The app can be easily deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdevit)

Make sure to add the environment variables in the Vercel project settings.

## License

MIT

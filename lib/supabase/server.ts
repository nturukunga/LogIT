import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../types/database.types'

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const createClient = () => {
  const cookieStorePromise = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookieStorePromise
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          const cookieStore = await cookieStorePromise
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
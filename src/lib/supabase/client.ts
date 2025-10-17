import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use local URL first for self-hosting, fallback to production URL
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    '';
  
  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    '';
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}


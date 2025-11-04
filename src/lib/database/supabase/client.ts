import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for client-side operations
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables are not set
 */
export function createClient() {
  // In browser/client-side, Next.js exposes NEXT_PUBLIC_ vars via window
  // But process.env should still work in client components
  // In production builds, these need to be available at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Enhanced validation with detailed error messages
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const errorMessage = `Missing Supabase environment variables: ${missingVars.join(', ')}. 
    
For local development: Please ensure these are set in your .env.local file and restart your dev server.

For production: These variables must be set as environment variables in your deployment platform (Vercel, etc.) and available at build time.

Current values:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Missing'}`;
    
    console.error('❌ Supabase Client Error:', errorMessage);
    throw new Error(errorMessage);
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.protocol.startsWith('http')) {
      throw new Error('URL must use http or https protocol');
    }
  } catch (urlError) {
    const errorMessage = `Invalid NEXT_PUBLIC_SUPABASE_URL format. Expected a valid URL, got: ${supabaseUrl}`;
    console.error('❌ Supabase URL Error:', errorMessage, urlError);
    throw new Error(errorMessage);
  }

  // Validate API key format (basic check)
  // Supabase keys can be:
  // - JWT tokens (eyJ...)
  // - Publishable keys (sb_publishable_...)
  // - API keys (sb_...)
  // - Local development keys (shorter, for testing)
  const isJWT = supabaseAnonKey.startsWith('eyJ');
  const isPublishableKey = supabaseAnonKey.startsWith('sb_publishable_');
  const isAPIKey = supabaseAnonKey.startsWith('sb_');
  const isLocalDev = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
  
  // Only warn if key seems obviously invalid (too short and not a known format)
  // For local dev, we allow shorter keys
  const minLength = isLocalDev ? 20 : 50;
  const isValidFormat = isJWT || isPublishableKey || isAPIKey;
  
  if (supabaseAnonKey.length < minLength && !isValidFormat) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY format may be invalid. Expected JWT token (eyJ...), publishable key (sb_publishable_...), or API key (sb_...).');
  }

  // Create client with validated credentials
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Verify client was created successfully
    if (!client) {
      throw new Error('Failed to create Supabase client');
    }
    
    return client;
  } catch (clientError) {
    console.error('❌ Failed to create Supabase client:', clientError);
    throw new Error(`Failed to initialize Supabase client: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
  }
}


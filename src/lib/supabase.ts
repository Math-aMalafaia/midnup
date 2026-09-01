import { createClient } from '@supabase/supabase-js'

const env = import.meta.env as Record<string, string | undefined>
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

if (!supabaseConfigured) {
  console.error('[MindUp] Supabase não configurado. Use VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local.')
}

// Never use a service/secret key in the browser. The publishable/anon key is designed for RLS-protected frontend access.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'missing-public-key',
)

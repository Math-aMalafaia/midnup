import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

// Accept both current Supabase publishable keys and legacy anon keys.
// Do not put the service_role key in this frontend.
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    '[MindUp] Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local.'
  )
}

// A harmless placeholder keeps the app renderable so a missing local env
// produces a visible configuration error instead of a completely blank page.
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co'
const clientKey = supabasePublishableKey || 'missing-public-key'

export const supabase = createClient(clientUrl, clientKey)
export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

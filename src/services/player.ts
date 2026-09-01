import { supabase } from '../lib/supabase'

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getPlayerProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) throw error
  return data
}

export async function getPlayerAttributes() {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase.from('attributes').select('*').eq('user_id', user.id).order('id')
  if (error) throw error
  return data ?? []
}

export async function updateUsername(username: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Usuário não autenticado')
  const { data, error } = await supabase.from('profiles').update({ username, updated_at: new Date().toISOString() }).eq('id', user.id).select().single()
  if (error) throw error
  return data
}

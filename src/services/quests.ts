import { supabase } from '../lib/supabase'

export type DbQuest = {
  id: number
  slug: string
  title: string
  description: string | null
  category: string
  difficulty: string
  xp_reward: number
  verification_type: 'checklist' | 'quiz' | 'photo' | 'none'
  hero_bg: string | null
  icon: string | null
  quest_checklist_items?: { id: number; description: string; position: number }[]
}

export async function getQuests(): Promise<DbQuest[]> {
  const { data, error } = await supabase.from('quests').select('*, quest_checklist_items(*)').eq('active', true).order('id')
  if (error) throw error
  return data ?? []
}

export async function getUserQuestStatuses() {
  const { data, error } = await supabase.from('user_quests').select('*')
  if (error) throw error
  return data ?? []
}

export async function completeQuest(questId: number) {
  const { data, error } = await supabase.rpc('complete_quest', { p_quest_id: questId })
  if (error) throw error
  return data
}

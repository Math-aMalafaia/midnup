import { supabase } from '../lib/supabase'

export async function getQuests() {
  const { data, error } = await supabase
    .from('quests')
    .select('*, quest_checklist_items(*)')
    .eq('active', true)
    .order('id')
  if (error) throw error
  return data ?? []
}

export async function completeQuest(questId: number) {
  const { data, error } = await supabase.rpc('complete_quest', { p_quest_id: questId })
  if (error) throw error
  return data as { xpEarned: number; totalXp: number; level: number; leveledUp: boolean }
}

export async function getUserQuestStatuses() {
  const { data, error } = await supabase.from('user_quests').select('*')
  if (error) throw error
  return data ?? []
}

import { createClient } from './supabase/client'

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

export async function upsertProfile(updates: {
  display_name?: string
  avatar_url?: string
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, ...updates })

  return { error: error?.message ?? null }
}

export async function deleteAccount(): Promise<{ error: string | null }> {
  const supabase = createClient()
  // RLS cascade will delete user_profiles + all records
  const { error } = await supabase.rpc('delete_user')
  return { error: error?.message ?? null }
}

import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'atendente'
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return null

  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role')
    .eq('id', userId)
    .eq('active', true)
    .single()

  return data || null
}

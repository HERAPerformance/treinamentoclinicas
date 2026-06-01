import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, active, created_at')
    .eq('role', 'atendente')
    .order('name')

  const { data: progress } = await supabaseAdmin
    .from('module_progress')
    .select('*')

  const { data: attempts } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ users: users || [], progress: progress || [], attempts: attempts || [] })
}

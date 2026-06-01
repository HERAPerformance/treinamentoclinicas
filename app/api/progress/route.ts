import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { moduleIndex, timeSpent } = await req.json()

  const { error } = await supabaseAdmin
    .from('module_progress')
    .upsert({
      user_id: session.id,
      module_index: moduleIndex,
      completed: true,
      time_spent: timeSpent,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,module_index' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('module_progress')
    .select('*')
    .eq('user_id', session.id)

  return NextResponse.json({ progress: data || [] })
}

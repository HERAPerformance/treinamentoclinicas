import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { score, correctAnswers, totalQuestions, timeSpent, answers, passed } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('quiz_attempts')
    .insert({
      user_id: session.id,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      time_spent: timeSpent,
      answers,
      passed,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attempt: data })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ attempts: data || [] })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Senhas hardcoded para simplificar — em produção use bcrypt + coluna password
const PASSWORDS: Record<string, string> = {
  'admin@clinica.com': process.env.ADMIN_PASSWORD || 'admin@hera2024',
  'atendente@clinica.com': 'hera2024',
  'atendente2@clinica.com': 'hera2024',
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Preencha e-mail e senha.' }, { status: 400 })
  }

  const expectedPass = PASSWORDS[email.toLowerCase()]
  if (!expectedPass || expectedPass !== password) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role')
    .eq('email', email.toLowerCase())
    .eq('active', true)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 401 })
  }

  const response = NextResponse.json({ user })
  response.cookies.set('user_id', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })

  return response
}

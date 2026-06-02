import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Preencha e-mail e senha.' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, password_hash')
    .eq('email', email.toLowerCase())
    .eq('active', true)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  const HARDCODED: Record<string, string> = {
    'admin@clinica.com': process.env.ADMIN_PASSWORD || 'admin@hera2024',
    'atendente@clinica.com': 'hera2024',
    'atendente2@clinica.com': 'hera2024',
  }

  let valid = false
  if (user.password_hash) {
    const hash = createHash('sha256').update(password).digest('hex')
    valid = hash === user.password_hash
  } else if (HARDCODED[email.toLowerCase()]) {
    valid = HARDCODED[email.toLowerCase()] === password
  }

  if (!valid) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  response.cookies.set('user_id', user.id, {
    httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
  })
  return response
}

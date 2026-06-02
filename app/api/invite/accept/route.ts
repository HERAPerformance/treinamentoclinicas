import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Token e senha são obrigatórios (mínimo 6 caracteres)' }, { status: 400 })
  }

  const { data: invite } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single()

  if (!invite) {
    return NextResponse.json({ error: 'Link inválido ou já utilizado.' }, { status: 400 })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este link expirou. Solicite um novo convite.' }, { status: 400 })
  }

  const passwordHash = createHash('sha256').update(password).digest('hex')

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: invite.email,
      name: invite.name,
      role: 'atendente',
      password_hash: passwordHash
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('invites').update({ used: true }).eq('id', invite.id)

  const response = NextResponse.json({ user })
  response.cookies.set('user_id', user.id, {
    httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
  })
  return response
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token não informado' }, { status: 400 })

  const { data: invite } = await supabaseAdmin
    .from('invites')
    .select('name, email, expires_at, used')
    .eq('token', token)
    .single()

  if (!invite || invite.used) {
    return NextResponse.json({ valid: false, error: 'Link inválido ou já utilizado.' })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Este link expirou.' })
  }

  return NextResponse.json({ valid: true, name: invite.name, email: invite.email })
}

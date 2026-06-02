import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { email, name } = await req.json()
  if (!email || !name) {
    return NextResponse.json({ error: 'E-mail e nome são obrigatórios' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 })
  }

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .insert({ email: email.toLowerCase(), name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bot-treinamento.dxk1y9.easypanel.host'
  const inviteUrl = `${baseUrl}/convite?token=${invite.token}`

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'Hera Performance <treinamento@heraperformance.com.br>',
        to: email,
        subject: 'Seu acesso ao Portal de Treinamento',
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f9f7;font-family:sans-serif"><table width="100%"><tr><td align="center" style="padding:40px 20px"><table width="480" style="background:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:#B8960A;padding:32px;text-align:center"><h1 style="margin:0;color:#fff;font-size:22px">Hera Performance</h1><p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Portal de Treinamento</p></td></tr><tr><td style="padding:40px 32px"><p style="color:#1a1a2e;font-size:16px">Olá, <strong>${name}</strong>!</p><p style="color:#5a5a52;font-size:14px;line-height:1.7;margin:16px 0 24px">Você foi convidada para o <strong>Portal de Treinamento</strong> da Hera Performance. Clique abaixo para criar sua senha.</p><table width="100%"><tr><td align="center" style="padding:8px 0 32px"><a href="${inviteUrl}" style="display:inline-block;background:#B8960A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">Criar minha senha →</a></td></tr></table><p style="color:#9a9890;font-size:12px">Link: ${inviteUrl}</p><hr style="border:none;border-top:1px solid #e2e1d8;margin:24px 0"><p style="color:#9a9890;font-size:12px">Válido por <strong>24 horas</strong>.</p></td></tr></table></td></tr></table></body></html>`
      })
    })
  }

  return NextResponse.json({ ok: true, inviteUrl })
}

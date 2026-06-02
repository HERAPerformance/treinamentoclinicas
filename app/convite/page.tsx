'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ConviteContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    fetch(`/api/invite/accept?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setName(d.name); setEmail(d.email); setStatus('valid') }
        else { setError(d.error); setStatus('invalid') }
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/treinamento')
  }

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdfcf7 0%, #f5f3eb 100%)' }}>
      <p style={{ color: '#9a9890', fontSize: '14px' }}>Verificando convite...</p>
    </div>
  )

  if (status === 'invalid') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdfcf7 0%, #f5f3eb 100%)', padding: '1rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#1a1a2e' }}>Link inválido</h1>
        <p style={{ fontSize: '14px', color: '#9a9890', marginBottom: '24px' }}>{error || 'Este link de convite é inválido ou já foi utilizado.'}</p>
        <a href="/login" style={{ color: '#B8960A', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>← Ir para o login</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdfcf7 0%, #f5f3eb 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#B8960A', borderRadius: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 8px 24px rgba(184,150,10,0.3)', fontSize: '28px' }}>🎓</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' }}>Bem-vinda, {name}!</h1>
          <p style={{ fontSize: '14px', color: '#9a9890' }}>Crie sua senha para acessar o treinamento</p>
        </div>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ background: '#f9f9f7', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#5a5a52' }}>
            <strong>E-mail:</strong> {email}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="password">Criar senha</label>
              <input id="password" className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="confirm">Confirmar senha</label>
              <input id="confirm" className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Digite a senha novamente" required />
            </div>
            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Criando acesso...' : 'Criar senha e entrar →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9a9890', marginTop: '24px' }}>
          Desenvolvido por <a href="https://heraperformance.com.br" target="_blank" style={{ color: '#B8960A', textDecoration: 'none', fontWeight: '500' }}>Hera Performance</a>
        </p>
      </div>
    </div>
  )
}

export default function ConvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9a9890' }}>Carregando...</p></div>}>
      <ConviteContent />
    </Suspense>
  )
}

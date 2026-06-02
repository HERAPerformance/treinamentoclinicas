'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      if (data.user.role === 'admin') router.push('/admin')
      else router.push('/treinamento')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdfcf7 0%, #f5f3eb 100%)',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px', height: '64px', background: 'var(--gold)',
            borderRadius: '18px', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '1.25rem',
            boxShadow: '0 8px 24px rgba(184,150,10,0.3)'
          }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--dark)', marginBottom: '6px' }}>
            Portal de Treinamento
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-400)' }}>
            Cirurgia Plástica — Atendimento Digital
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '24px', paddingBottom: '20px',
            borderBottom: '1px solid var(--gray-200)'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Acesso Restrito
            </span>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="email">E-mail</label>
              <input id="email" className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@clinica.com.br" required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password">Senha</label>
              <input id="password" className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            {error && (
              <div style={{
                padding: '10px 14px', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)',
                color: 'var(--red)', fontSize: '13px', marginBottom: '16px', textAlign: 'center'
              }}>{error}</div>
            )}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no treinamento →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-400)', marginTop: '24px' }}>
          Desenvolvido por{' '}
          <a href="https://heraperformance.com.br" target="_blank" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>
            Hera Performance
          </a>
        </p>
      </div>
    </div>
  )
}

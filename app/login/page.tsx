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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#B8960A] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a2e]">Portal de Treinamento</h1>
          <p className="text-sm text-gray-500 mt-1">Cirurgia Plástica — Atendimento Digital</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Acesso Restrito</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@clinica.com.br"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8960A] focus:ring-2 focus:ring-[#B8960A]/15 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B8960A] focus:ring-2 focus:ring-[#B8960A]/15 transition"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#B8960A] text-white rounded-lg font-medium text-sm hover:bg-[#9a7c08] transition disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar no treinamento'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Desenvolvido por{' '}
          <a href="https://heraperformance.com.br" target="_blank" className="text-[#B8960A]">
            Hera Performance
          </a>
        </p>
      </div>
    </div>
  )
}

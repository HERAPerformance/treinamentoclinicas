'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES } from '@/lib/data'

interface User { id: string; email: string; name: string; active: boolean; created_at: string }
interface Progress { user_id: string; module_index: number; completed: boolean; time_spent: number; completed_at: string }
interface Attempt { id: string; user_id: string; score: number; correct_answers: number; total_questions: number; time_spent: number; passed: boolean; created_at: string }

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ok?: boolean; url?: string; error?: string} | null>(null)

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(d => {
      setUsers(d.users || []); setProgress(d.progress || []); setAttempts(d.attempts || [])
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true); setInviteResult(null)
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inviteName, email: inviteEmail })
    })
    const data = await res.json()
    if (!res.ok) { setInviteResult({ error: data.error }) }
    else { setInviteResult({ ok: true, url: data.inviteUrl }); setInviteName(''); setInviteEmail('') }
    setInviteLoading(false)
  }

  function userProgress(userId: string) { return progress.filter(p => p.user_id === userId && p.completed) }
  function userBestAttempt(userId: string) {
    const ua = attempts.filter(a => a.user_id === userId)
    if (!ua.length) return null
    return ua.reduce((best, a) => a.score > best.score ? a : best)
  }
  function userAttempts(userId: string) { return attempts.filter(a => a.user_id === userId) }

  const totalDone = users.filter(u => userProgress(u.id).length === MODULES.length).length
  const totalPassed = users.filter(u => userBestAttempt(u.id)?.passed).length
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <p style={{ color: 'var(--gray-400)' }}>Carregando...</p>
    </div>
  )

  const selUser = selected ? users.find(u => u.id === selected) : null
  const selProgress = selected ? userProgress(selected) : []
  const selAttempts = selected ? userAttempts(selected) : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--gold)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(184,150,10,0.25)' }}>⚙️</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700' }}>Painel Administrativo</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Portal de Treinamento — Hera Performance</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => setShowInvite(!showInvite)} style={{ fontSize: '13px' }}>
              + Convidar atendente
            </button>
            <button className="btn" onClick={logout} style={{ fontSize: '13px' }}>Sair</button>
          </div>
        </div>

        {showInvite && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--gold)' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>🎓 Convidar nova atendente</p>
            <form onSubmit={sendInvite} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label>Nome completo</label>
                <input className="input" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Ana Clara" required />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label>E-mail</label>
                <input className="input" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="ana@clinica.com.br" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={inviteLoading} style={{ whiteSpace: 'nowrap' }}>
                {inviteLoading ? 'Enviando...' : 'Enviar convite'}
              </button>
            </form>
            {inviteResult?.error && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--red-light)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px' }}>
                {inviteResult.error}
              </div>
            )}
            {inviteResult?.ok && (
              <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--green-light)', borderRadius: '8px', fontSize: '13px' }}>
                <p style={{ color: 'var(--green)', fontWeight: '600', marginBottom: '6px' }}>✓ Convite gerado!</p>
                <p style={{ color: 'var(--gray-600)', marginBottom: '6px' }}>Copie e envie pelo WhatsApp:</p>
                <div style={{ background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--gray-200)', wordBreak: 'break-all' }}>
                  <a href={inviteResult.url} target="_blank" style={{ color: 'var(--gold)', fontSize: '12px', textDecoration: 'none' }}>{inviteResult.url}</a>
                </div>
                <p style={{ color: 'var(--gray-400)', fontSize: '12px', marginTop: '8px' }}>⚠️ Válido por 24 horas.</p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[['Atendentes', users.length], ['Concluíram', totalDone], ['Aprovadas', totalPassed], ['Média', `${avgScore}%`]].map(([label, val]) => (
            <div className="stat-card" key={label as string}><div className="stat-num">{val}</div><div className="stat-label">{label}</div></div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p className="section-title">Atendentes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {users.map(u => {
                const done = userProgress(u.id).length
                const best = userBestAttempt(u.id)
                const pct = Math.round((done / MODULES.length) * 100)
                return (
                  <div key={u.id} onClick={() => setSelected(selected === u.id ? null : u.id)}
                    className="card" style={{ cursor: 'pointer', borderColor: selected === u.id ? 'var(--gold)' : undefined, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>{u.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{u.email}</p>
                      </div>
                      {best ? (
                        <span className={`badge ${best.passed ? 'badge-green' : 'badge-red'}`}>
                          {best.passed ? `✓ ${best.score}%` : `✗ ${best.score}%`}
                        </span>
                      ) : <span className="badge badge-gray">Sem avaliação</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-track" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{done}/{MODULES.length}</span>
                    </div>
                  </div>
                )
              })}
              {users.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '32px', marginBottom: '12px' }}>👥</p>
                  <p style={{ fontSize: '14px', color: 'var(--gray-400)' }}>Nenhuma atendente ainda.</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Use o botão "Convidar atendente" acima.</p>
                </div>
              )}
            </div>
          </div>
          <div>
            {selUser ? (
              <>
                <p className="section-title">Detalhes — {selUser.name}</p>
                <div className="card" style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Módulos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MODULES.map((mod, i) => {
                      const p = selProgress.find(p => p.module_index === i)
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <span style={{ color: p ? 'var(--dark)' : 'var(--gray-400)' }}>{p ? '✅' : '⬜'} Módulo {i+1}: {mod.title}</span>
                          {p && <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>{fmt(p.time_spent)}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card">
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-400)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avaliações ({selAttempts.length})</p>
                  {selAttempts.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Nenhuma avaliação realizada.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selAttempts.map((a, i) => (
                        <div key={a.id} style={{ padding: '10px 12px', borderRadius: '8px', background: a.passed ? 'var(--green-light)' : 'var(--red-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: '600', color: a.passed ? 'var(--green)' : 'var(--red)', fontSize: '13px' }}>{a.passed ? '✓ Aprovada' : '✗ Reprovada'} — {a.score}%</span>
                            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{a.correct_answers}/{a.total_questions} corretas · {fmt(a.time_spent)}</p>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>#{selAttempts.length - i}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>👆</p>
                <p style={{ fontSize: '14px', color: 'var(--gray-400)' }}>Selecione uma atendente para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

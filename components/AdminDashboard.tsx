'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES } from '@/lib/data'

interface User { id: string; email: string; name: string; active: boolean; created_at: string }
interface Progress { user_id: string; module_index: number; completed: boolean; time_spent: number; completed_at: string }
interface Attempt { id: string; user_id: string; score: number; correct_answers: number; total_questions: number; time_spent: number; passed: boolean; created_at: string }

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setProgress(d.progress || [])
      setAttempts(d.attempts || [])
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function userProgress(userId: string) {
    return progress.filter(p => p.user_id === userId && p.completed)
  }

  function userBestAttempt(userId: string) {
    const ua = attempts.filter(a => a.user_id === userId)
    if (!ua.length) return null
    return ua.reduce((best, a) => a.score > best.score ? a : best)
  }

  function userAttempts(userId: string) {
    return attempts.filter(a => a.user_id === userId)
  }

  const totalDone = users.filter(u => userProgress(u.id).length === MODULES.length).length
  const totalPassed = users.filter(u => userBestAttempt(u.id)?.passed).length
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0

  if (loading) return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  )

  const selUser = selected ? users.find(u => u.id === selected) : null
  const selProgress = selected ? userProgress(selected) : []
  const selAttempts = selected ? userAttempts(selected) : []

  return (
    <div className="min-h-screen bg-[#f8f8f6] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Portal de Treinamento — Cirurgia Plástica</p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50">
            Sair
          </button>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            ['Atendentes', users.length],
            ['Concluíram tudo', totalDone],
            ['Aprovadas', totalPassed],
            ['Média geral', `${avgScore}%`]
          ].map(([label, val]) => (
            <div key={label as string} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-semibold text-[#B8960A]">{val}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Atendentes</p>
            <div className="space-y-2">
              {users.map(u => {
                const done = userProgress(u.id).length
                const best = userBestAttempt(u.id)
                const pct = Math.round((done / MODULES.length) * 100)
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelected(selected === u.id ? null : u.id)}
                    className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm
                      ${selected === u.id ? 'border-[#B8960A]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      <div className="text-right">
                        {best ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${best.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {best.passed ? `✓ ${best.score}%` : `✗ ${best.score}%`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Sem avaliação</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B8960A] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{done}/{MODULES.length} módulos</span>
                    </div>
                  </div>
                )
              })}
              {users.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma atendente cadastrada ainda.</p>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div>
            {selUser ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Detalhes — {selUser.name}
                </p>

                {/* Module progress */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Progresso por módulo</p>
                  <div className="space-y-2">
                    {MODULES.map((mod, i) => {
                      const p = selProgress.find(p => p.module_index === i)
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className={`flex-1 truncate mr-2 ${p ? 'text-gray-700' : 'text-gray-400'}`}>
                            {p ? '✓' : '○'} Módulo {i + 1}: {mod.title}
                          </span>
                          {p && <span className="text-xs text-gray-400 flex-shrink-0">{fmt(p.time_spent)}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quiz attempts */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Tentativas de avaliação ({selAttempts.length})</p>
                  {selAttempts.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma avaliação realizada.</p>
                  ) : (
                    <div className="space-y-2">
                      {selAttempts.map((a, i) => (
                        <div key={a.id} className={`p-3 rounded-lg text-sm flex items-center justify-between ${a.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div>
                            <span className={`font-medium ${a.passed ? 'text-green-700' : 'text-red-600'}`}>
                              {a.passed ? '✓ Aprovada' : '✗ Reprovada'} — {a.score}%
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {a.correct_answers}/{a.total_questions} corretas · {fmt(a.time_spent)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            #{selAttempts.length - i}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                <p className="text-4xl mb-3">👆</p>
                <p className="text-sm text-gray-500">Selecione uma atendente para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

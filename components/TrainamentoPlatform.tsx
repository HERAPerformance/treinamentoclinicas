'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES, QUESTIONS } from '@/lib/data'

type Screen = 'dashboard' | 'module' | 'quiz' | 'result'
interface ModuleProgress { module_index: number; completed: boolean; time_spent: number }
interface QuizResult { score: number; correct: number; total: number; timeSpent: number; answers: Record<number, number> }

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}

const ICONS = ['🧠','💬','🛡️','📅','📱','⚖️','📊']

export default function TrainamentoPlatform({ userName }: { userName: string }) {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [progress, setProgress] = useState<Record<number, ModuleProgress>>({})
  const [totalTime, setTotalTime] = useState(0)
  const [currentMod, setCurrentMod] = useState(0)
  const [modTime, setModTime] = useState(0)
  const [canFinish, setCanFinish] = useState(false)
  const [readPct, setReadPct] = useState(0)
  const modTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAns, setQuizAns] = useState<Record<number, number>>({})
  const [quizTimeLeft, setQuizTimeLeft] = useState(900)
  const [quizStartTime, setQuizStartTime] = useState(0)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/progress').then(r => r.json()).then(d => {
      if (d.progress) {
        const map: Record<number, ModuleProgress> = {}
        let t = 0
        d.progress.forEach((p: ModuleProgress) => { map[p.module_index] = p; t += p.time_spent || 0 })
        setProgress(map); setTotalTime(t)
      }
    })
  }, [])

  const doneMods = Object.values(progress).filter(p => p.completed).length
  const pct = Math.round((doneMods / MODULES.length) * 100)
  const allDone = doneMods === MODULES.length

  function openModule(idx: number) {
    if (idx > 0 && !progress[idx-1]?.completed) return
    setCurrentMod(idx); setModTime(0); setCanFinish(false); setReadPct(0)
    setScreen('module')
    clearInterval(modTimerRef.current!)
    let t = 0
    modTimerRef.current = setInterval(() => {
      t++; setModTime(t); setTotalTime(prev => prev + 1)
      const p = Math.min(100, Math.round((t / MODULES[idx].minTime) * 100))
      setReadPct(p)
      if (t >= MODULES[idx].minTime) setCanFinish(true)
    }, 1000)
  }

  async function finishModule() {
    clearInterval(modTimerRef.current!)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleIndex: currentMod, timeSpent: modTime }),
    })
    setProgress(prev => ({ ...prev, [currentMod]: { module_index: currentMod, completed: true, time_spent: modTime } }))
    setScreen('dashboard')
  }

  function startQuiz() {
    setQuizIdx(0); setQuizAns({}); setQuizTimeLeft(900)
    setQuizStartTime(Date.now()); setScreen('quiz')
    clearInterval(quizTimerRef.current!)
    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft(prev => { if (prev <= 1) { clearInterval(quizTimerRef.current!); return 0 } return prev - 1 })
    }, 1000)
  }

  const finishQuiz = useCallback(async (finalAns: Record<number, number>) => {
    clearInterval(quizTimerRef.current!)
    let correct = 0
    QUESTIONS.forEach((q, i) => { if (finalAns[i] === q.ans) correct++ })
    const score = Math.round((correct / QUESTIONS.length) * 100)
    const elapsed = Math.round((Date.now() - quizStartTime) / 1000)
    const passed = score >= 70
    const result: QuizResult = { score, correct, total: QUESTIONS.length, timeSpent: elapsed, answers: finalAns }
    setQuizResult(result)
    await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, correctAnswers: correct, totalQuestions: QUESTIONS.length, timeSpent: elapsed, answers: finalAns, passed }),
    })
    setScreen('result')
  }, [quizStartTime])

  useEffect(() => {
    if (quizTimeLeft === 0 && screen === 'quiz') finishQuiz(quizAns)
  }, [quizTimeLeft, screen, finishQuiz, quizAns])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (screen === 'module') {
    const mod = MODULES[currentMod]
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <button className="btn" onClick={() => { clearInterval(modTimerRef.current!); setScreen('dashboard') }}>← Voltar</button>
            <div style={{ flex: 1 }}><div className="progress-track"><div className="progress-fill" style={{ width: `${readPct}%` }} /></div></div>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)', minWidth: '50px', textAlign: 'right' }}>⏱ {fmt(modTime)}</span>
          </div>
          <div className="card module-content" dangerouslySetInnerHTML={{ __html: MODULES[currentMod].content }} />
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {canFinish ? (
              <button className="btn btn-primary" onClick={finishModule} style={{ padding: '13px 40px', fontSize: '15px' }}>✓ Concluir módulo</button>
            ) : (
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'inline-block', fontSize: '13px', color: 'var(--gray-400)' }}>
                Leia o conteúdo completo — mínimo {mod.minTime}s &nbsp;
                <span style={{ color: 'var(--gold)', fontWeight: '600' }}>({modTime}/{mod.minTime}s)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'quiz') {
    const q = QUESTIONS[quizIdx]
    const qPct = Math.round((quizIdx / QUESTIONS.length) * 100)
    const isLast = quizIdx === QUESTIONS.length - 1
    const urgent = quizTimeLeft < 120
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Avaliação Final</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Manual de Atendimento — Cirurgia Plástica</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: urgent ? 'var(--red)' : 'var(--gold)' }}>{fmt(quizTimeLeft)}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>tempo restante</div>
            </div>
          </div>
          <div className="progress-track" style={{ marginBottom: '1.5rem' }}><div className="progress-fill" style={{ width: `${qPct}%` }} /></div>
          <div className="card">
            <p style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.6', marginBottom: '1.25rem', color: 'var(--dark)' }}>{quizIdx + 1}. {q.q}</p>
            {q.opts.map((opt, i) => (
              <div key={i} className={`quiz-opt${quizAns[quizIdx] === i ? ' selected' : ''}`}
                onClick={() => { setQuizAns(prev => ({ ...prev, [quizIdx]: i })) }}>
                <span style={{ color: 'var(--gray-400)', marginRight: '10px', fontWeight: '600', fontSize: '13px' }}>{String.fromCharCode(65 + i)}.</span>
                {opt}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Pergunta {quizIdx + 1} de {QUESTIONS.length}</span>
            <button className="btn btn-primary"
              onClick={() => { if (quizIdx < QUESTIONS.length - 1) setQuizIdx(quizIdx + 1); else finishQuiz({ ...quizAns }) }}
              disabled={quizAns[quizIdx] === undefined} style={{ padding: '10px 24px' }}>
              {isLast ? 'Finalizar ✓' : 'Próxima →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'result' && quizResult) {
    const pass = quizResult.score >= 70
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: pass ? 'var(--green-light)' : 'var(--red-light)', border: `3px solid ${pass ? 'var(--green)' : 'var(--red)'}` }}>{pass ? '🏆' : '📚'}</div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{pass ? 'Parabéns! Você foi aprovada!' : 'Continue estudando!'}</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', maxWidth: '400px', margin: '0 auto' }}>{pass ? 'Nota mínima de 70% atingida. Você está pronta para o atendimento de excelência.' : 'Você precisa de 70% para ser aprovada. Revise os módulos e tente novamente.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
            {[['Pontuação', `${quizResult.score}%`], ['Corretas', `${quizResult.correct}/${quizResult.total}`], ['Tempo', fmt(quizResult.timeSpent)]].map(([label, val]) => (
              <div className="stat-card" key={label}><div className="stat-num">{val}</div><div className="stat-label">{label}</div></div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <p className="section-title">Revisão das respostas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {QUESTIONS.map((q, i) => {
                const ok = quizResult.answers[i] === q.ans
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: ok ? 'var(--green-light)' : 'var(--red-light)', border: `1px solid ${ok ? 'var(--green)' : 'var(--red)'}`, fontSize: '13px' }}>
                    <p style={{ fontWeight: '600', color: ok ? 'var(--green)' : 'var(--red)', marginBottom: '4px' }}>{ok ? '✓' : '✗'} {i+1}. {q.q}</p>
                    {!ok && <p style={{ color: 'var(--gray-600)', fontSize: '12px' }}>Sua resposta: <em>{q.opts[quizResult.answers[i] ?? 0]}</em></p>}
                    <p style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '500' }}>✓ {q.opts[q.ans]}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setScreen('dashboard')}>🏠 Painel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={startQuiz}>🔄 Refazer avaliação</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--gold)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(184,150,10,0.25)' }}>📋</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700' }}>Olá, {userName}! 👋</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Conclua todos os módulos para liberar a avaliação</p>
            </div>
          </div>
          <button className="btn" onClick={logout} style={{ fontSize: '13px' }}>Sair</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.25rem' }}>
          {[['Módulos', `${doneMods}/${MODULES.length}`], ['Tempo', `${Math.round(totalTime/60)}min`], ['Progresso', `${pct}%`]].map(([label, val]) => (
            <div className="stat-card" key={label as string}><div className="stat-num">{val}</div><div className="stat-label">{label}</div></div>
          ))}
        </div>
        <div className="card" style={{ marginBottom: '1.5rem', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600' }}>Progresso geral</span>
            <span style={{ color: 'var(--gray-400)' }}>{doneMods} de {MODULES.length} módulos</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <p className="section-title">Módulos de Treinamento</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
          {MODULES.map((mod, i) => {
            const done = progress[i]?.completed
            const locked = i > 0 && !progress[i-1]?.completed
            return (
              <div key={i} onClick={() => !locked && openModule(i)} className="card card-hover"
                style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1, borderColor: done ? 'var(--green)' : undefined, padding: '14px 18px', transition: 'all 0.15s' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: done ? 'var(--green-light)' : 'var(--gold-light)' }}>
                  {done ? '✅' : ICONS[i]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Módulo {i+1}: {mod.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⏱ ~{mod.minTime}s</span>
                    {done && <span className="badge badge-green">Concluído</span>}
                    {locked && <span className="badge badge-gray">🔒 Bloqueado</span>}
                    {!done && !locked && <span className="badge badge-gold">Disponível</span>}
                  </div>
                </div>
                {!locked && !done && <span style={{ color: 'var(--gray-200)', fontSize: '18px' }}>›</span>}
              </div>
            )
          })}
        </div>
        {allDone && (
          <button onClick={startQuiz} className="btn btn-primary btn-full" style={{ fontSize: '15px', padding: '16px' }}>
            🎓 Iniciar Avaliação Final
          </button>
        )}
      </div>
    </div>
  )
}

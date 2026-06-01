'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES, QUESTIONS } from '@/lib/data'

type Screen = 'dashboard' | 'module' | 'quiz' | 'result'

interface ModuleProgress {
  module_index: number
  completed: boolean
  time_spent: number
}

interface QuizResult {
  score: number
  correct: number
  total: number
  timeSpent: number
  answers: Record<number, number>
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

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

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAns, setQuizAns] = useState<Record<number, number>>({})
  const [quizTimeLeft, setQuizTimeLeft] = useState(900)
  const [quizStartTime, setQuizStartTime] = useState(0)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [answered, setAnswered] = useState(false)
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/progress').then(r => r.json()).then(d => {
      if (d.progress) {
        const map: Record<number, ModuleProgress> = {}
        let t = 0
        d.progress.forEach((p: ModuleProgress) => {
          map[p.module_index] = p
          t += p.time_spent || 0
        })
        setProgress(map)
        setTotalTime(t)
      }
    })
  }, [])

  const doneMods = Object.values(progress).filter(p => p.completed).length
  const pct = Math.round((doneMods / MODULES.length) * 100)
  const allDone = doneMods === MODULES.length

  // ── Module ─────────────────────────────────────────────
  function openModule(idx: number) {
    if (idx > 0 && !progress[idx - 1]?.completed) return
    setCurrentMod(idx)
    setModTime(0)
    setCanFinish(false)
    setReadPct(0)
    setScreen('module')
    clearInterval(modTimerRef.current!)
    let t = 0
    modTimerRef.current = setInterval(() => {
      t++
      setModTime(t)
      setTotalTime(prev => prev + 1)
      const p = Math.min(100, Math.round((t / MODULES[idx].minTime) * 100))
      setReadPct(p)
      if (t >= MODULES[idx].minTime) setCanFinish(true)
    }, 1000)
  }

  function backToDash() {
    clearInterval(modTimerRef.current!)
    setScreen('dashboard')
  }

  async function finishModule() {
    clearInterval(modTimerRef.current!)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleIndex: currentMod, timeSpent: modTime }),
    })
    setProgress(prev => ({
      ...prev,
      [currentMod]: { module_index: currentMod, completed: true, time_spent: modTime }
    }))
    setScreen('dashboard')
  }

  // ── Quiz ───────────────────────────────────────────────
  function startQuiz() {
    setQuizIdx(0)
    setQuizAns({})
    setQuizTimeLeft(900)
    setQuizStartTime(Date.now())
    setAnswered(false)
    setScreen('quiz')
    clearInterval(quizTimerRef.current!)
    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft(prev => {
        if (prev <= 1) { clearInterval(quizTimerRef.current!); return 0 }
        return prev - 1
      })
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

  function selectAns(i: number) {
    if (answered) return
    setQuizAns(prev => ({ ...prev, [quizIdx]: i }))
    setAnswered(true)
  }

  function nextQuestion() {
    if (quizIdx < QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1)
      setAnswered(quizAns[quizIdx + 1] !== undefined)
    } else {
      finishQuiz({ ...quizAns })
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // ── RENDERS ─────────────────────────────────────────────
  if (screen === 'module') {
    const mod = MODULES[currentMod]
    return (
      <div className="min-h-screen bg-[#f8f8f6] p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={backToDash} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
              ← Voltar
            </button>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#B8960A] rounded-full transition-all duration-300" style={{ width: `${readPct}%` }} />
            </div>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              ⏱ {fmt(modTime)}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="module-content" dangerouslySetInnerHTML={{ __html: mod.content }} />
          </div>

          <div className="mt-6 text-center">
            {canFinish ? (
              <button onClick={finishModule} className="px-8 py-3 bg-[#B8960A] text-white rounded-xl font-medium hover:bg-[#9a7c08] transition">
                ✓ Concluir módulo
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Leia o conteúdo completo para concluir — mínimo {mod.minTime}s
                <span className="ml-2 font-medium text-[#B8960A]">({modTime}/{mod.minTime}s)</span>
              </p>
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

    return (
      <div className="min-h-screen bg-[#f8f8f6] p-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">Avaliação Final</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manual de Atendimento — Cirurgia Plástica</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-semibold ${quizTimeLeft < 120 ? 'text-red-500' : 'text-[#B8960A]'}`}>{fmt(quizTimeLeft)}</div>
              <div className="text-xs text-gray-500">tempo restante</div>
            </div>
          </div>

          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#B8960A] rounded-full transition-all" style={{ width: `${qPct}%` }} />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-base font-medium leading-relaxed mb-5">{q.q}</p>
            <div className="space-y-2">
              {q.opts.map((opt, i) => {
                const sel = quizAns[quizIdx] === i
                return (
                  <div
                    key={i}
                    onClick={() => selectAns(i)}
                    className={`p-3.5 rounded-xl border text-sm cursor-pointer transition-all
                      ${sel ? 'border-[#B8960A] bg-[#FFF8E7] text-[#7a6008]' : 'border-gray-200 hover:border-[#B8960A] hover:bg-gray-50'}`}
                  >
                    {opt}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-5">
            <span className="text-sm text-gray-500">Pergunta {quizIdx + 1} de {QUESTIONS.length}</span>
            <button
              onClick={nextQuestion}
              disabled={quizAns[quizIdx] === undefined}
              className="px-6 py-2.5 bg-[#B8960A] text-white rounded-xl text-sm font-medium hover:bg-[#9a7c08] transition disabled:opacity-40"
            >
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
      <div className="min-h-screen bg-[#f8f8f6] p-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8 mt-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl ${pass ? 'bg-green-100' : 'bg-red-100'}`}>
              {pass ? '🏆' : '📚'}
            </div>
            <h1 className="text-2xl font-semibold mb-2">{pass ? 'Parabéns! Você foi aprovada!' : 'Continue estudando!'}</h1>
            <p className="text-gray-500 text-sm">{pass ? 'Nota mínima de 70% atingida. Você está pronta para o atendimento de excelência.' : 'Você precisa de 70% para ser aprovada. Revise os módulos e tente novamente.'}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[['Pontuação', `${quizResult.score}%`], ['Corretas', `${quizResult.correct}/${quizResult.total}`], ['Tempo', fmt(quizResult.timeSpent)]].map(([label, val]) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-semibold text-[#B8960A]">{val}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Revisão das respostas</p>
            <div className="space-y-3">
              {QUESTIONS.map((q, i) => {
                const ok = quizResult.answers[i] === q.ans
                return (
                  <div key={i} className={`p-3 rounded-xl text-sm ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`font-medium mb-1 ${ok ? 'text-green-700' : 'text-red-700'}`}>
                      {ok ? '✓' : '✗'} {i + 1}. {q.q}
                    </p>
                    {!ok && <p className="text-gray-500 text-xs">Sua resposta: <em>{q.opts[quizResult.answers[i] ?? 0]}</em></p>}
                    <p className="text-green-700 text-xs">Correta: <strong>{q.opts[q.ans]}</strong></p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setScreen('dashboard')} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 transition">
              🏠 Painel
            </button>
            <button onClick={startQuiz} className="flex-1 py-3 bg-[#B8960A] text-white rounded-xl text-sm font-medium hover:bg-[#9a7c08] transition">
              🔄 Refazer avaliação
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#f8f8f6] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Olá, {userName} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Conclua todos os módulos para liberar a avaliação final</p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            Sair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            ['Módulos', `${doneMods}/${MODULES.length}`],
            ['Tempo', `${Math.round(totalTime / 60)}min`],
            ['Progresso', `${pct}%`]
          ].map(([label, val]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-semibold text-[#B8960A]">{val}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progresso geral</span>
            <span className="text-gray-500">{doneMods} de {MODULES.length} módulos</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#B8960A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Modules */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Módulos de Treinamento</p>
        <div className="space-y-2 mb-6">
          {MODULES.map((mod, i) => {
            const done = progress[i]?.completed
            const locked = i > 0 && !progress[i - 1]?.completed
            return (
              <div
                key={i}
                onClick={() => !locked && openModule(i)}
                className={`bg-white border rounded-xl p-4 flex items-center gap-3 transition-all shadow-sm
                  ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#B8960A]'}
                  ${done ? 'border-green-300' : 'border-gray-200'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg
                  ${done ? 'bg-green-100' : 'bg-gray-50'}`}>
                  {done ? '✓' : ['🧠', '💬', '🛡️', '📅', '📱', '⚖️', '📊'][i]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">Módulo {i + 1}: {mod.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ⏱ ~{mod.minTime}s de leitura
                    {done && <span className="ml-2 text-green-600 font-medium">Concluído</span>}
                    {locked && <span className="ml-2 text-gray-400">🔒 Bloqueado</span>}
                    {!done && !locked && <span className="ml-2 text-[#B8960A] font-medium">Disponível</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quiz button */}
        {allDone && (
          <button onClick={startQuiz} className="w-full py-4 bg-[#B8960A] text-white rounded-xl font-medium hover:bg-[#9a7c08] transition text-sm">
            🎓 Iniciar Avaliação Final
          </button>
        )}
      </div>
    </div>
  )
}

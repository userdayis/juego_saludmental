import { useEffect, useMemo, useRef, useState } from 'react'
import { AchievementToast } from './components/AchievementToast'
import { Board } from './components/Board'
import { HUD } from './components/HUD'
import { ResultModal } from './components/ResultModal'
import { StatsModal } from './components/StatsModal'
import { TutorialModal } from './components/TutorialModal'
import type { Achievement } from './data/achievements'
import {
  DIFFICULTIES,
  LIVES_BY_DIFFICULTY,
  MODES,
  getItemById,
  type Difficulty,
  type Mode,
} from './data/cards'
import { RESOURCES } from './data/resources'
import { useGame } from './hooks/useGame'
import { useHighScore } from './hooks/useHighScore'
import { useStats } from './hooks/useStats'
import { isSoundEnabled, setSoundEnabled } from './utils/sound'

type Settings = { mode: Mode; difficulty: Difficulty }

const TUTORIAL_KEY = 'salud-mental:tutorial-seen'

export default function App() {
  const { state, startGame, flipCard, useHint } = useGame()
  const { best, saveIfBetter } = useHighScore()
  const { stats, recordResult } = useStats()
  const [settings, setSettings] = useState<Settings>({ mode: 'clasico', difficulty: 'normal' })
  const [showResult, setShowResult] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem(TUTORIAL_KEY)
    } catch {
      return false
    }
  })
  const [isRecord, setIsRecord] = useState(false)
  const [unlocked, setUnlocked] = useState<Achievement[]>([])
  const [toast, setToast] = useState<Achievement | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  const totalPairs = state.deck.length / 2
  const matchedIds = useMemo(() => [...state.matched], [state.matched])
  const finished = state.status === 'won' || state.status === 'lost'
  const recordedRef = useRef(false)

  useEffect(() => {
    if (state.status === 'playing') {
      recordedRef.current = false
      return
    }
    if (!finished || recordedRef.current) return
    recordedRef.current = true

    if (state.status === 'won') {
      setIsRecord(
        saveIfBetter(state.difficulty, state.mode, {
          score: state.score,
          seconds: state.seconds,
          moves: state.moves,
        }),
      )
    }

    const outcome = recordResult({
      won: state.status === 'won',
      moves: state.moves,
      matchedPairs: state.matched.size,
      totalPairs,
      seconds: state.seconds,
      difficulty: state.difficulty,
      mode: state.mode,
      livesLeft: state.lives,
      livesStart: state.mode === 'vidas' ? LIVES_BY_DIFFICULTY[state.difficulty] : null,
    })
    setUnlocked(outcome.unlocked)
    if (outcome.unlocked.length > 0) setToast(outcome.unlocked[0])
    setShowResult(true)
  }, [state.status])

  const previousRef = useRef(state)
  useEffect(() => {
    const previous = previousRef.current
    previousRef.current = state
    if (previous === state) return

    if (state.status === 'won') {
      setAnnouncement('¡Partida completada! Todos los pares encontrados.')
      return
    }
    if (state.status === 'lost') {
      setAnnouncement(state.loseReason === 'time' ? 'Se acabó el tiempo.' : 'Sin vidas restantes.')
      return
    }
    if (state.hintOpen && !previous.hintOpen) {
      const item = getItemById(state.deck[state.flipped[0]]?.itemId ?? '')
      if (item) {
        setAnnouncement(`Pista: te falta el par de ${item.label}.`)
        return
      }
    }
    if (state.matched.size > previous.matched.size) {
      const newId = matchedIds.find((id) => !previous.matched.has(id))
      const item = newId ? getItemById(newId) : undefined
      if (item) {
        setAnnouncement(`Par encontrado: ${item.label}.`)
        return
      }
    }
    if (state.flipped.length === 2 && previous.flipped.length === 1) {
      setAnnouncement('No coinciden.')
      return
    }
    if (state.flipped.length === 1 && previous.flipped.length === 0) {
      const item = getItemById(state.deck[state.flipped[0]]?.itemId ?? '')
      if (item) setAnnouncement(`Carta volteada: ${item.label}.`)
    }
  }, [state, matchedIds])

  const applySettings = (next: Settings) => {
    setSettings(next)
    if (state.status !== 'idle') {
      setShowResult(false)
      startGame(next.mode, next.difficulty)
    }
  }

  const restart = () => {
    setShowResult(false)
    startGame(settings.mode, settings.difficulty)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('salud-mental:theme', next)
    } catch {
      /* almacenamiento no disponible */
    }
    setTheme(next)
  }

  const closeTutorial = () => {
    setShowTutorial(false)
    try {
      localStorage.setItem(TUTORIAL_KEY, '1')
    } catch {
      /* almacenamiento no disponible */
    }
  }

  return (
    <div className="app">
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <header className="header">
        <div className="header__brand">
          <span className="header__logo" aria-hidden="true">
            🌿
          </span>
          <div>
            <h1 className="header__title">Memoria · Salud Mental</h1>
            <p className="header__subtitle">Encuentra los pares y llévate un tip de bienestar</p>
            <p className="header__sena">SENA · Servicio Nacional de Aprendizaje</p>
          </div>
        </div>

        <div className="header__controls">
          <div className="header__levels" role="group" aria-label="Dificultad">
            {DIFFICULTIES.map((level) => (
              <button
                key={level.id}
                type="button"
                className={`chip ${settings.difficulty === level.id ? 'chip--active' : ''}`}
                onClick={() => applySettings({ ...settings, difficulty: level.id })}
              >
                {level.label} · {level.pairs}
              </button>
            ))}
          </div>

          <div className="header__levels" role="group" aria-label="Modo de juego">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`chip ${settings.mode === mode.id ? 'chip--active' : ''}`}
                title={mode.hint}
                onClick={() => applySettings({ ...settings, mode: mode.id })}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="chip chip--icon"
            onClick={() => setShowStats(true)}
            aria-label="Ver estadísticas y logros"
            title="Estadísticas y logros"
          >
            📊
          </button>
          <button
            type="button"
            className="chip chip--icon"
            onClick={() => setShowTutorial(true)}
            aria-label="Cómo se juega"
            title="Cómo se juega"
          >
            ❓
          </button>
          <button
            type="button"
            className="chip chip--icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main">
        {state.status === 'idle' ? (
          <section className="start">
            <h2 className="start__title">¿Listo para entrenar la memoria?</h2>
            <p className="start__text">
              Voltea las cartas y encuentra las parejas de hábitos, emociones y técnicas que cuidan tu
              bienestar. Cada pareja que descubras te da un consejo para llevar.
            </p>
            <p className="start__mode">
              Modo seleccionado: <strong>{MODES.find((m) => m.id === settings.mode)?.label}</strong>
            </p>
            <div className="start__levels">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setSettings({ ...settings, difficulty: level.id })
                    startGame(settings.mode, level.id)
                  }}
                >
                  {level.label} · {level.pairs} pares
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
            <HUD
              moves={state.moves}
              seconds={state.seconds}
              score={state.score}
              matchedCount={state.matched.size}
              totalPairs={totalPairs}
              mode={state.mode}
              timeLimit={state.timeLimit}
              lives={state.lives}
              hintsLeft={state.hintsLeft}
              hintBlocked={state.flipped.length > 0 || state.status !== 'playing'}
              best={best(state.difficulty, state.mode)}
              soundEnabled={soundOn}
              onToggleSound={toggleSound}
              onHint={useHint}
              onRestart={restart}
            />
            <Board
              deck={state.deck}
              flipped={state.flipped}
              matched={state.matched}
              hintOpen={state.hintOpen}
              locked={state.status !== 'playing'}
              onFlip={flipCard}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p className="footer__sena">Proyecto de formación · SENA</p>
        <p className="footer__help">
          Ayuda inmediata:{' '}
          {RESOURCES.map((resource, index) => (
            <span key={resource.id}>
              {index > 0 && ' · '}
              <a href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {resource.name}
              </a>
            </span>
          ))}
        </p>
        <p>
          Este juego no sustituye atención profesional. Si lo necesitas, habla con alguien o busca apoyo
          especializado.
        </p>
      </footer>

      {showResult && finished && (
        <ResultModal
          status={state.status === 'won' ? 'won' : 'lost'}
          loseReason={state.loseReason}
          score={state.score}
          moves={state.moves}
          seconds={state.seconds}
          difficulty={state.difficulty}
          matchedIds={matchedIds}
          totalPairs={totalPairs}
          isRecord={isRecord}
          unlocked={unlocked}
          onRestart={restart}
          onClose={() => setShowResult(false)}
        />
      )}

      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}

      {showTutorial && <TutorialModal onClose={closeTutorial} />}

      {toast && <AchievementToast achievement={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

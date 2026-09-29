import { useEffect, useMemo, useState } from 'react'
import { Board } from './components/Board'
import { HUD } from './components/HUD'
import { ResultModal } from './components/ResultModal'
import { DIFFICULTIES } from './data/cards'
import { useGame } from './hooks/useGame'
import { useHighScore } from './hooks/useHighScore'

export default function App() {
  const { state, startGame, flipCard } = useGame()
  const { highScore, saveIfBetter } = useHighScore()
  const [showResult, setShowResult] = useState(false)
  const [isRecord, setIsRecord] = useState(false)

  const totalPairs = state.deck.length / 2
  const matchedIds = useMemo(() => [...state.matched], [state.matched])

  useEffect(() => {
    if (state.status !== 'won') return
    const result = { score: state.score, seconds: state.seconds, moves: state.moves }
    setIsRecord(saveIfBetter(result))
    setShowResult(true)
  }, [state.status])

  const restart = () => {
    setShowResult(false)
    startGame(state.difficulty)
  }

  return (
    <div className="app">
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

        <div className="header__levels" role="group" aria-label="Dificultad">
          {DIFFICULTIES.map((level) => (
            <button
              key={level.id}
              type="button"
              className={`chip ${state.difficulty === level.id && state.status !== 'idle' ? 'chip--active' : ''}`}
              onClick={() => {
                setShowResult(false)
                startGame(level.id)
              }}
            >
              {level.label} · {level.pairs}
            </button>
          ))}
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
            <div className="start__levels">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className="btn btn--primary"
                  onClick={() => startGame(level.id)}
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
              best={highScore}
              onRestart={restart}
            />
            <Board
              deck={state.deck}
              flipped={state.flipped}
              matched={state.matched}
              status={state.status}
              onFlip={flipCard}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p className="footer__sena">Proyecto de formación · SENA</p>
        <p>
          Este juego no sustituye atención profesional. Si lo necesitas, habla con alguien o busca apoyo
          especializado.
        </p>
      </footer>

      {showResult && state.status === 'won' && (
        <ResultModal
          score={state.score}
          moves={state.moves}
          seconds={state.seconds}
          difficulty={state.difficulty}
          matchedIds={matchedIds}
          isRecord={isRecord}
          onRestart={restart}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  )
}

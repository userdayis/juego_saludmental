import type { Mode } from '../data/cards'
import type { HighScore } from '../hooks/useHighScore'
import { formatTime } from '../utils/format'

type HUDProps = {
  moves: number
  seconds: number
  score: number
  matchedCount: number
  totalPairs: number
  mode: Mode
  timeLimit: number
  lives: number | null
  best: HighScore | null
  soundEnabled: boolean
  onToggleSound: () => void
  onRestart: () => void
}

export function HUD({
  moves,
  seconds,
  score,
  matchedCount,
  totalPairs,
  mode,
  timeLimit,
  lives,
  best,
  soundEnabled,
  onToggleSound,
  onRestart,
}: HUDProps) {
  const countingDown = mode === 'reloj' && timeLimit > 0
  const timeValue = countingDown ? formatTime(Math.max(0, timeLimit - seconds)) : formatTime(seconds)
  const urgent = countingDown && timeLimit - seconds <= 15

  return (
    <div className="hud">
      <div className="hud__stats">
        <div className="stat">
          <span className="stat__value">{moves}</span>
          <span className="stat__label">Intentos</span>
        </div>
        <div className="stat">
          <span className={`stat__value ${urgent ? 'stat__value--urgent' : ''}`}>{timeValue}</span>
          <span className="stat__label">{countingDown ? 'Restante' : 'Tiempo'}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{score}</span>
          <span className="stat__label">Puntos</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {matchedCount}/{totalPairs}
          </span>
          <span className="stat__label">Pares</span>
        </div>
        {lives !== null && (
          <div className="stat">
            <span className={`stat__value ${lives <= 2 ? 'stat__value--urgent' : ''}`}>❤️ {lives}</span>
            <span className="stat__label">Vidas</span>
          </div>
        )}
      </div>
      <div className="hud__actions">
        {best && (
          <span className="hud__best" title="Mejor puntuación de este nivel y modo">
            Récord: {best.score}
          </span>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Reiniciar
        </button>
      </div>
    </div>
  )
}

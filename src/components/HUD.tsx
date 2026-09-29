import { formatTime } from '../utils/format'

type HUDProps = {
  moves: number
  seconds: number
  score: number
  matchedCount: number
  totalPairs: number
  best: { score: number } | null
  onRestart: () => void
}

export function HUD({ moves, seconds, score, matchedCount, totalPairs, best, onRestart }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud__stats">
        <div className="stat">
          <span className="stat__value">{moves}</span>
          <span className="stat__label">Intentos</span>
        </div>
        <div className="stat">
          <span className="stat__value">{formatTime(seconds)}</span>
          <span className="stat__label">Tiempo</span>
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
      </div>
      <div className="hud__actions">
        {best && (
          <span className="hud__best" title="Mejor puntuación guardada en este dispositivo">
            Récord: {best.score}
          </span>
        )}
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Reiniciar
        </button>
      </div>
    </div>
  )
}

import { useEffect, useMemo } from 'react'
import { CARD_ITEMS, DIFFICULTIES, type Difficulty } from '../data/cards'
import { formatTime } from '../utils/format'

type ResultModalProps = {
  score: number
  moves: number
  seconds: number
  difficulty: Difficulty
  matchedIds: string[]
  isRecord: boolean
  onRestart: () => void
  onClose: () => void
}

export function ResultModal({
  score,
  moves,
  seconds,
  difficulty,
  matchedIds,
  isRecord,
  onRestart,
  onClose,
}: ResultModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tips = useMemo(() => {
    const pool = CARD_ITEMS.filter((item) => matchedIds.includes(item.id))
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3)
  }, [matchedIds])

  const pairs = DIFFICULTIES.find((d) => d.id === difficulty)?.pairs ?? 0

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Resultado de la partida">
      <div className="modal">
        {isRecord && <span className="modal__badge">🏆 Nuevo récord</span>}
        <h2 className="modal__title">¡Muy bien! 🌱</h2>
        <p className="modal__subtitle">
          Completaste {pairs} parejas en {formatTime(seconds)} con {moves} intentos.
        </p>

        <div className="modal__score">
          <span className="modal__score-value">{score}</span>
          <span className="modal__score-label">puntos</span>
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">Para llevar</h3>
          <ul className="tips-list">
            {tips.map((tip) => (
              <li key={tip.id} className="tips-list__item">
                <span aria-hidden="true">{tip.icon}</span>
                <span>{tip.tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            Jugar otra vez
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Ver tablero
          </button>
        </div>
      </div>
    </div>
  )
}

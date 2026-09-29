import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { CARD_ITEMS, DIFFICULTIES, type Difficulty } from '../data/cards'
import type { Achievement } from '../data/achievements'
import { RESOURCES } from '../data/resources'
import type { LoseReason } from '../hooks/useGame'
import { shareScore } from '../utils/share'
import { formatTime } from '../utils/format'

type ResultModalProps = {
  status: 'won' | 'lost'
  loseReason: LoseReason
  score: number
  moves: number
  seconds: number
  difficulty: Difficulty
  matchedIds: string[]
  totalPairs: number
  isRecord: boolean
  unlocked: Achievement[]
  onRestart: () => void
  onClose: () => void
}

export function ResultModal({
  status,
  loseReason,
  score,
  moves,
  seconds,
  difficulty,
  matchedIds,
  totalPairs,
  isRecord,
  unlocked,
  onRestart,
  onClose,
}: ResultModalProps) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'failed'>('idle')

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

  const pairs = DIFFICULTIES.find((d) => d.id === difficulty)?.pairs ?? totalPairs

  const title = status === 'won' ? '¡Muy bien! 🌱' : loseReason === 'time' ? 'Se acabó el tiempo ⏳' : 'Sin vidas 💔'
  const subtitle =
    status === 'won'
      ? `Completaste ${pairs} parejas en ${formatTime(seconds)} con ${moves} intentos.`
      : `Encontraste ${matchedIds.length} de ${pairs} parejas en ${formatTime(seconds)}. ¡Inténtalo de nuevo!`

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Resultado de la partida">
      <div className="modal">
        {status === 'won' && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} style={{ '--i': index } as CSSProperties} />
            ))}
          </div>
        )}
        {status === 'won' && isRecord && <span className="modal__badge">🏆 Nuevo récord</span>}
        <h2 className="modal__title">{title}</h2>
        <p className="modal__subtitle">{subtitle}</p>

        <div className="modal__score">
          <span className="modal__score-value">{score}</span>
          <span className="modal__score-label">puntos</span>
        </div>

        {unlocked.length > 0 && (
          <div className="unlocked" aria-label="Logros desbloqueados en esta partida">
            {unlocked.map((achievement) => (
              <span key={achievement.id} className="unlocked__badge">
                {achievement.icon} {achievement.name}
              </span>
            ))}
          </div>
        )}

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

        <div className="modal__resources">
          <h3 className="modal__tips-title">¿Necesitas hablar con alguien?</h3>
          <ul className="resource-list">
            {RESOURCES.map((resource) => (
              <li key={resource.id} className="resource-list__item">
                <a href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <strong>{resource.name}</strong>
                  <span>{resource.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            Jugar otra vez
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={async () => {
              const outcome = await shareScore(score)
              if (outcome === 'failed') {
                setShareState('failed')
                return
              }
              setShareState(outcome)
              window.setTimeout(() => setShareState('idle'), 2500)
            }}
          >
            {shareState === 'copied'
              ? '¡Copiado!'
              : shareState === 'shared'
                ? '¡Compartido!'
                : shareState === 'failed'
                  ? 'No se pudo'
                  : 'Compartir'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Ver tablero
          </button>
        </div>
      </div>
    </div>
  )
}

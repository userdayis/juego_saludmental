import { ACHIEVEMENTS } from '../data/achievements'
import type { Stats } from '../hooks/useStats'
import { formatTime } from '../utils/format'

type StatsModalProps = {
  stats: Stats
  onClose: () => void
}

export function StatsModal({ stats, onClose }: StatsModalProps) {
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Estadísticas">
      <div className="modal modal--wide">
        <h2 className="modal__title">📊 Tus estadísticas</h2>

        <div className="stats-grid">
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.games}</span>
            <span className="stats-cell__label">Partidas</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{winRate}%</span>
            <span className="stats-cell__label">Victorias</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">
              {stats.streak} / {stats.bestStreak}
            </span>
            <span className="stats-cell__label">Racha actual / mejor</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.pairs}</span>
            <span className="stats-cell__label">Pares encontrados</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.perfect}</span>
            <span className="stats-cell__label">Partidas perfectas</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.bestTime !== null ? formatTime(stats.bestTime) : '—'}</span>
            <span className="stats-cell__label">Mejor tiempo</span>
          </div>
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">🏅 Logros ({stats.achievements.length}/{ACHIEVEMENTS.length})</h3>
          <ul className="achievements-list">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = stats.achievements.includes(achievement.id)
              return (
                <li
                  key={achievement.id}
                  className={`achievement ${unlocked ? 'achievement--unlocked' : 'achievement--locked'}`}
                >
                  <span className="achievement__icon" aria-hidden="true">
                    {achievement.icon}
                  </span>
                  <span className="achievement__text">
                    <strong>{achievement.name}</strong>
                    <span>{achievement.description}</span>
                  </span>
                  {!unlocked && <span className="achievement__lock" aria-hidden="true">🔒</span>}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

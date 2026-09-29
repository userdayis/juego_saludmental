import { ACHIEVEMENTS } from '../data/achievements'
import type { Stats } from '../hooks/useStats'
import { formatTime, toISODate } from '../utils/format'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'
import { DIFFICULTIES, MODES } from '../data/cards'
import { restoreAll, downloadCsv, downloadBackup } from '../utils/backup'
import { levelFor, weeklyProgress } from '../hooks/useStats'

type StatsModalProps = {
  stats: Stats
  onClose: () => void
  onRefresh: () => void
  onCertificate: () => void
}

export function StatsModal({ stats, onClose, onRefresh, onCertificate }: StatsModalProps) {
  const { t, lang } = useI18n()
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0
  const level = levelFor(stats)
  const goals = weeklyProgress(stats)
  const recentDays = lastNDays(210)

  const reset = () => {
    if (!window.confirm(t('stats.resetConfirm'))) return
    try {
      localStorage.removeItem('salud-mental:stats')
      localStorage.removeItem('salud-mental:records')
      localStorage.removeItem('salud-mental:campaign')
      localStorage.removeItem('salud-mental:checkin')
      localStorage.removeItem('salud-mental:daily')
      localStorage.removeItem('salud-mental:session')
    } catch {
      /* almacenamiento no disponible */
    }
    onRefresh()
    onClose()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('stats.dialog')}>
      <div className="modal modal--wide">
        <h2 className="modal__title">{t('stats.title')}</h2>

        <p className="stats-level">
          {t('stats.level', { level: pick(level.name, lang), xp: level.xp })}
        </p>

        <div className="stats-grid">
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.games}</span>
            <span className="stats-cell__label">{t('stats.games')}</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{winRate}%</span>
            <span className="stats-cell__label">{t('stats.winRate')}</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">
              {stats.streak} / {stats.bestStreak}
            </span>
            <span className="stats-cell__label">{t('stats.streak')}</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.pairs}</span>
            <span className="stats-cell__label">{t('stats.pairs')}</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">{stats.perfect}</span>
            <span className="stats-cell__label">{t('stats.perfect')}</span>
          </div>
          <div className="stats-cell">
            <span className="stats-cell__value">
              {stats.bestTime !== null ? formatTime(stats.bestTime) : '—'}
            </span>
            <span className="stats-cell__label">{t('stats.bestTime')}</span>
          </div>
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">
            {t('stats.achievements', { n: stats.achievements.length, m: ACHIEVEMENTS.length })}
          </h3>
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
                    <strong>{pick(achievement.name, lang)}</strong>
                    <span>{pick(achievement.description, lang)}</span>
                  </span>
                  {!unlocked && (
                    <span className="achievement__lock" aria-hidden="true">
                      🔒
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">{t('stats.history')}</h3>
          {stats.history.length === 0 ? (
            <p className="stats-empty">{t('stats.historyEmpty')}</p>
          ) : (
            <ul className="history-list">
              {stats.history.map((entry, index) => (
                <li key={`${entry.date}-${index}`} className="history-list__item">
                  <span>
                    {t('stats.historyRow', {
                      date: entry.date,
                      difficulty: pick(DIFFICULTIES.find((d) => d.id === entry.difficulty)?.label ?? { es: entry.difficulty, en: entry.difficulty }, lang),
                      mode: pick(MODES.find((m) => m.id === entry.mode)?.label ?? { es: entry.mode, en: entry.mode }, lang),
                      score: entry.score,
                    })}
                  </span>
                  <span className={entry.won ? 'history-list__win' : 'history-list__lose'}>
                    {entry.won ? t('stats.historyWin') : t('stats.historyLose')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">{t('stats.heatmap')}</h3>
          <div className="heatmap" role="img" aria-label={t('stats.heatmap')}>
            {recentDays.map((day) => (
              <span
                key={day}
                className={`heatmap__cell ${stats.daysPlayed.includes(day) ? 'heatmap__cell--on' : ''}`}
                title={day}
              />
            ))}
          </div>
        </div>

        <div className="modal__tips">
          <h3 className="modal__tips-title">{t('stats.goals')}</h3>
          <ul className="goals-list">
            {goals.map((goal) => (
              <li key={goal.id} className="goals-list__item">
                <div className="goals-list__text">
                  {t(`stats.goal${goal.id}`, { n: goal.target, done: goal.done })}
                  {goal.done >= goal.target && <span> {t('stats.goalDone')}</span>}
                </div>
                <div className="goals-list__bar">
                  <span
                    className="goals-list__fill"
                    style={{ width: `${Math.min(100, (goal.done / goal.target) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal__actions modal__actions--wrap">
          {stats.stagesDone >= 10 && (
            <button type="button" className="btn btn--primary" onClick={onCertificate}>
              {t('stats.certificate')}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => downloadBackup()}>
            {t('stats.export')}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'application/json'
              input.onchange = async () => {
                const file = input.files?.[0]
                if (!file) return
                const ok = await restoreAll(file)
                if (ok) {
                  onRefresh()
                  window.alert(t('stats.imported'))
                } else {
                  window.alert(t('stats.importFailed'))
                }
              }
              input.click()
            }}
          >
            {t('stats.import')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => downloadCsv(stats)}>
            {t('stats.csv')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={reset}>
            {t('stats.reset')}
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {t('stats.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function lastNDays(count: number): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(toISODate(d))
  }
  return days
}

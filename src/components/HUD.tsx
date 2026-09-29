import type { Mode } from '../data/cards'
import type { HighScore } from '../hooks/useHighScore'
import { formatTime } from '../utils/format'
import { useI18n } from '../i18n/context'

type HUDProps = {
  moves: number
  seconds: number
  score: number
  matchedCount: number
  totalPairs: number
  mode: Mode
  timeLimit: number
  lives: number | null
  hintsLeft: number
  hintBlocked: boolean
  wildsLeft: number
  wildBlocked: boolean
  multiplier: number
  turn: number | null
  best: HighScore | null
  soundEnabled: boolean
  ambientEnabled: boolean
  onToggleSound: () => void
  onToggleAmbient: () => void
  onHint: () => void
  onWild: () => void
  onBreathing: () => void
  onFirstAid: () => void
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
  hintsLeft,
  hintBlocked,
  wildsLeft,
  wildBlocked,
  multiplier,
  turn,
  best,
  soundEnabled,
  ambientEnabled,
  onToggleSound,
  onToggleAmbient,
  onHint,
  onWild,
  onBreathing,
  onFirstAid,
  onRestart,
}: HUDProps) {
  const { t } = useI18n()
  const countingDown = mode === 'reloj' && timeLimit > 0
  const timeValue = countingDown ? formatTime(Math.max(0, timeLimit - seconds)) : formatTime(seconds)
  const urgent = countingDown && timeLimit - seconds <= 15

  return (
    <div className="hud">
      <div className="hud__stats">
        <div className="stat">
          <span className="stat__value">{moves}</span>
          <span className="stat__label">{t('hud.attempts')}</span>
        </div>
        <div className="stat">
          <span className={`stat__value ${urgent ? 'stat__value--urgent' : ''}`}>{timeValue}</span>
          <span className="stat__label">{countingDown ? t('hud.remaining') : t('hud.time')}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{score}</span>
          <span className="stat__label">{t('hud.points')}</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {matchedCount}/{totalPairs}
          </span>
          <span className="stat__label">{t('hud.pairs')}</span>
        </div>
        {lives !== null && (
          <div className="stat">
            <span className={`stat__value ${lives <= 2 ? 'stat__value--urgent' : ''}`}>❤️ {lives}</span>
            <span className="stat__label">{t('hud.lives')}</span>
          </div>
        )}
        {turn !== null && (
          <div className="stat">
            <span className="stat__value">👤 {turn}</span>
            <span className="stat__label">{t('hud.turn')}</span>
          </div>
        )}
        {multiplier > 1 && (
          <div className="stat">
            <span className="stat__value stat__value--hot">🔥 {t('hud.multiplier', { n: multiplier })}</span>
            <span className="stat__label">{t('hud.points')}</span>
          </div>
        )}
      </div>
      <div className="hud__actions">
        {best && (
          <span className="hud__best" title={t('hud.recordTitle')}>
            {t('hud.record', { score: best.score })}
          </span>
        )}
        <button
          type="button"
          className="btn btn--hint"
          onClick={onHint}
          disabled={hintsLeft <= 0 || hintBlocked}
          title={t('hud.hintTitle')}
        >
          {t('hud.hint', { n: hintsLeft })}
        </button>
        <button
          type="button"
          className="btn btn--wild"
          onClick={onWild}
          disabled={wildsLeft <= 0 || wildBlocked}
          title={t('hud.wildTitle')}
        >
          {t('hud.wild')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onBreathing}
          aria-label={t('aria.breathing')}
          title={t('aria.breathing')}
        >
          🫁
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onFirstAid}
          aria-label={t('aria.firstAid')}
          title={t('aria.firstAid')}
        >
          🆘
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? t('sound.off') : t('sound.on')}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          className={`btn btn--ghost ${ambientEnabled ? 'btn--on' : ''}`}
          onClick={onToggleAmbient}
          aria-pressed={ambientEnabled}
          aria-label={t('aria.ambient')}
          title={t('aria.ambient')}
        >
          {ambientEnabled ? '🎵' : '🎶'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          {t('hud.restart')}
        </button>
      </div>
    </div>
  )
}

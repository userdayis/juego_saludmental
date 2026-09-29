import { useEffect, useMemo, useState } from 'react'
import {
  CARD_ITEMS,
  DIFFICULTIES,
  SOURCES,
  itemTip,
  type Difficulty,
  type Mode,
} from '../data/cards'
import type { Achievement } from '../data/achievements'
import { RESOURCES } from '../data/resources'
import type { LoseReason } from '../hooks/useGame'
import { shareScore, shareChallenge, buildChallengeUrl } from '../utils/share'
import { shareResultImage } from '../utils/image'
import { formatTime } from '../utils/format'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type ResultModalProps = {
  status: 'won' | 'lost'
  loseReason: LoseReason
  score: number
  moves: number
  seconds: number
  mode: Mode
  difficulty: Difficulty
  matchedIds: string[]
  totalPairs: number
  isRecord: boolean
  beaten: boolean
  duelWinner: number | null
  seed: number
  challengeTarget: number | null
  unlocked: Achievement[]
  onRestart: () => void
  onClose: () => void
  onBreathing: () => void
  onQuiz: (() => void) | null
}

export function ResultModal({
  status,
  loseReason,
  score,
  moves,
  seconds,
  mode,
  difficulty,
  matchedIds,
  totalPairs,
  isRecord,
  beaten,
  duelWinner,
  seed,
  challengeTarget,
  unlocked,
  onRestart,
  onClose,
  onBreathing,
  onQuiz,
}: ResultModalProps) {
  const { t, lang } = useI18n()
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'failed'>('idle')
  const [imageState, setImageState] = useState<'idle' | 'done' | 'failed'>('idle')
  const [challengeState, setChallengeState] = useState<'idle' | 'copied' | 'failed'>('idle')

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

  const pairs = totalPairs

  const title =
    status === 'won'
      ? t('result.win')
      : loseReason === 'time'
        ? t('result.loseTime')
        : t('result.loseLives')
  const subtitle =
    status === 'won'
      ? t('result.subWin', { pairs, time: formatTime(seconds), moves })
      : t('result.subLose', { found: matchedIds.length, pairs, time: formatTime(seconds) })

  const difficultyLabel = pick(
    DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? { es: difficulty, en: difficulty },
    lang,
  )

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('result.dialog')}>
      <div className="modal">
        {status === 'won' && <div className="confetti" aria-hidden="true" data-confetti />}
        {status === 'won' && isRecord && <span className="modal__badge">{t('result.newRecord')}</span>}
        {status === 'won' && beaten && <span className="modal__badge">{t('result.beaten')}</span>}
        <h2 className="modal__title">{title}</h2>
        <p className="modal__subtitle">{subtitle}</p>
        {mode === 'duelo' && duelWinner !== null && (
          <p className="modal__duel">{t('result.duelWinner', { n: duelWinner })}</p>
        )}
        {challengeTarget !== null && status === 'lost' && (
          <p className="modal__duel">
            {t('result.challengeLeft', { n: Math.max(0, challengeTarget - score) })}
          </p>
        )}

        <div className="modal__score">
          <span className="modal__score-value">{score}</span>
          <span className="modal__score-label">{t('result.points')}</span>
        </div>

        {unlocked.length > 0 && (
          <div className="unlocked" aria-label={t('result.unlockedAria')}>
            {unlocked.map((achievement) => (
              <span key={achievement.id} className="unlocked__badge">
                {achievement.icon} {pick(achievement.name, lang)}
              </span>
            ))}
          </div>
        )}

        <div className="modal__tips">
          <h3 className="modal__tips-title">{t('result.tips')}</h3>
          <ul className="tips-list">
            {tips.map((tip) => {
              const source = SOURCES[tip.source]
              return (
                <li key={tip.id} className="tips-list__item">
                  <span aria-hidden="true">{tip.icon}</span>
                  <span>
                    {itemTip(tip, lang)}{' '}
                    <a className="tips-list__source" href={source.href} target="_blank" rel="noreferrer">
                      {t('result.source', { source: pick(source.label, lang) })}
                    </a>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="modal__resources">
          <h3 className="modal__tips-title">{t('result.resources')}</h3>
          <ul className="resource-list">
            {RESOURCES.map((resource) => (
              <li key={resource.id} className="resource-list__item">
                <a href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <strong>{pick(resource.name, lang)}</strong>
                  <span>{pick(resource.detail, lang)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal__actions modal__actions--wrap">
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            {t('result.again')}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={async () => {
              const outcome = await shareScore(score, lang)
              if (outcome === 'failed') {
                setShareState('failed')
                return
              }
              setShareState(outcome)
              window.setTimeout(() => setShareState('idle'), 2500)
            }}
          >
            {shareState === 'copied'
              ? t('result.shareCopied')
              : shareState === 'shared'
                ? t('result.shareShared')
                : shareState === 'failed'
                  ? t('result.shareFailed')
                  : t('result.share')}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={async () => {
              const outcome = await shareResultImage({ score, difficulty: difficultyLabel, lang })
              if (outcome === 'failed') {
                setImageState('failed')
                return
              }
              setImageState('done')
              window.setTimeout(() => setImageState('idle'), 2500)
            }}
          >
            {imageState === 'done'
              ? t('result.shareCopied')
              : imageState === 'failed'
                ? t('result.shareFailed')
                : t('result.shareImage')}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={async () => {
              const outcome = await shareChallenge(seed, score, lang)
              if (outcome === 'failed') {
                setChallengeState('failed')
                return
              }
              setChallengeState('copied')
              window.setTimeout(() => setChallengeState('idle'), 2500)
            }}
            title={buildChallengeUrl(seed, score)}
          >
            {challengeState === 'copied'
              ? t('result.challengeCopied')
              : challengeState === 'failed'
                ? t('result.shareFailed')
                : t('result.challenge')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBreathing}>
            {t('result.breathing')}
          </button>
          {status === 'won' && onQuiz && (
            <button type="button" className="btn btn--ghost" onClick={onQuiz}>
              {t('result.quiz')}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('result.board')}
          </button>
        </div>
      </div>
    </div>
  )
}

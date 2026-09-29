import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context'

type BreathingModalProps = {
  onClose: () => void
}

const PHASES = [
  { key: 'breath.inhale', seconds: 4, className: 'breath__circle--in' },
  { key: 'breath.hold', seconds: 7, className: 'breath__circle--hold' },
  { key: 'breath.exhale', seconds: 8, className: 'breath__circle--out' },
]

export function BreathingModal({ onClose }: BreathingModalProps) {
  const { t } = useI18n()
  const [phase, setPhase] = useState(0)
  const [left, setLeft] = useState(PHASES[0].seconds)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((prev) => {
        if (prev > 1) return prev - 1
        setPhase((p) => {
          const next = (p + 1) % PHASES.length
          setLeft(PHASES[next].seconds)
          if (next === 0) setCycles((c) => c + 1)
          return next
        })
        return 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const current = PHASES[phase]

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('aria.breathing')}>
      <div className="modal">
        <h2 className="modal__title">{t('breath.title')}</h2>
        <p className="modal__subtitle">{t('breath.subtitle')}</p>

        <div className="breath">
          <span className={`breath__circle ${current.className}`} aria-hidden="true" />
          <span className="breath__phase" role="status" aria-live="polite">
            {t(current.key)}
          </span>
          <span className="breath__count" aria-hidden="true">
            {left}
          </span>
        </div>

        <p className="breath__cycles">{t('breath.cycles', { n: cycles })}</p>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {t('breath.done')}
          </button>
        </div>
      </div>
    </div>
  )
}

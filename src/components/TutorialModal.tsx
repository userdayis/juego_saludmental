import { useState } from 'react'
import { useI18n } from '../i18n/context'

type TutorialModalProps = {
  onClose: () => void
}

const STEPS = [
  { iconKey: 'tutorial.icon1', titleKey: 'tutorial.step1', textKey: 'tutorial.step1Text' },
  { iconKey: 'tutorial.icon2', titleKey: 'tutorial.step2', textKey: 'tutorial.step2Text' },
  { iconKey: 'tutorial.icon3', titleKey: 'tutorial.step3', textKey: 'tutorial.step3Text' },
]

export function TutorialModal({ onClose }: TutorialModalProps) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('aria.tutorial')}>
      <div className="modal">
        <span className="tutorial__icon" aria-hidden="true">
          {t(current.iconKey)}
        </span>
        <h2 className="modal__title">{t(current.titleKey)}</h2>
        <p className="modal__subtitle">{t(current.textKey)}</p>

        <div className="tutorial__dots" role="tablist" aria-label={t('tutorial.dots')}>
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`tutorial__dot ${index === step ? 'tutorial__dot--active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="modal__actions">
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={() => setStep((s) => s - 1)}>
              {t('tutorial.back')}
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => (last ? onClose() : setStep((s) => s + 1))}
          >
            {last ? t('tutorial.done') : t('tutorial.next')}
          </button>
        </div>
      </div>
    </div>
  )
}

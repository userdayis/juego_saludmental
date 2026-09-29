import { useEffect } from 'react'
import { RESOURCES } from '../data/resources'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type FirstAidModalProps = {
  onClose: () => void
}

const STEPS = ['aid.step1', 'aid.step2', 'aid.step3', 'aid.step4']

export function FirstAidModal({ onClose }: FirstAidModalProps) {
  const { t, lang } = useI18n()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('aria.firstAid')}>
      <div className="modal">
        <h2 className="modal__title">{t('aid.title')}</h2>
        <p className="modal__subtitle">{t('aid.intro')}</p>

        <ol className="aid-list">
          {STEPS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>

        <p className="aid-warning">{t('aid.warning')}</p>

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

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {t('stats.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

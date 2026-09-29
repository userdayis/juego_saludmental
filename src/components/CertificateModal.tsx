import { useState } from 'react'
import type { Stats } from '../hooks/useStats'
import { levelFor } from '../hooks/useStats'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type CertificateModalProps = {
  stats: Stats
  onClose: () => void
}

export function CertificateModal({ stats, onClose }: CertificateModalProps) {
  const { t, lang } = useI18n()
  const [name, setName] = useState('')
  const level = levelFor(stats)

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('certificate.title')}>
      <div className="certificate" id="certificate">
        <p className="certificate__org">SENA · Servicio Nacional de Aprendizaje</p>
        <h2 className="certificate__title">{t('certificate.title')}</h2>
        <p className="certificate__lead">{t('certificate.lead')}</p>
        <input
          className="certificate__name"
          type="text"
          value={name}
          maxLength={48}
          placeholder={t('certificate.namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
          aria-label={t('certificate.namePlaceholder')}
        />
        <p className="certificate__text">
          {t('certificate.text', { level: pick(level.name, lang), stages: stats.stagesDone })}
        </p>
        <p className="certificate__date">{new Date().toLocaleDateString(lang)}</p>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={() => window.print()}>
            {t('certificate.print')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('stats.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

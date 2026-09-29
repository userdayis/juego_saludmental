import { STAGES, type Stage } from '../data/campaign'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type CampaignModalProps = {
  stagesDone: number
  onPlay: (stage: Stage) => void
  onClose: () => void
}

export function CampaignModal({ stagesDone, onPlay, onClose }: CampaignModalProps) {
  const { t, lang } = useI18n()

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('aria.campaign')}>
      <div className="modal modal--wide">
        <h2 className="modal__title">{t('campaign.title')}</h2>
        <p className="modal__subtitle">{t('campaign.intro')}</p>

        <ol className="stages">
          {STAGES.map((stage) => {
            const locked = stage.n > stagesDone + 1
            const done = stage.n <= stagesDone
            return (
              <li key={stage.n} className={`stage ${locked ? 'stage--locked' : ''}`}>
                <button
                  type="button"
                  className="stage__btn"
                  disabled={locked}
                  onClick={() => onPlay(stage)}
                >
                  <span className="stage__n">{done ? '✅' : locked ? '🔒' : stage.n}</span>
                  <span className="stage__text">
                    <strong>{pick(stage.title, lang)}</strong>
                    <span>{pick(stage.hint, lang)}</span>
                  </span>
                  <span className="stage__pairs">{stage.itemIds.length / 2} {t('campaign.pairs')}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {t('stats.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

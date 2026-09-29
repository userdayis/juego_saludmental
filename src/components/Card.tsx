import { memo } from 'react'
import { useI18n } from '../i18n/context'

type CardProps = {
  itemId: string
  icon: string
  label: string
  flipped: boolean
  matched: boolean
  hinted: boolean
  locked: boolean
  onClick: () => void
}

function CardComponent({ itemId, icon, label, flipped, matched, hinted, locked, onClick }: CardProps) {
  const { t } = useI18n()
  const visible = flipped || matched
  const blocked = locked || matched
  return (
    <button
      type="button"
      className={`card ${visible ? 'card--visible' : ''} ${matched ? 'card--matched' : ''} ${
        hinted ? 'card--hint' : ''
      }`}
      onClick={() => {
        if (blocked) return
        onClick()
      }}
      aria-disabled={blocked}
      aria-label={visible ? label : t('aria.cardDown')}
      aria-pressed={visible}
      data-item={itemId}
    >
      <span className="card__inner">
        <span className="card__face card__back" aria-hidden="true">
          <span className="card__mark">?</span>
        </span>
        <span className="card__face card__front">
          <span className="card__emoji" aria-hidden="true">
            {icon}
          </span>
          <span className="card__label">{label}</span>
        </span>
      </span>
    </button>
  )
}

export const Card = memo(CardComponent)

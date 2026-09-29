import { memo } from 'react'

type CardProps = {
  icon: string
  label: string
  flipped: boolean
  matched: boolean
  disabled: boolean
  onClick: () => void
}

function CardComponent({ icon, label, flipped, matched, disabled, onClick }: CardProps) {
  const visible = flipped || matched
  return (
    <button
      type="button"
      className={`card ${visible ? 'card--visible' : ''} ${matched ? 'card--matched' : ''}`}
      onClick={onClick}
      disabled={disabled || matched}
      aria-label={visible ? label : 'Carta boca abajo'}
      aria-pressed={visible}
    >
      <span className="card__inner">
        <span className="card__face card__back" aria-hidden="true">
          <span className="card__mark">?</span>
        </span>
        <span className="card__face card__front">
          <span className="card__icon" aria-hidden="true">
            {icon}
          </span>
          <span className="card__label">{label}</span>
        </span>
      </span>
    </button>
  )
}

export const Card = memo(CardComponent)

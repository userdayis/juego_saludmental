import { memo } from 'react'

type CardProps = {
  icon: string
  label: string
  flipped: boolean
  matched: boolean
  locked: boolean
  onClick: () => void
}

function CardComponent({ icon, label, flipped, matched, locked, onClick }: CardProps) {
  const visible = flipped || matched
  const blocked = locked || matched
  return (
    <button
      type="button"
      className={`card ${visible ? 'card--visible' : ''} ${matched ? 'card--matched' : ''}`}
      onClick={() => {
        if (blocked) return
        onClick()
      }}
      aria-disabled={blocked}
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

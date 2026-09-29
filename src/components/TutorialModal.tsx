import { useState } from 'react'

type TutorialModalProps = {
  onClose: () => void
}

const STEPS = [
  {
    icon: '🃏',
    title: 'Voltea dos cartas',
    text: 'Toca cualquier carta boca abajo y luego otra. Si son la pareja, se quedan destapadas.',
  },
  {
    icon: '🧠',
    title: 'Encuentra todos los pares',
    text: 'Cada intento fallido suma puntos de menos. En modo Vidas, cada fallo te cuesta una vida.',
  },
  {
    icon: '🌿',
    title: 'Llévate un tip',
    text: 'Al terminar ganas consejos de bienestar, puntos y quizás un logro nuevo.',
  },
]

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cómo se juega">
      <div className="modal">
        <span className="tutorial__icon" aria-hidden="true">
          {current.icon}
        </span>
        <h2 className="modal__title">{current.title}</h2>
        <p className="modal__subtitle">{current.text}</p>

        <div className="tutorial__dots" role="tablist" aria-label="Pasos">
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
              Atrás
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => (last ? onClose() : setStep((s) => s + 1))}
          >
            {last ? '¡Entendido!' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}

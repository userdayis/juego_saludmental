import { useEffect, useState } from 'react'
import type { QuizQuestion } from '../data/quiz'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type QuizModalProps = {
  questions: QuizQuestion[]
  onClose: (correct: number) => void
}

export function QuizModal({ questions, onClose }: QuizModalProps) {
  const { t, lang } = useI18n()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const finished = index >= questions.length
  const current = questions[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(correct)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, correct])

  if (finished) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Quiz">
        <div className="modal">
          <h2 className="modal__title">{correct === questions.length ? '🎉' : '📝'}</h2>
          <p className="modal__subtitle">{t('quiz.result', { correct, total: questions.length })}</p>
          <div className="modal__actions">
            <button type="button" className="btn btn--primary" onClick={() => onClose(correct)}>
              {t('stats.close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Quiz">
      <div className="modal">
        <p className="quiz__progress">{t('quiz.progress', { n: index + 1, total: questions.length })}</p>
        <h2 className="modal__title quiz__question">{pick(current.q, lang)}</h2>

        <div className="quiz__options">
          {current.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              className={`quiz__option ${selected === optionIndex ? 'quiz__option--selected' : ''}`}
              disabled={selected !== null}
              onClick={() => setSelected(optionIndex)}
            >
              {pick(option, lang)}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="modal__actions">
            <span
              className={`quiz__feedback ${
                selected === current.answer ? 'quiz__feedback--ok' : 'quiz__feedback--bad'
              }`}
            >
              {selected === current.answer
                ? t('quiz.correct')
                : t('quiz.was', { answer: pick(current.options[current.answer], lang) })}
            </span>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                if (selected === current.answer) setCorrect((c) => c + 1)
                setSelected(null)
                setIndex((i) => i + 1)
              }}
            >
              {index === questions.length - 1 ? t('quiz.finish') : t('tutorial.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

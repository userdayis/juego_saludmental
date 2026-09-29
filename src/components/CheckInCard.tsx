import { lastWeek, useCheckin, type Mood } from '../hooks/useCheckin'
import { useI18n } from '../i18n/context'

type CheckInCardProps = {
  onChecked: () => void
}

const MOODS: { value: Mood; icon: string; key: string }[] = [
  { value: 3, icon: '😌', key: 'mood.great' },
  { value: 2, icon: '😐', key: 'mood.ok' },
  { value: 1, icon: '😞', key: 'mood.low' },
]

export function CheckInCard({ onChecked }: CheckInCardProps) {
  const { t } = useI18n()
  const { mood, save } = useCheckin()
  const week = lastWeek()

  return (
    <section className="checkin" aria-label={t('aria.checkIn')}>
      <h3 className="checkin__title">{t('checkin.title')}</h3>
      <div className="checkin__moods">
        {MOODS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`checkin__mood ${mood === option.value ? 'checkin__mood--active' : ''}`}
            disabled={mood !== null}
            onClick={() => {
              save(option.value)
              onChecked()
            }}
            aria-label={t(option.key)}
            aria-pressed={mood === option.value}
          >
            <span aria-hidden="true">{option.icon}</span>
          </button>
        ))}
      </div>
      {mood !== null && <p className="checkin__done">{t('checkin.doneToday')}</p>}

      <div className="checkin__week" role="img" aria-label={t('checkin.week')}>
        {week.map((day) => (
          <span key={day.date} className="checkin__day" title={day.date}>
            <span aria-hidden="true">
              {day.mood === 3 ? '😌' : day.mood === 2 ? '😐' : day.mood === 1 ? '😞' : '·'}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}

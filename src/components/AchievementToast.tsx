import { useEffect } from 'react'
import type { Achievement } from '../data/achievements'
import { useI18n } from '../i18n/context'
import { pick } from '../i18n'

type AchievementToastProps = {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const { t, lang } = useI18n()

  useEffect(() => {
    const id = window.setTimeout(onDismiss, 3000)
    return () => window.clearTimeout(id)
  }, [achievement.id, onDismiss])

  return (
    <div className="toast" role="status">
      <span className="toast__icon" aria-hidden="true">
        {achievement.icon}
      </span>
      <span>
        <strong>{t('toast.unlocked')}</strong>
        <span className="toast__name">
          {pick(achievement.name, lang)} · {pick(achievement.description, lang)}
        </span>
      </span>
    </div>
  )
}

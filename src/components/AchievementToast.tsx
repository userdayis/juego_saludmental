import { useEffect } from 'react'
import type { Achievement } from '../data/achievements'

type AchievementToastProps = {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
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
        <strong>¡Logro desbloqueado!</strong>
        <span className="toast__name">
          {achievement.name} · {achievement.description}
        </span>
      </span>
    </div>
  )
}

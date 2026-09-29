import { useCallback, useEffect, useState } from 'react'

export type HighScore = {
  score: number
  seconds: number
  moves: number
}

const KEY = 'salud-mental:highscore'

function read(): HighScore | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HighScore
    if (typeof parsed.score !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function useHighScore() {
  const [highScore, setHighScore] = useState<HighScore | null>(null)

  useEffect(() => {
    setHighScore(read())
  }, [])

  const saveIfBetter = useCallback((result: HighScore): boolean => {
    const current = read()
    if (current && current.score >= result.score) return false
    try {
      localStorage.setItem(KEY, JSON.stringify(result))
    } catch {
      return false
    }
    setHighScore(result)
    return true
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setHighScore(null)
  }, [])

  return { highScore, saveIfBetter, reset }
}

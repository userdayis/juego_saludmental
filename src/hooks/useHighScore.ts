import { useCallback, useEffect, useState } from 'react'
import type { Difficulty, Mode } from '../data/cards'

export type HighScore = {
  score: number
  seconds: number
  moves: number
}

export type Records = Record<string, HighScore>

const KEY = 'salud-mental:records'
const LEGACY_KEY = 'salud-mental:highscore'

export function recordKey(difficulty: Difficulty, mode: Mode): string {
  return `${difficulty}:${mode}`
}

function isHighScore(value: unknown): value is HighScore {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as HighScore).score === 'number' &&
    typeof (value as HighScore).seconds === 'number'
  )
}

function migrateLegacy(): Records | null {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (!legacy) return null
    const parsed: unknown = JSON.parse(legacy)
    if (!isHighScore(parsed)) return null
    localStorage.setItem(KEY, JSON.stringify({ 'normal:clasico': parsed }))
    localStorage.removeItem(LEGACY_KEY)
    return { 'normal:clasico': parsed }
  } catch {
    return null
  }
}

function read(): Records {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) return parsed as Records
    }
  } catch {
    /* almacenamiento corrupto */
  }
  return migrateLegacy() ?? {}
}

export function useHighScore() {
  const [records, setRecords] = useState<Records>({})

  useEffect(() => {
    setRecords(read())
  }, [])

  const saveIfBetter = useCallback((difficulty: Difficulty, mode: Mode, result: HighScore): boolean => {
    const current = read()
    const key = recordKey(difficulty, mode)
    const best = current[key]
    if (best && best.score >= result.score) return false
    const next: Records = { ...current, [key]: result }
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      return false
    }
    setRecords(next)
    return true
  }, [])

  const best = useCallback(
    (difficulty: Difficulty, mode: Mode): HighScore | null => records[recordKey(difficulty, mode)] ?? null,
    [records],
  )

  return { records, best, saveIfBetter }
}

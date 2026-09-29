import { useCallback, useState } from 'react'
import { todayISO, toISODate } from '../utils/format'

const KEY = 'salud-mental:checkin'

export type Mood = 1 | 2 | 3
export type CheckinEntry = { date: string; mood: Mood }

function read(): CheckinEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is CheckinEntry =>
        typeof entry === 'object' && entry !== null && typeof (entry as CheckinEntry).date === 'string',
    )
  } catch {
    return []
  }
}

function write(entries: CheckinEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-60)))
  } catch {
    /* almacenamiento no disponible */
  }
}

export function lastWeek(): { date: string; mood: Mood | null }[] {
  const entries = read()
  const days: { date: string; mood: Mood | null }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const date = toISODate(d)
    const entry = entries.find((e) => e.date === date)
    days.push({ date, mood: entry?.mood ?? null })
  }
  return days
}

export function todayMood(): Mood | null {
  return read().find((entry) => entry.date === todayISO())?.mood ?? null
}

export function useCheckin() {
  const [mood, setMood] = useState<Mood | null>(() => todayMood())

  const save = useCallback((value: Mood): boolean => {
    const today = todayISO()
    const entries = read().filter((entry) => entry.date !== today)
    entries.push({ date: today, mood: value })
    write(entries)
    setMood(value)
    return true
  }, [])

  return { mood, save }
}

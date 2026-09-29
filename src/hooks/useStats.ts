import { useCallback, useEffect, useState } from 'react'
import { ACHIEVEMENTS, type Achievement, type GameResultContext } from '../data/achievements'
import type { Difficulty, Mode } from '../data/cards'
import { toISODate, todayISO } from '../utils/format'

export type HistoryEntry = {
  date: string
  difficulty: Difficulty
  mode: Mode
  score: number
  won: boolean
  seconds: number
  pairs: number
}

export type Stats = {
  games: number
  wins: number
  losses: number
  streak: number
  bestStreak: number
  pairs: number
  perfect: number
  bestTime: number | null
  achievements: string[]
  daysPlayed: string[]
  history: HistoryEntry[]
  quizCorrect: number
  stagesDone: number
  checkins: number
}

export type ResultInput = {
  won: boolean
  moves: number
  matchedPairs: number
  totalPairs: number
  seconds: number
  score: number
  difficulty: Difficulty
  mode: Mode
  livesLeft: number | null
  livesStart: number | null
  hintsUsed: number
  wildsUsed: number
  duelWon: boolean
}

export type ProgressEvent =
  | { kind: 'quiz'; correct: number }
  | { kind: 'stage'; stage: number }
  | { kind: 'checkin' }

export type RecordOutcome = {
  stats: Stats
  unlocked: Achievement[]
}

export type Level = { xp: number; name: { es: string; en: string } }

const KEY = 'salud-mental:stats'
const HISTORY_LIMIT = 10

export const EMPTY_STATS: Stats = {
  games: 0,
  wins: 0,
  losses: 0,
  streak: 0,
  bestStreak: 0,
  pairs: 0,
  perfect: 0,
  bestTime: null,
  achievements: [],
  daysPlayed: [],
  history: [],
  quizCorrect: 0,
  stagesDone: 0,
  checkins: 0,
}

function isStats(value: unknown): value is Partial<Stats> {
  if (typeof value !== 'object' || value === null) return false
  const stats = value as Partial<Stats>
  return typeof stats.games === 'number' && Array.isArray(stats.achievements)
}

function read(): Stats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_STATS
    const parsed: unknown = JSON.parse(raw)
    if (!isStats(parsed)) return EMPTY_STATS
    return {
      ...EMPTY_STATS,
      ...parsed,
      daysPlayed: parsed.daysPlayed ?? [],
      history: parsed.history ?? [],
    }
  } catch {
    return EMPTY_STATS
  }
}

function write(stats: Stats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    /* almacenamiento no disponible */
  }
}

export function daysStreak(daysPlayed: string[]): number {
  const set = new Set(daysPlayed)
  const cursor = new Date()
  if (!set.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (set.has(toISODate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function levelFor(stats: Stats): Level {
  const xp =
    stats.wins * 100 +
    stats.pairs * 10 +
    stats.games * 25 +
    stats.stagesDone * 150 +
    stats.achievements.length * 75
  const levels: { min: number; name: { es: string; en: string } }[] = [
    { min: 0, name: { es: 'Aprendiz', en: 'Apprentice' } },
    { min: 400, name: { es: 'Practicante', en: 'Practitioner' } },
    { min: 1000, name: { es: 'Mentor', en: 'Mentor' } },
    { min: 2000, name: { es: 'Experto en bienestar', en: 'Wellness expert' } },
  ]
  let current = levels[0]
  for (const level of levels) {
    if (xp >= level.min) current = level
  }
  return { xp, name: current.name }
}

export type Goal = { id: 'Games' | 'Pairs' | 'Wins'; target: number; done: number }

export const WEEKLY_GOALS: Record<Goal['id'], number> = { Games: 3, Pairs: 50, Wins: 1 }

export function weeklyProgress(stats: Stats): Goal[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  const inWeek = stats.history.filter((entry) => {
    const [y, m, d] = entry.date.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date >= monday
  })
  return [
    { id: 'Games', target: WEEKLY_GOALS.Games, done: inWeek.length },
    {
      id: 'Pairs',
      target: WEEKLY_GOALS.Pairs,
      done: inWeek.reduce((sum, entry) => sum + entry.pairs, 0),
    },
    { id: 'Wins', target: WEEKLY_GOALS.Wins, done: inWeek.filter((entry) => entry.won).length },
  ]
}

function buildContext(stats: Stats, result: Partial<ResultInput> = {}): GameResultContext {
  return {
    won: false,
    moves: 0,
    matchedPairs: 0,
    totalPairs: 0,
    seconds: 0,
    difficulty: 'normal',
    mode: 'clasico',
    livesLeft: null,
    livesStart: null,
    streak: stats.streak,
    games: stats.games,
    pairsTotal: stats.pairs,
    hintsUsed: 0,
    wildsUsed: 0,
    duelWon: false,
    quizCorrect: stats.quizCorrect,
    stageCompleted: stats.stagesDone,
    daysStreak: daysStreak(stats.daysPlayed),
    checkins: stats.checkins,
    ...result,
  }
}

function evaluate(stats: Stats, context: GameResultContext): RecordOutcome {
  const unlocked = ACHIEVEMENTS.filter(
    (achievement) => !stats.achievements.includes(achievement.id) && achievement.check(context),
  )
  if (unlocked.length === 0) return { stats, unlocked }
  return {
    stats: { ...stats, achievements: [...stats.achievements, ...unlocked.map((a) => a.id)] },
    unlocked,
  }
}

export function applyResult(current: Stats, result: ResultInput): RecordOutcome {
  const streak = result.won ? current.streak + 1 : 0
  const perfect = current.perfect + (result.won && result.moves === result.totalPairs && result.wildsUsed === 0 ? 1 : 0)
  const bestTime =
    result.won && (current.bestTime === null || result.seconds < current.bestTime)
      ? result.seconds
      : current.bestTime
  const today = todayISO()
  const daysPlayed = current.daysPlayed.includes(today)
    ? current.daysPlayed
    : [...current.daysPlayed, today].sort()
  const history = [
    {
      date: today,
      difficulty: result.difficulty,
      mode: result.mode,
      score: result.score,
      won: result.won,
      seconds: result.seconds,
      pairs: result.matchedPairs,
    },
    ...current.history,
  ].slice(0, HISTORY_LIMIT)

  const stats: Stats = {
    ...current,
    games: current.games + 1,
    wins: current.wins + (result.won ? 1 : 0),
    losses: current.losses + (result.won ? 0 : 1),
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    pairs: current.pairs + result.matchedPairs,
    perfect,
    bestTime,
    daysPlayed,
    history,
  }

  return evaluate(stats, buildContext(stats, result))
}

export function applyEvent(current: Stats, event: ProgressEvent): RecordOutcome {
  let stats: Stats = current
  if (event.kind === 'quiz') {
    stats = { ...current, quizCorrect: Math.max(current.quizCorrect, event.correct) }
  } else if (event.kind === 'stage') {
    stats = { ...current, stagesDone: Math.max(current.stagesDone, event.stage) }
  } else {
    stats = { ...current, checkins: current.checkins + 1 }
  }
  return evaluate(stats, buildContext(stats))
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)

  useEffect(() => {
    setStats(read())
  }, [])

  const refresh = useCallback(() => {
    setStats(read())
  }, [])

  const recordResult = useCallback((result: ResultInput): RecordOutcome => {
    const outcome = applyResult(read(), result)
    write(outcome.stats)
    setStats(outcome.stats)
    return outcome
  }, [])

  const recordEvent = useCallback((event: ProgressEvent): RecordOutcome => {
    const outcome = applyEvent(read(), event)
    write(outcome.stats)
    setStats(outcome.stats)
    return outcome
  }, [])

  return { stats, recordResult, recordEvent, refresh }
}

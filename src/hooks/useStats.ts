import { useCallback, useEffect, useState } from 'react'
import { ACHIEVEMENTS, type Achievement, type GameResultContext } from '../data/achievements'
import type { Difficulty, Mode } from '../data/cards'

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
}

export type ResultInput = {
  won: boolean
  moves: number
  matchedPairs: number
  totalPairs: number
  seconds: number
  difficulty: Difficulty
  mode: Mode
  livesLeft: number | null
  livesStart: number | null
}

export type RecordOutcome = {
  stats: Stats
  unlocked: Achievement[]
}

const KEY = 'salud-mental:stats'

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
}

function isStats(value: unknown): value is Stats {
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
    return { ...EMPTY_STATS, ...parsed }
  } catch {
    return EMPTY_STATS
  }
}

export function applyResult(current: Stats, result: ResultInput): RecordOutcome {
  const streak = result.won ? current.streak + 1 : 0
  const perfect = current.perfect + (result.won && result.moves === result.totalPairs ? 1 : 0)
  const bestTime =
    result.won && (current.bestTime === null || result.seconds < current.bestTime)
      ? result.seconds
      : current.bestTime

  const stats: Stats = {
    games: current.games + 1,
    wins: current.wins + (result.won ? 1 : 0),
    losses: current.losses + (result.won ? 0 : 1),
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    pairs: current.pairs + result.matchedPairs,
    perfect,
    bestTime,
    achievements: [...current.achievements],
  }

  const context: GameResultContext = { ...result, streak, games: stats.games, pairsTotal: stats.pairs }
  const unlocked = ACHIEVEMENTS.filter(
    (achievement) => !stats.achievements.includes(achievement.id) && achievement.check(context),
  )
  stats.achievements.push(...unlocked.map((achievement) => achievement.id))

  return { stats, unlocked }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)

  useEffect(() => {
    setStats(read())
  }, [])

  const recordResult = useCallback((result: ResultInput): RecordOutcome => {
    const current = read()
    const outcome = applyResult(current, result)
    try {
      localStorage.setItem(KEY, JSON.stringify(outcome.stats))
    } catch {
      return outcome
    }
    setStats(outcome.stats)
    return outcome
  }, [])

  return { stats, recordResult }
}

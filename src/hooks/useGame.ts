import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CARD_ITEMS,
  HINTS_BY_DIFFICULTY,
  LIVES_BY_DIFFICULTY,
  PAIRS_BY_DIFFICULTY,
  TIME_LIMITS,
  type Difficulty,
  type Mode,
} from '../data/cards'
import { mulberry32, randomSeed, shuffleWith } from '../utils/seed'
import { playSound, vibrate } from '../utils/sound'

export type DeckCard = { key: string; itemId: string }

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'
export type LoseReason = 'time' | 'lives' | null

export type GameState = {
  deck: DeckCard[]
  seed: number
  flipped: number[]
  hintOpen: boolean
  hintsLeft: number
  hintsUsed: number
  wildsLeft: number
  wildsUsed: number
  streak: number
  duelStreaks: [number, number]
  duelScores: [number, number]
  turn: 0 | 1
  duelWinner: number | null
  matched: Set<string>
  moves: number
  score: number
  seconds: number
  timeLimit: number
  lives: number | null
  loseReason: LoseReason
  status: GameStatus
  difficulty: Difficulty
  mode: Mode
}

const BASE_MATCH_POINTS = 100
const FAIL_PENALTY = 10
const CLASSIC_TIME_BONUS = 500
const TIME_STEP_SECONDS = 10
const TIME_STEP_PENALTY = 5
const CLOCK_POINTS_PER_SECOND = 10
const LIFE_POINTS = 50
export const HINT_COST = 150
export const WILD_COST = 200
const MISMATCH_DELAY_MS = 800
const HINT_DELAY_MS = 1500

export function multiplierFor(streak: number): number {
  if (streak >= 5) return 3
  if (streak >= 2) return 2
  return 1
}

export function timeBonus(mode: Mode, seconds: number, timeLimit: number): number {
  if (mode === 'reloj') return Math.max(0, timeLimit - seconds) * CLOCK_POINTS_PER_SECOND
  return Math.max(0, CLASSIC_TIME_BONUS - Math.floor(seconds / TIME_STEP_SECONDS) * TIME_STEP_PENALTY)
}

export function finalBonus(state: Pick<GameState, 'mode' | 'seconds' | 'timeLimit' | 'lives'>): number {
  let bonus = timeBonus(state.mode, state.seconds, state.timeLimit)
  if (state.mode === 'vidas') bonus += Math.max(0, state.lives ?? 0) * LIFE_POINTS
  return bonus
}

function buildDeck(pairs: number, seed: number, itemIds?: string[]): DeckCard[] {
  const rng = mulberry32(seed)
  const base = itemIds
    ? itemIds
        .map((id) => CARD_ITEMS.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : CARD_ITEMS
  const items = shuffleWith(base, rng).slice(0, pairs)
  const deck = items.flatMap((item) => [
    { key: `${item.id}-a`, itemId: item.id },
    { key: `${item.id}-b`, itemId: item.id },
  ])
  return shuffleWith(deck, rng)
}

const INITIAL_STATE: GameState = {
  deck: [],
  seed: 0,
  flipped: [],
  hintOpen: false,
  hintsLeft: 0,
  hintsUsed: 0,
  wildsLeft: 0,
  wildsUsed: 0,
  streak: 0,
  duelStreaks: [0, 0],
  duelScores: [0, 0],
  turn: 0,
  duelWinner: null,
  matched: new Set<string>(),
  moves: 0,
  score: 0,
  seconds: 0,
  timeLimit: 0,
  lives: null,
  loseReason: null,
  status: 'idle',
  difficulty: 'normal',
  mode: 'clasico',
}

const SESSION_KEY = 'salud-mental:session'
const SESSION_V = 2

type SerializedSession = Omit<GameState, 'matched'> & { matched: string[]; v: number }

function serialize(state: GameState): SerializedSession {
  return { ...state, matched: [...state.matched], v: SESSION_V }
}

function isSession(value: unknown): value is SerializedSession {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Partial<SerializedSession>
  return (
    s.v === SESSION_V &&
    Array.isArray(s.deck) &&
    s.deck.length > 0 &&
    Array.isArray(s.flipped) &&
    Array.isArray(s.matched) &&
    s.status === 'playing' &&
    typeof s.seed === 'number' &&
    typeof s.mode === 'string' &&
    typeof s.difficulty === 'string'
  )
}

export function loadSession(): GameState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isSession(parsed)) return null
    const { v: _v, matched, ...rest } = parsed
    void _v
    return { ...rest, matched: new Set(matched), status: 'playing' }
  } catch {
    return null
  }
}

function saveSession(state: GameState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(serialize(state)))
  } catch {
    /* almacenamiento no disponible */
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback((mode: Mode, difficulty: Difficulty, seed?: number, itemIds?: string[]) => {
    const finalSeed = seed ?? randomSeed()
    const pairs = itemIds && itemIds.length > 0 ? itemIds.length / 2 : PAIRS_BY_DIFFICULTY[difficulty]
    setState({
      deck: buildDeck(pairs, finalSeed, itemIds),
      seed: finalSeed,
      flipped: [],
      hintOpen: false,
      hintsLeft: HINTS_BY_DIFFICULTY[difficulty],
      hintsUsed: 0,
      wildsLeft: 1,
      wildsUsed: 0,
      streak: 0,
      duelStreaks: [0, 0],
      duelScores: [0, 0],
      turn: 0,
      duelWinner: null,
      matched: new Set<string>(),
      moves: 0,
      score: 0,
      seconds: 0,
      timeLimit: mode === 'reloj' ? TIME_LIMITS[difficulty] : 0,
      lives: mode === 'vidas' ? LIVES_BY_DIFFICULTY[difficulty] : null,
      loseReason: null,
      status: 'playing',
      difficulty,
      mode,
    })
  }, [])

  const resumeGame = useCallback((session: GameState) => {
    setState(session)
  }, [])

  const flipCard = useCallback((index: number) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      if (prev.flipped.length >= 2) return prev
      if (prev.flipped.includes(index)) return prev
      const card = prev.deck[index]
      if (prev.matched.has(card.itemId)) return prev

      const flipped = [...prev.flipped, index]
      if (flipped.length < 2) return { ...prev, flipped }

      const moves = prev.moves + 1
      const [first, second] = flipped
      const isMatch = prev.deck[first].itemId === prev.deck[second].itemId

      if (isMatch) {
        const streak = prev.mode === 'duelo' ? prev.duelStreaks[prev.turn] + 1 : prev.streak + 1
        const points = prev.mode === 'zen' ? BASE_MATCH_POINTS : BASE_MATCH_POINTS * multiplierFor(streak)
        const matched = new Set(prev.matched).add(prev.deck[first].itemId)
        const duelStreaks: [number, number] =
          prev.mode === 'duelo'
            ? prev.turn === 0
              ? [streak, prev.duelStreaks[1]]
              : [prev.duelStreaks[0], streak]
            : prev.duelStreaks
        const duelScores: [number, number] =
          prev.mode === 'duelo'
            ? prev.turn === 0
              ? [prev.duelScores[0] + points, prev.duelScores[1]]
              : [prev.duelScores[0], prev.duelScores[1] + points]
            : prev.duelScores
        const totalPairs = prev.deck.length / 2
        const won = matched.size === totalPairs
        const bonus = won ? finalBonus(prev) : 0
        const score = prev.score + points + bonus
        const duelWinner =
          won && prev.mode === 'duelo' ? (duelScores[0] >= duelScores[1] ? 1 : 2) : prev.duelWinner

        return {
          ...prev,
          flipped: [],
          hintOpen: false,
          moves,
          matched,
          streak,
          duelStreaks,
          duelScores,
          score,
          status: won ? 'won' : 'playing',
          duelWinner,
        }
      }

      const penalty = prev.mode === 'zen' ? 0 : FAIL_PENALTY
      const score = Math.max(0, prev.score - penalty)
      const turn: 0 | 1 = prev.mode === 'duelo' ? ((1 - prev.turn) as 0 | 1) : prev.turn
      const duelStreaks: [number, number] =
        prev.mode === 'duelo'
          ? prev.turn === 0
            ? [0, prev.duelStreaks[1]]
            : [prev.duelStreaks[0], 0]
          : prev.duelStreaks

      return { ...prev, flipped, moves, score, streak: 0, duelStreaks, turn }
    })
  }, [])

  const useHint = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      if (prev.flipped.length > 0 || prev.hintOpen) return prev
      if (prev.hintsLeft <= 0) return prev

      const groups = new Map<string, number[]>()
      prev.deck.forEach((card, index) => {
        if (prev.matched.has(card.itemId)) return
        const list = groups.get(card.itemId) ?? []
        list.push(index)
        groups.set(card.itemId, list)
      })
      const candidates = [...groups.values()].filter((indexes) => indexes.length === 2)
      if (candidates.length === 0) return prev

      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      const hintsUsed = prev.hintsUsed + 1
      const cost = prev.mode === 'zen' ? 0 : HINT_COST

      return {
        ...prev,
        flipped: pick,
        hintOpen: true,
        hintsUsed,
        hintsLeft: prev.hintsLeft - 1,
        score: Math.max(0, prev.score - cost),
      }
    })
  }, [])

  const useWild = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      if (prev.flipped.length > 0 || prev.hintOpen) return prev
      if (prev.wildsLeft <= 0) return prev

      const groups = new Map<string, number[]>()
      prev.deck.forEach((card) => {
        if (prev.matched.has(card.itemId)) return
        const list = groups.get(card.itemId) ?? []
        list.push(1)
        groups.set(card.itemId, list)
      })
      const candidates = [...groups.keys()].filter((id) => groups.get(id)?.length === 2)
      if (candidates.length === 0) return prev

      const itemId = candidates[Math.floor(Math.random() * candidates.length)]
      const matched = new Set(prev.matched).add(itemId)
      const totalPairs = prev.deck.length / 2
      const won = matched.size === totalPairs
      const cost = prev.mode === 'zen' ? 0 : WILD_COST
      const bonus = won ? finalBonus(prev) : 0
      const score = Math.max(0, prev.score - cost) + bonus
      const duelWinner =
        won && prev.mode === 'duelo'
          ? prev.duelScores[0] >= prev.duelScores[1]
            ? 1
            : 2
          : prev.duelWinner

      return {
        ...prev,
        matched,
        wildsLeft: prev.wildsLeft - 1,
        wildsUsed: prev.wildsUsed + 1,
        score,
        status: won ? 'won' : 'playing',
        duelWinner,
      }
    })
  }, [])

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'playing') return prev
        const seconds = prev.seconds + 1
        if (prev.mode === 'reloj' && seconds >= prev.timeLimit) {
          return { ...prev, seconds: prev.timeLimit, status: 'lost', loseReason: 'time' }
        }
        return { ...prev, seconds }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [state.status])

  const hintActive = state.status === 'playing' && state.hintOpen && state.flipped.length === 2

  useEffect(() => {
    if (!hintActive) return
    const id = window.setTimeout(() => {
      setState((cur) => ({ ...cur, flipped: [], hintOpen: false }))
    }, HINT_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [hintActive, state.flipped])

  const mismatchOpen = state.status === 'playing' && !state.hintOpen && state.flipped.length === 2

  useEffect(() => {
    if (!mismatchOpen) return
    const [first, second] = state.flipped
    if (state.deck[first]?.itemId === state.deck[second]?.itemId) return
    const id = window.setTimeout(() => {
      setState((cur) => {
        const next: GameState = { ...cur, flipped: [], hintOpen: false }
        if (cur.mode !== 'vidas') return next

        const lives = Math.max(0, (cur.lives ?? 0) - 1)
        const lost = lives === 0
        return {
          ...next,
          lives,
          status: lost ? 'lost' : cur.status,
          loseReason: lost ? 'lives' : cur.loseReason,
        }
      })
    }, MISMATCH_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [mismatchOpen, state.flipped, state.deck])

  useEffect(() => {
    if (state.status === 'playing') saveSession(state)
    else if (state.status === 'won' || state.status === 'lost') clearSession()
  }, [state])

  const previousRef = useRef(state)
  useEffect(() => {
    const previous = previousRef.current
    previousRef.current = state
    if (previous === state) return

    if (state.status === 'won' && previous.status !== 'won') {
      playSound('win')
      vibrate([50, 40, 50, 40, 120])
      return
    }
    if (state.status === 'lost' && previous.status !== 'lost') {
      playSound('lose')
      vibrate([80, 60, 80])
      return
    }
    if (state.hintOpen && !previous.hintOpen) {
      playSound('flip')
      return
    }
    if (state.wildsUsed > previous.wildsUsed) {
      playSound('match')
      vibrate(30)
      return
    }
    if (state.moves > previous.moves) {
      if (state.matched.size > previous.matched.size) {
        playSound('match')
        vibrate(30)
      } else {
        playSound('miss')
      }
      return
    }
    if (state.flipped.length === 1 && previous.flipped.length === 0 && state.status === 'playing') {
      playSound('flip')
    }
  }, [state])

  return { state, startGame, resumeGame, flipCard, useHint, useWild }
}

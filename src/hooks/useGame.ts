import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CARD_ITEMS,
  LIVES_BY_DIFFICULTY,
  PAIRS_BY_DIFFICULTY,
  TIME_LIMITS,
  type Difficulty,
  type Mode,
} from '../data/cards'
import { playSound, vibrate } from '../utils/sound'

export type DeckCard = {
  key: string
  itemId: string
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'
export type LoseReason = 'time' | 'lives' | null

export type GameState = {
  deck: DeckCard[]
  flipped: number[]
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

export type ScoreOptions = {
  mode?: Mode
  timeLimit?: number
  lives?: number | null
}

const BASE_MATCH_POINTS = 100
const FAIL_PENALTY = 10
const CLASSIC_TIME_BONUS = 500
const TIME_STEP_SECONDS = 10
const TIME_STEP_PENALTY = 5
const CLOCK_POINTS_PER_SECOND = 10
const LIFE_POINTS = 50

export function computeScore(
  moves: number,
  matchedCount: number,
  seconds: number,
  options: ScoreOptions = {},
): number {
  const mode = options.mode ?? 'clasico'
  const matchBonus = matchedCount * BASE_MATCH_POINTS
  const attempts = Math.max(0, moves - matchedCount)
  const penalty = attempts * FAIL_PENALTY

  let bonus = 0
  if (mode === 'reloj') {
    const timeLeft = Math.max(0, (options.timeLimit ?? 0) - seconds)
    bonus = timeLeft * CLOCK_POINTS_PER_SECOND
  } else {
    bonus = Math.max(0, CLASSIC_TIME_BONUS - Math.floor(seconds / TIME_STEP_SECONDS) * TIME_STEP_PENALTY)
    if (mode === 'vidas') {
      bonus += Math.max(0, options.lives ?? 0) * LIFE_POINTS
    }
  }

  return Math.max(0, matchBonus + bonus - penalty)
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildDeck(pairs: number): DeckCard[] {
  const items = shuffle(CARD_ITEMS).slice(0, pairs)
  const deck = items.flatMap((item) => [
    { key: `${item.id}-a`, itemId: item.id },
    { key: `${item.id}-b`, itemId: item.id },
  ])
  return shuffle(deck)
}

const INITIAL_STATE: GameState = {
  deck: [],
  flipped: [],
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

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)
  const previousRef = useRef<GameState>(state)

  const startGame = useCallback((mode: Mode, difficulty: Difficulty) => {
    setState({
      deck: buildDeck(PAIRS_BY_DIFFICULTY[difficulty]),
      flipped: [],
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
      const matched = isMatch ? new Set(prev.matched).add(prev.deck[first].itemId) : prev.matched
      const totalPairs = prev.deck.length / 2
      const options: ScoreOptions = { mode: prev.mode, timeLimit: prev.timeLimit, lives: prev.lives }

      if (isMatch) {
        const status: GameStatus = matched.size === totalPairs ? 'won' : 'playing'
        return {
          ...prev,
          flipped: [],
          moves,
          matched,
          status,
          score: computeScore(moves, matched.size, prev.seconds, options),
        }
      }

      if (prev.mode === 'vidas') {
        const lives = Math.max(0, (prev.lives ?? 0) - 1)
        const lost = lives === 0
        return {
          ...prev,
          flipped: [],
          moves,
          lives,
          status: lost ? 'lost' : 'playing',
          loseReason: lost ? 'lives' : null,
          score: computeScore(moves, matched.size, prev.seconds, options),
        }
      }

      return { ...prev, flipped, moves }
    })
  }, [])

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'playing') return prev
        const seconds = prev.seconds + 1
        if (prev.mode === 'reloj' && seconds >= prev.timeLimit) {
          const options: ScoreOptions = { mode: prev.mode, timeLimit: prev.timeLimit, lives: prev.lives }
          return {
            ...prev,
            seconds: prev.timeLimit,
            status: 'lost',
            loseReason: 'time',
            score: computeScore(prev.moves, prev.matched.size, prev.timeLimit, options),
          }
        }
        return { ...prev, seconds }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [state.status])

  const mismatchOpen = state.status === 'playing' && state.flipped.length === 2

  useEffect(() => {
    if (!mismatchOpen) return
    const [first, second] = state.flipped
    if (state.deck[first]?.itemId === state.deck[second]?.itemId) return
    const id = window.setTimeout(() => {
      setState((cur) => ({ ...cur, flipped: [] }))
    }, 800)
    return () => window.clearTimeout(id)
  }, [mismatchOpen, state.flipped, state.deck])

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

  return { state, startGame, flipCard }
}

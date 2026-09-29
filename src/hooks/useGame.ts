import { useCallback, useEffect, useRef, useState } from 'react'
import { CARD_ITEMS, type Difficulty } from '../data/cards'

export type DeckCard = {
  key: string
  itemId: string
}

export type GameStatus = 'idle' | 'playing' | 'won'

export type GameState = {
  deck: DeckCard[]
  flipped: number[]
  matched: Set<string>
  moves: number
  score: number
  seconds: number
  status: GameStatus
  difficulty: Difficulty
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

const WIN_BONUS = 500
const MATCH_POINTS = 100
const FAIL_PENALTY = 10
const TIME_STEP_SECONDS = 10
const TIME_STEP_PENALTY = 5

export function computeScore(moves: number, matchedCount: number, seconds: number): number {
  const matchBonus = matchedCount * MATCH_POINTS
  const timeBonus = Math.max(0, WIN_BONUS - Math.floor(seconds / TIME_STEP_SECONDS) * TIME_STEP_PENALTY)
  const attempts = Math.max(0, moves - matchedCount)
  const penalty = attempts * FAIL_PENALTY
  return Math.max(0, matchBonus + timeBonus - penalty)
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => ({
    deck: [],
    flipped: [],
    matched: new Set<string>(),
    moves: 0,
    score: 0,
    seconds: 0,
    status: 'idle',
    difficulty: 'normal',
  }))

  const timeoutRef = useRef<number | null>(null)

  const clearPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startGame = useCallback((difficulty: Difficulty) => {
    clearPending()
    const pairs = difficulty === 'facil' ? 6 : difficulty === 'normal' ? 9 : 14
    setState({
      deck: buildDeck(pairs),
      flipped: [],
      matched: new Set<string>(),
      moves: 0,
      score: 0,
      seconds: 0,
      status: 'playing',
      difficulty,
    })
  }, [clearPending])

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = window.setInterval(() => {
      setState((prev) => (prev.status === 'playing' ? { ...prev, seconds: prev.seconds + 1 } : prev))
    }, 1000)
    return () => window.clearInterval(id)
  }, [state.status])

  const flipCard = useCallback((index: number) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      if (prev.flipped.length >= 2) return prev
      if (prev.flipped.includes(index)) return prev
      const card = prev.deck[index]
      if (prev.matched.has(card.itemId)) return prev

      const flipped = [...prev.flipped, index]
      if (flipped.length < 2) {
        return { ...prev, flipped }
      }

      const moves = prev.moves + 1
      const [first, second] = flipped
      const isMatch = prev.deck[first].itemId === prev.deck[second].itemId
      const matched = isMatch ? new Set(prev.matched).add(prev.deck[first].itemId) : prev.matched
      const totalPairs = prev.deck.length / 2
      const status: GameStatus = matched.size === totalPairs ? 'won' : 'playing'

      return {
        ...prev,
        flipped: isMatch ? [] : flipped,
        moves,
        matched,
        status,
        score: computeScore(moves, matched.size, prev.seconds),
      }
    })
  }, [])

  const pairOpen = state.flipped.length === 2

  useEffect(() => {
    if (!pairOpen) return
    const [first, second] = state.flipped
    if (state.deck[first]?.itemId === state.deck[second]?.itemId) return
    const id = window.setTimeout(() => {
      setState((cur) => ({ ...cur, flipped: [] }))
      timeoutRef.current = null
    }, 800)
    timeoutRef.current = id
    return () => {
      window.clearTimeout(id)
      timeoutRef.current = null
    }
  }, [pairOpen, state.flipped, state.deck])

  useEffect(() => clearPending, [clearPending])

  return { state, startGame, flipCard }
}

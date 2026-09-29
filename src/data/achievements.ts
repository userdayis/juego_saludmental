import type { Difficulty, Mode } from './cards'

export type GameResultContext = {
  won: boolean
  moves: number
  matchedPairs: number
  totalPairs: number
  seconds: number
  difficulty: Difficulty
  mode: Mode
  livesLeft: number | null
  livesStart: number | null
  streak: number
  games: number
  pairsTotal: number
}

export type Achievement = {
  id: string
  icon: string
  name: string
  description: string
  check: (context: GameResultContext) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primera-victoria',
    icon: '🎉',
    name: 'Primera victoria',
    description: 'Completa tu primera partida',
    check: (context) => context.won,
  },
  {
    id: 'partida-perfecta',
    icon: '💯',
    name: 'Partida perfecta',
    description: 'Gana sin ningún intento fallido',
    check: (context) => context.won && context.moves === context.totalPairs,
  },
  {
    id: 'relampago',
    icon: '⚡',
    name: 'Relámpago',
    description: 'Gana en menos de 60 segundos',
    check: (context) => context.won && context.seconds < 60,
  },
  {
    id: 'sin-rasgunos',
    icon: '🛡️',
    name: 'Sin rasguños',
    description: 'Gana en modo Vidas sin perder ninguna',
    check: (context) =>
      context.won && context.mode === 'vidas' && context.livesLeft !== null && context.livesLeft === context.livesStart,
  },
  {
    id: 'racha-5',
    icon: '🔥',
    name: 'Racha de 5',
    description: 'Gana 5 partidas seguidas',
    check: (context) => context.streak >= 5,
  },
  {
    id: '50-pares',
    icon: '🃏',
    name: '50 pares',
    description: 'Encuentra 50 pares en total',
    check: (context) => context.pairsTotal >= 50,
  },
  {
    id: '10-partidas',
    icon: '🕹️',
    name: 'Veterano',
    description: 'Juega 10 partidas',
    check: (context) => context.games >= 10,
  },
  {
    id: 'mente-brillante',
    icon: '🧠',
    name: 'Mente brillante',
    description: 'Gana en la dificultad Difícil',
    check: (context) => context.won && context.difficulty === 'dificil',
  },
]

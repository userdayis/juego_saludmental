import type { Bi } from '../i18n'
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
  hintsUsed: number
  wildsUsed: number
  duelWon: boolean
  quizCorrect: number
  stageCompleted: number
  daysStreak: number
  checkins: number
}

export type Achievement = {
  id: string
  icon: string
  name: Bi
  description: Bi
  check: (context: GameResultContext) => boolean
}

const B = (es: string, en: string): Bi => ({ es, en })

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primera-victoria',
    icon: '🎉',
    name: B('Primera victoria', 'First win'),
    description: B('Completa tu primera partida', 'Complete your first game'),
    check: (c) => c.won,
  },
  {
    id: 'partida-perfecta',
    icon: '💯',
    name: B('Partida perfecta', 'Perfect game'),
    description: B('Gana sin ningún intento fallido', 'Win without a single failed attempt'),
    check: (c) => c.won && c.moves === c.totalPairs && c.wildsUsed === 0,
  },
  {
    id: 'relampago',
    icon: '⚡',
    name: B('Relámpago', 'Lightning'),
    description: B('Gana en menos de 60 segundos', 'Win in under 60 seconds'),
    check: (c) => c.won && c.seconds < 60,
  },
  {
    id: 'sin-rasgunos',
    icon: '🛡️',
    name: B('Sin rasguños', 'Unscathed'),
    description: B('Gana en modo Vidas sin perder ninguna', 'Win Lives mode without losing one'),
    check: (c) =>
      c.won && c.mode === 'vidas' && c.livesLeft !== null && c.livesLeft === c.livesStart,
  },
  {
    id: 'racha-5',
    icon: '🔥',
    name: B('Racha de 5', 'Streak of 5'),
    description: B('Gana 5 partidas seguidas', 'Win 5 games in a row'),
    check: (c) => c.streak >= 5,
  },
  {
    id: '50-pares',
    icon: '🃏',
    name: B('50 pares', '50 pairs'),
    description: B('Encuentra 50 pares en total', 'Find 50 pairs in total'),
    check: (c) => c.pairsTotal >= 50,
  },
  {
    id: '10-partidas',
    icon: '🕹️',
    name: B('Veterano', 'Veteran'),
    description: B('Juega 10 partidas', 'Play 10 games'),
    check: (c) => c.games >= 10,
  },
  {
    id: 'mente-brillante',
    icon: '🧠',
    name: B('Mente brillante', 'Brilliant mind'),
    description: B('Gana en la dificultad Experto', 'Win on Expert difficulty'),
    check: (c) => c.won && c.difficulty === 'experto',
  },
  {
    id: 'sin-pistas',
    icon: '🙌',
    name: B('Sin ayuda', 'Self-made'),
    description: B('Gana sin usar pistas', 'Win without using hints'),
    check: (c) => c.won && c.hintsUsed === 0,
  },
  {
    id: 'con-comodin',
    icon: '🎁',
    name: B('Comodín', 'Wildcard'),
    description: B('Gana usando el comodín', 'Win using the wildcard'),
    check: (c) => c.won && c.wildsUsed >= 1,
  },
  {
    id: 'mente-zen',
    icon: '🍃',
    name: B('Mente zen', 'Zen mind'),
    description: B('Completa una partida en modo Zen', 'Complete a Zen-mode game'),
    check: (c) => c.won && c.mode === 'zen',
  },
  {
    id: 'duelista',
    icon: '⚔️',
    name: B('Duelista', 'Duelist'),
    description: B('Gana un duelo de 2 jugadores', 'Win a 2-player duel'),
    check: (c) => c.duelWon,
  },
  {
    id: 'campana-completa',
    icon: '🏆',
    name: B('Campaña completa', 'Full campaign'),
    description: B('Completa las 10 etapas de la campaña', 'Complete all 10 campaign stages'),
    check: (c) => c.stageCompleted >= 10,
  },
  {
    id: 'quiz-ace',
    icon: '📝',
    name: B('Buen estudiante', 'Top student'),
    description: B('Responde bien las 3 preguntas del quiz', 'Answer all 3 quiz questions correctly'),
    check: (c) => c.quizCorrect >= 3,
  },
  {
    id: 'semana-completa',
    icon: '📅',
    name: B('Semana completa', 'Full week'),
    description: B('Juega 7 días seguidos', 'Play 7 days in a row'),
    check: (c) => c.daysStreak >= 7,
  },
  {
    id: 'espejo',
    icon: '🪞',
    name: B('Escúchate', 'Check in'),
    description: B('Registra cómo te sientes 7 veces', 'Check in on how you feel 7 times'),
    check: (c) => c.checkins >= 7,
  },
]

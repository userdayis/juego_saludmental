export type CardItem = {
  id: string
  icon: string
  label: string
  tip: string
}

export const CARD_ITEMS: CardItem[] = [
  {
    id: 'respiracion',
    icon: '🫁',
    label: 'Respiración',
    tip: 'Prueba la respiración 4-4-4: inhala 4 segundos, sostén 4, exhala 4. Baja la ansiedad en minutos.',
  },
  {
    id: 'sueno',
    icon: '😴',
    label: 'Sueño',
    tip: 'Dormir entre 7 y 9 horas ayuda a tu memoria y regula tu estado de ánimo al día siguiente.',
  },
  {
    id: 'ejercicio',
    icon: '🏃',
    label: 'Movimiento',
    tip: '30 minutos de actividad física al día liberan endorfinas: es un antidepresivo natural.',
  },
  {
    id: 'meditacion',
    icon: '🧘',
    label: 'Pausa consciente',
    tip: '5 minutos de meditación al día reducen el estrés y mejoran tu concentración.',
  },
  {
    id: 'desconexion',
    icon: '📵',
    label: 'Desconectar',
    tip: 'Deja el móvil fuera del dormitorio: la luz azul antes de dormir retrasa tu descanso.',
  },
  {
    id: 'hablar',
    icon: '🗣️',
    label: 'Pedir ayuda',
    tip: 'Hablar de lo que sientes con alguien de confianza alivia más de lo que imaginas.',
  },
  {
    id: 'diario',
    icon: '✍️',
    label: 'Escribir',
    tip: 'Escribir tus emociones 10 minutos al día te ayuda a ordenar lo que sientes.',
  },
  {
    id: 'naturaleza',
    icon: '🌳',
    label: 'Naturaleza',
    tip: 'Pasar tiempo al aire libre reduce el cortisol, la hormona del estrés.',
  },
  {
    id: 'apoyo',
    icon: '🤝',
    label: 'Red de apoyo',
    tip: 'Mantener vínculos cercanos es uno de los factores más protectores para la salud mental.',
  },
  {
    id: 'alimentacion',
    icon: '🥗',
    label: 'Alimentación',
    tip: 'El 90% de la serotonina se produce en el intestino: cuida lo que comes.',
  },
  {
    id: 'creatividad',
    icon: '🎨',
    label: 'Creatividad',
    tip: 'Dedicar tiempo a un hobby te saca del piloto automático y recarga energía.',
  },
  {
    id: 'limites',
    icon: '🙅',
    label: 'Límites',
    tip: 'Decir que no a lo que te sobrepasa es cuidarte, no ser egoísta.',
  },
  {
    id: 'luz',
    icon: '☀️',
    label: 'Luz solar',
    tip: '15 minutos de luz natural por la mañana regulan tu ritmo circadiano y tu ánimo.',
  },
  {
    id: 'terapia',
    icon: '💚',
    label: 'Terapia',
    tip: 'Acudir a un profesional es una señal de fortaleza: pedir ayuda también es un hábito.',
  },
]

export type Difficulty = 'facil' | 'normal' | 'dificil'

export function getItemById(id: string): CardItem | undefined {
  return CARD_ITEMS.find((item) => item.id === id)
}

export const DIFFICULTIES: { id: Difficulty; label: string; pairs: number }[] = [
  { id: 'facil', label: 'Fácil', pairs: 6 },
  { id: 'normal', label: 'Normal', pairs: 9 },
  { id: 'dificil', label: 'Difícil', pairs: 14 },
]

export type Mode = 'clasico' | 'reloj' | 'vidas'

export const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'clasico', label: 'Clásico', hint: 'Sin límite de tiempo ni de intentos' },
  { id: 'reloj', label: 'Contra reloj', hint: 'Gana antes de que se acabe el tiempo' },
  { id: 'vidas', label: 'Vidas', hint: 'Tienes pocos fallos permitidos' },
]

export const PAIRS_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 6,
  normal: 9,
  dificil: 14,
}

export const TIME_LIMITS: Record<Difficulty, number> = {
  facil: 90,
  normal: 150,
  dificil: 240,
}

export const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 7,
  normal: 10,
  dificil: 15,
}

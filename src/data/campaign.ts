import type { Bi } from '../i18n'

export type Stage = {
  n: number
  title: Bi
  hint: Bi
  itemIds: string[]
}

const B = (es: string, en: string): Bi => ({ es, en })

export const STAGES: Stage[] = [
  {
    n: 1,
    title: B('Descanso', 'Rest'),
    hint: B('Sueño, luz y rutina', 'Sleep, light and routine'),
    itemIds: ['sueno', 'desconexion', 'rutina', 'luz', 'lectura', 'silencio'],
  },
  {
    n: 2,
    title: B('Calma', 'Calm'),
    hint: B('Respiración y naturaleza', 'Breathing and nature'),
    itemIds: ['respiracion', 'meditacion', 'naturaleza', 'mascotas', 'conversacion', 'pausa-activa'],
  },
  {
    n: 3,
    title: B('Cuerpo', 'Body'),
    hint: B('Muévete y aliméntate bien', 'Move and eat well'),
    itemIds: ['ejercicio', 'estiramiento', 'alimentacion', 'hidratacion', 'descanso-visual', 'bailar', 'cocinar', 'cantar'],
  },
  {
    n: 4,
    title: B('Emociones', 'Emotions'),
    hint: B('Nómbralas y escríbelas', 'Name them and write them down'),
    itemIds: ['emociones', 'diario', 'pensamientos', 'victorias', 'gratitud', 'prioridades', 'limites', 'hablar'],
  },
  {
    n: 5,
    title: B('Vínculos', 'Bonds'),
    hint: B('Personas que te cuidan', 'People who care about you'),
    itemIds: ['apoyo', 'amistad', 'risa', 'abrazos', 'conversacion', 'ayudar', 'mascotas', 'voluntariado'],
  },
  {
    n: 6,
    title: B('Entorno', 'Environment'),
    hint: B('Tu espacio y tus hobbies', 'Your space and your hobbies'),
    itemIds: ['orden', 'creatividad', 'musica', 'juego', 'bailar', 'lectura', 'cocinar', 'naturaleza'],
  },
  {
    n: 7,
    title: B('Mente', 'Mind'),
    hint: B('Enfócate sin agobiarte', 'Focus without burning out'),
    itemIds: ['objetivos', 'prioridades', 'pensamientos', 'limites', 'rutina', 'diario', 'gratitud', 'victorias', 'meditacion', 'pausa-activa'],
  },
  {
    n: 8,
    title: B('Hábitos', 'Habits'),
    hint: B('Pequeños gestos diarios', 'Small daily gestures'),
    itemIds: [
      'alimentacion', 'hidratacion', 'ejercicio', 'sueno', 'rutina', 'luz',
      'desconexion', 'orden', 'estiramiento', 'descanso-visual', 'cocinar', 'silencio',
    ],
  },
  {
    n: 9,
    title: B('Bienestar total', 'Full wellness'),
    hint: B('Todo lo aprendido junto', 'Everything together'),
    itemIds: [
      'gratitud', 'ejercicio', 'hablar', 'naturaleza', 'limites', 'diario', 'musica', 'apoyo',
      'objetivos', 'respiracion', 'amistad', 'orden', 'lectura', 'rutina', 'luz', 'risa',
    ],
  },
  {
    n: 10,
    title: B('Experto', 'Expert'),
    hint: B('24 pares, el gran reto', '24 pairs, the big challenge'),
    itemIds: [
      'sueno', 'ejercicio', 'respiracion', 'desconexion', 'hablar', 'diario', 'naturaleza', 'apoyo',
      'alimentacion', 'creatividad', 'limites', 'luz', 'terapia', 'musica', 'emociones', 'rutina',
      'hidratacion', 'risa', 'mascotas', 'gratitud', 'objetivos', 'estiramiento', 'lectura', 'bailar',
    ],
  },
]

export function stageSeed(n: number): number {
  return 1000 + n * 7919
}

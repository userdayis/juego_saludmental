import type { Bi, Lang } from '../i18n'
import { pick } from '../i18n'

export type SourceId = 'minsalud' | 'oms' | 'apa' | 'icbf'

export const SOURCES: Record<SourceId, { label: Bi; href: string }> = {
  minsalud: { label: { es: 'MinSalud', en: 'Ministry of Health' }, href: 'https://www.minsalud.gov.co/' },
  oms: { label: { es: 'OMS', en: 'WHO' }, href: 'https://www.who.int/es' },
  apa: { label: { es: 'APA', en: 'APA' }, href: 'https://www.apa.org/' },
  icbf: { label: { es: 'ICBF', en: 'ICBF' }, href: 'https://www.icbf.gov.co/' },
}

export type CardItem = {
  id: string
  icon: string
  label: Bi
  tip: Bi
  source: SourceId
}

const B = (es: string, en: string): Bi => ({ es, en })

export const CARD_ITEMS: CardItem[] = [
  { id: 'respiracion', icon: '🫁', source: 'minsalud', label: B('Respiración', 'Breathing'), tip: B('Prueba la respiración 4-4-4: inhala 4 segundos, sostén 4, exhala 4. Baja la ansiedad en minutos.', 'Try the 4-4-4 breath: inhale 4 seconds, hold 4, exhale 4. It calms anxiety in minutes.') },
  { id: 'sueno', icon: '😴', source: 'oms', label: B('Sueño', 'Sleep'), tip: B('Dormir entre 7 y 9 horas ayuda a tu memoria y regula tu estado de ánimo al día siguiente.', 'Sleeping 7 to 9 hours helps your memory and steadies your mood the next day.') },
  { id: 'ejercicio', icon: '🏃', source: 'oms', label: B('Movimiento', 'Movement'), tip: B('30 minutos de actividad física al día liberan endorfinas: es un antidepresivo natural.', '30 minutes of physical activity a day release endorphins: nature’s antidepressant.') },
  { id: 'meditacion', icon: '🧘', source: 'minsalud', label: B('Pausa consciente', 'Mindful pause'), tip: B('5 minutos de meditación al día reducen el estrés y mejoran tu concentración.', '5 minutes of meditation a day reduce stress and improve your focus.') },
  { id: 'desconexion', icon: '📵', source: 'minsalud', label: B('Desconectar', 'Unplug'), tip: B('Deja el móvil fuera del dormitorio: la luz azul antes de dormir retrasa tu descanso.', 'Keep your phone out of the bedroom: blue light before bed delays your rest.') },
  { id: 'hablar', icon: '🗣️', source: 'minsalud', label: B('Pedir ayuda', 'Ask for help'), tip: B('Hablar de lo que sientes con alguien de confianza alivia más de lo que imaginas.', 'Talking about what you feel with someone you trust relieves more than you imagine.') },
  { id: 'diario', icon: '✍️', source: 'apa', label: B('Escribir', 'Journaling'), tip: B('Escribir tus emociones 10 minutos al día te ayuda a ordenar lo que sientes.', 'Writing your emotions for 10 minutes a day helps you sort out what you feel.') },
  { id: 'naturaleza', icon: '🌳', source: 'oms', label: B('Naturaleza', 'Nature'), tip: B('Pasar tiempo al aire libre reduce el cortisol, la hormona del estrés.', 'Spending time outdoors lowers cortisol, the stress hormone.') },
  { id: 'apoyo', icon: '🤝', source: 'oms', label: B('Red de apoyo', 'Support network'), tip: B('Mantener vínculos cercanos es uno de los factores más protectores para la salud mental.', 'Keeping close bonds is one of the most protective factors for mental health.') },
  { id: 'alimentacion', icon: '🥗', source: 'oms', label: B('Alimentación', 'Nutrition'), tip: B('El 90% de la serotonina se produce en el intestino: cuida lo que comes.', '90% of serotonin is produced in the gut: care about what you eat.') },
  { id: 'creatividad', icon: '🎨', source: 'apa', label: B('Creatividad', 'Creativity'), tip: B('Dedicar tiempo a un hobby te saca del piloto automático y recarga energía.', 'Spending time on a hobby takes you out of autopilot and recharges you.') },
  { id: 'limites', icon: '🙅', source: 'apa', label: B('Límites', 'Boundaries'), tip: B('Decir que no a lo que te sobrepasa es cuidarte, no ser egoísta.', 'Saying no to what overwhelms you is self-care, not selfishness.') },
  { id: 'luz', icon: '☀️', source: 'oms', label: B('Luz solar', 'Sunlight'), tip: B('15 minutos de luz natural por la mañana regulan tu ritmo circadiano y tu ánimo.', '15 minutes of natural light in the morning regulate your circadian rhythm and mood.') },
  { id: 'terapia', icon: '💚', source: 'minsalud', label: B('Terapia', 'Therapy'), tip: B('Acudir a un profesional es una señal de fortaleza: pedir ayuda también es un hábito.', 'Seeing a professional is a sign of strength: asking for help is also a habit.') },
  { id: 'musica', icon: '🎵', source: 'minsalud', label: B('Música', 'Music'), tip: B('Escuchar música que te gusta baja el cortisol y mejora tu estado de ánimo en minutos.', 'Listening to music you like lowers cortisol and improves your mood in minutes.') },
  { id: 'emociones', icon: '💬', source: 'apa', label: B('Nombrar emociones', 'Name emotions'), tip: B('Ponerle nombre a lo que sientes («estoy ansioso») le quita intensidad a la emoción.', 'Naming what you feel (“I am anxious”) takes intensity away from the emotion.') },
  { id: 'rutina', icon: '🕐', source: 'oms', label: B('Rutina', 'Routine'), tip: B('Horarios estables le dan seguridad a tu mente y mejoran la calidad de tu descanso.', 'Steady schedules give your mind safety and improve your rest quality.') },
  { id: 'hidratacion', icon: '💧', source: 'oms', label: B('Hidratación', 'Hydration'), tip: B('Deshidratarte afecta tu concentración y tu humor: bebe agua durante todo el día.', 'Dehydration hurts your concentration and mood: drink water all day.') },
  { id: 'risa', icon: '😂', source: 'oms', label: B('Risa', 'Laughter'), tip: B('Reírte con otras personas libera endorfinas y refuerza tus vínculos.', 'Laughing with other people releases endorphins and strengthens your bonds.') },
  { id: 'mascotas', icon: '🐾', source: 'oms', label: B('Mascotas', 'Pets'), tip: B('El contacto con un animal baja la frecuencia cardíaca y la tensión arterial.', 'Contact with an animal lowers heart rate and blood pressure.') },

  { id: 'gratitud', icon: '🙏', source: 'oms', label: B('Gratitud', 'Gratitude'), tip: B('Anota cada noche 3 cosas por las que estás agradecido: en dos semanas mejora tu ánimo.', 'Write down 3 things you are grateful for each night: in two weeks your mood improves.') },
  { id: 'pausa-activa', icon: '🚶', source: 'apa', label: B('Pausa activa', 'Active break'), tip: B('Cada 60 minutos levántate y muévete 5 minutos: baja la fatiga mental.', 'Every 60 minutes stand up and move for 5 minutes: it lowers mental fatigue.') },
  { id: 'objetivos', icon: '🎯', source: 'apa', label: B('Metas', 'Goals'), tip: B('Divide las tareas grandes en pasos de 5 minutos: lograrlos libera dopamina.', 'Break big tasks into 5-minute steps: finishing them releases dopamine.') },
  { id: 'conversacion', icon: '🫶', source: 'minsalud', label: B('Charla', 'A good talk'), tip: B('Una conversación de 10 minutos con alguien de confianza reduce el estrés.', 'A 10-minute conversation with someone you trust reduces stress.') },
  { id: 'estiramiento', icon: '🤸', source: 'oms', label: B('Estiramiento', 'Stretching'), tip: B('Estirar 5 minutos libera la tensión acumulada en cuello y hombros.', 'Stretching for 5 minutes releases tension built up in your neck and shoulders.') },
  { id: 'lectura', icon: '📚', source: 'apa', label: B('Leer', 'Reading'), tip: B('Leer unos minutos antes de dormir calma la mente y reduce el estrés.', 'Reading a few minutes before bed calms the mind and reduces stress.') },
  { id: 'bailar', icon: '💃', source: 'oms', label: B('Bailar', 'Dancing'), tip: B('Bailar une movimiento, música y compañía: triple beneficio para tu ánimo.', 'Dancing combines movement, music and company: a triple boost for your mood.') },
  { id: 'cocinar', icon: '🍳', source: 'minsalud', label: B('Cocinar', 'Cooking'), tip: B('Cocinar lo que comes te hace comer más lento y consciente.', 'Cooking your own food helps you eat more slowly and mindfully.') },
  { id: 'silencio', icon: '🔇', source: 'oms', label: B('Silencio', 'Silence'), tip: B('Cinco minutos de silencio al día bajan la presión y te reorganizan.', 'Five minutes of silence a day lower your blood pressure and reorganize your thoughts.') },
  { id: 'abrazos', icon: '🤗', source: 'minsalud', label: B('Abrazos', 'Hugs'), tip: B('Un abrazo de 20 segundos libera oxitocina y baja la ansiedad.', 'A 20-second hug releases oxytocin and lowers anxiety.') },
  { id: 'prioridades', icon: '📌', source: 'apa', label: B('Prioridades', 'Priorities'), tip: B('Elige 3 tareas clave al día: completarlas da sensación de avance real.', 'Pick 3 key tasks a day: finishing them gives a real sense of progress.') },
  { id: 'pensamientos', icon: '🧩', source: 'apa', label: B('Pensamientos', 'Thoughts'), tip: B('Escribe el pensamiento que te angustia y busca una evidencia en su contra: es técnica básica.', 'Write down the thought that distresses you and look for evidence against it: a basic technique.') },
  { id: 'victorias', icon: '✅', source: 'apa', label: B('Pequeñas victorias', 'Small wins'), tip: B('Tacha lo que lograste hoy: a tu cerebro le gusta ver el progreso.', 'Check off what you achieved today: your brain likes seeing progress.') },
  { id: 'descanso-visual', icon: '👀', source: 'minsalud', label: B('Descanso visual', 'Eye rest'), tip: B('Cada 20 minutos mira algo a 20 metros durante 20 segundos (regla 20-20-20).', 'Every 20 minutes look at something 20 meters away for 20 seconds (20-20-20 rule).') },
  { id: 'juego', icon: '🎲', source: 'oms', label: B('Juego', 'Play'), tip: B('Jugar, aunque sea un memorama, entrena la memoria y baja el estrés.', 'Playing, even a memory game, trains your memory and lowers stress.') },
  { id: 'cantar', icon: '🎤', source: 'oms', label: B('Cantar', 'Singing'), tip: B('Cantar regula la respiración y libera endorfinas; no hace falta cantar bien.', 'Singing regulates your breathing and releases endorphins; you don’t have to sing well.') },
  { id: 'amistad', icon: '👥', source: 'minsalud', label: B('Amistad', 'Friendship'), tip: B('Pasar tiempo con amigos protege frente a la tristeza y el aislamiento.', 'Spending time with friends protects against sadness and isolation.') },
  { id: 'ayudar', icon: '🤲', source: 'oms', label: B('Ayudar', 'Helping'), tip: B('Ayudar a otros sin esperar nada a cambio eleva tu propio bienestar.', 'Helping others with nothing in return lifts your own well-being.') },
  { id: 'orden', icon: '🧹', source: 'minsalud', label: B('Orden', 'Tidying up'), tip: B('Un espacio ordenado baja la carga mental y te ayuda a concentrarte.', 'A tidy space lowers mental clutter and helps you focus.') },
  { id: 'voluntariado', icon: '🧑‍🤝‍🧑', source: 'oms', label: B('Voluntariado', 'Volunteering'), tip: B('Participar en tu comunidad fortalece el sentido de pertenencia.', 'Taking part in your community strengthens your sense of belonging.') },
]

export type Difficulty = 'facil' | 'normal' | 'dificil' | 'experto'

export function getItemById(id: string): CardItem | undefined {
  return CARD_ITEMS.find((item) => item.id === id)
}

export function itemLabel(item: CardItem, lang: Lang): string {
  return pick(item.label, lang)
}

export function itemTip(item: CardItem, lang: Lang): string {
  return pick(item.tip, lang)
}

export const DIFFICULTIES: { id: Difficulty; label: Bi; pairs: number }[] = [
  { id: 'facil', label: B('Fácil', 'Easy'), pairs: 6 },
  { id: 'normal', label: B('Normal', 'Normal'), pairs: 9 },
  { id: 'dificil', label: B('Difícil', 'Hard'), pairs: 16 },
  { id: 'experto', label: B('Experto', 'Expert'), pairs: 24 },
]

export type Mode = 'clasico' | 'reloj' | 'vidas' | 'zen' | 'duelo'

export const MODES: { id: Mode; label: Bi; hint: Bi }[] = [
  { id: 'clasico', label: B('Clásico', 'Classic'), hint: B('Sin límite de tiempo ni de intentos', 'No time or move limit') },
  { id: 'reloj', label: B('Contra reloj', 'Time attack'), hint: B('Gana antes de que se acabe el tiempo', 'Win before the clock runs out') },
  { id: 'vidas', label: B('Vidas', 'Lives'), hint: B('Tienes pocos fallos permitidos', 'You get only a few mistakes') },
  { id: 'zen', label: B('Zen', 'Zen'), hint: B('Sin perder: solo tú y las cartas', 'No losing: just you and the cards') },
  { id: 'duelo', label: B('Duelo', 'Duel'), hint: B('2 jugadores por turnos en este dispositivo', '2 players taking turns on this device') },
]

export const PAIRS_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 6,
  normal: 9,
  dificil: 16,
  experto: 24,
}

export const HINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 3,
  normal: 2,
  dificil: 1,
  experto: 1,
}

export const TIME_LIMITS: Record<Difficulty, number> = {
  facil: 90,
  normal: 150,
  dificil: 240,
  experto: 360,
}

export const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 7,
  normal: 10,
  dificil: 15,
  experto: 20,
}

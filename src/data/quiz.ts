import type { Bi } from '../i18n'

export type QuizQuestion = {
  id: string
  q: Bi
  options: Bi[]
  answer: number
}

const B = (es: string, en: string): Bi => ({ es, en })

export const QUIZ_POOL: QuizQuestion[] = [
  {
    id: 'sueno-ms',
    q: B('¿Cuántas horas de sueño recomienda la OMS para adultos?', 'How many hours of sleep does the WHO recommend for adults?'),
    options: [B('4 a 5 horas', '4 to 5 hours'), B('7 a 9 horas', '7 to 9 hours'), B('Más de 12', 'More than 12'), B('No importa', 'It does not matter')],
    answer: 1,
  },
  {
    id: 'respiracion',
    q: B('La respiración 4-4-4 sirve para…', 'The 4-4-4 breathing technique is used to…'),
    options: [B('Correr más rápido', 'Run faster'), B('Bajar la ansiedad en minutos', 'Calm anxiety in minutes'), B('Dormir menos', 'Sleep less'), B('Nada en particular', 'Nothing in particular')],
    answer: 1,
  },
  {
    id: 'limite',
    q: B('¿Qué es un límite saludable?', 'What is a healthy boundary?'),
    options: [B('Decir no a lo que te sobrepasa', 'Saying no to what overwhelms you'), B('Evitar a todas las personas', 'Avoiding everyone'), B('Hacer todo lo que te pidan', 'Doing everything people ask'), B('No salir de casa', 'Never leaving home')],
    answer: 0,
  },
  {
    id: 'terapia',
    q: B('Acudir a terapia es…', 'Going to therapy is…'),
    options: [B('Señal de debilidad', 'A sign of weakness'), B('Solo para casos graves', 'Only for severe cases'), B('Una señal de fortaleza', 'A sign of strength'), B('Una pérdida de tiempo', 'A waste of time')],
    answer: 2,
  },
  {
    id: 'movimiento',
    q: B('¿Cuánta actividad física al día se sugiere?', 'How much daily physical activity is recommended?'),
    options: [B('30 minutos', '30 minutes'), B('5 minutos', '5 minutes'), B('3 horas', '3 hours'), B('Solo fines de semana', 'Weekends only')],
    answer: 0,
  },
  {
    id: 'emociones',
    q: B('Nombrar la emoción que sientes…', 'Naming the emotion you feel…'),
    options: [B('La hace peor', 'Makes it worse'), B('Le quita intensidad', 'Takes intensity away from it'), B('No sirve de nada', 'Does nothing'), B('Es de débiles', 'Is for the weak')],
    answer: 1,
  },
  {
    id: 'linea106',
    q: B('¿Cuál es la línea de salud mental 24/7 en Colombia?', 'What is the 24/7 mental health line in Colombia?'),
    options: [B('Línea 123', 'Line 123'), B('Línea 141', 'Line 141'), B('Línea 106', 'Line 106'), B('Línea 911', 'Line 911')],
    answer: 2,
  },
  {
    id: 'escribir',
    q: B('Escribir lo que sientes cada día…', 'Writing down what you feel each day…'),
    options: [B('Ayuda a ordenar lo que pasa', 'Helps you sort things out'), B('Empeora todo', 'Makes everything worse'), B('No cambia nada', 'Changes nothing'), B('Solo sirve para la escuela', 'Only useful for school')],
    answer: 0,
  },
  {
    id: 'apoyo-emocional',
    q: B('Si un amigo te confiesa que no está bien, ¿qué NO debes hacer?', 'If a friend tells you they are not okay, what should you NOT do?'),
    options: [B('Escucharlo con calma', 'Listen calmly'), B('Decirle «no es para tanto»', 'Tell them “it is not a big deal”'), B('Preguntarle si quiere ayuda', 'Ask if they want help'), B('Compartirle la Línea 106', 'Share the Line 106 number')],
    answer: 1,
  },
  {
    id: 'cortisol',
    q: B('¿Qué ayuda a bajar el cortisol (hormona del estrés)?', 'What helps lower cortisol (the stress hormone)?'),
    options: [B('Pasar tiempo al aire libre', 'Spending time outdoors'), B('Revisar el móvil en la cama', 'Scrolling phone in bed'), B('Dormir menos', 'Sleeping less'), B('Saltarte las comidas', 'Skipping meals')],
    answer: 0,
  },
  {
    id: 'luz',
    q: B('¿Cuánta luz solar por la mañana se recomienda?', 'How much morning sunlight is recommended?'),
    options: [B('15 minutos', '15 minutes'), B('3 horas', '3 hours'), B('Ninguna', 'None'), B('Solo en verano', 'Only in summer')],
    answer: 0,
  },
  {
    id: 'autocuidado',
    q: B('Cuidarte a ti mismo es…', 'Taking care of yourself is…'),
    options: [B('Ser egoísta', 'Being selfish'), B('Necesario para poder cuidar de otros', 'Necessary to be able to care for others'), B('Una moda', 'A trend'), B('Pérdida de tiempo', 'A waste of time')],
    answer: 1,
  },
]

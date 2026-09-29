export type ShareOutcome = 'shared' | 'copied' | 'failed'

const SHARE_URL = 'https://saludmental-five.vercel.app/'

export function buildShareText(score: number): string {
  return `Hice ${score} puntos en Memoria · Salud Mental 🌿 ¿Puedes superarme?`
}

export async function shareScore(score: number): Promise<ShareOutcome> {
  const text = buildShareText(score)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Memoria · Salud Mental', text, url: SHARE_URL })
      return 'shared'
    } catch {
      /* el usuario canceló o no soportó: seguimos con copiar */
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`)
      return 'copied'
    } catch {
      return 'failed'
    }
  }

  return 'failed'
}

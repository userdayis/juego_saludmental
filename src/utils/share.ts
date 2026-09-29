import type { Lang } from '../i18n'
import { translate } from '../i18n'

export type ShareOutcome = 'shared' | 'copied' | 'failed'

const SHARE_URL = 'https://saludmental-five.vercel.app/'

export function buildShareText(score: number, lang: Lang = 'es'): string {
  return translate(lang, 'share.text', { score })
}

export async function shareScore(score: number, lang: Lang = 'es'): Promise<ShareOutcome> {
  const text = buildShareText(score, lang)

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

export function buildChallengeUrl(seed: number, score: number): string {
  return `${SHARE_URL}?seed=${seed}&reto=${score}`
}

export async function shareChallenge(seed: number, score: number, lang: Lang = 'es'): Promise<ShareOutcome> {
  const url = buildChallengeUrl(seed, score)
  const text = translate(lang, 'share.challenge', { score })

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Memoria · Salud Mental', text, url })
      return 'shared'
    } catch {
      /* seguimos con copiar */
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      return 'copied'
    } catch {
      return 'failed'
    }
  }

  return 'failed'
}

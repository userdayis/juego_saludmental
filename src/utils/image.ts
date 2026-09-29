import type { Lang } from '../i18n'
import { translate } from '../i18n'
import type { ShareOutcome } from './share'

type ImageData = {
  score: number
  difficulty: string
  lang: Lang
}

export function drawResultCard(data: ImageData): HTMLCanvasElement | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
    gradient.addColorStop(0, '#2f9e76')
    gradient.addColorStop(1, '#1d6b52')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.arc(1020, 140, 220, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(140, 540, 180, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.font = 'bold 64px system-ui, sans-serif'
    ctx.fillText('🌿 Memoria · Salud Mental', 600, 180)

    ctx.font = 'bold 200px system-ui, sans-serif'
    ctx.fillText(String(data.score), 600, 400)

    ctx.font = '44px system-ui, sans-serif'
    ctx.fillText(translate(data.lang, 'share.cardLabel', { difficulty: data.difficulty }), 600, 490)

    ctx.font = '34px system-ui, sans-serif'
    ctx.fillText('saludmental-five.vercel.app', 600, 570)

    return canvas
  } catch {
    return null
  }
}

export async function shareResultImage(data: ImageData): Promise<ShareOutcome> {
  try {
    const canvas = drawResultCard(data)
    if (!canvas) return 'failed'

    const blob: Blob | null = await new Promise((resolve) => {
      if (typeof canvas.toBlob === 'function') canvas.toBlob(resolve, 'image/png')
      else resolve(null)
    })
    if (!blob) return 'failed'

    const file = new File([blob], 'memoria-salud-mental.png', { type: 'image/png' })
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }
    if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: 'Memoria · Salud Mental' })
      return 'shared'
    }

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'memoria-salud-mental.png'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

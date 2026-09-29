import type { Stats } from '../hooks/useStats'

const KEYS = [
  'salud-mental:stats',
  'salud-mental:records',
  'salud-mental:campaign',
  'salud-mental:checkin',
  'salud-mental:daily',
] as const

type Backup = { v: 1; exportedAt: string; data: Record<string, string> }

export function backupAll(): Backup {
  const data: Record<string, string> = {}
  try {
    for (const key of KEYS) {
      const value = localStorage.getItem(key)
      if (value) data[key] = value
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return { v: 1, exportedAt: new Date().toISOString(), data }
}

function triggerDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function downloadBackup(): void {
  triggerDownload(
    'salud-mental-backup.json',
    JSON.stringify(backupAll(), null, 2),
    'application/json',
  )
}

export async function restoreAll(file: File): Promise<boolean> {
  try {
    const text = await file.text()
    const parsed: unknown = JSON.parse(text)
    const backup = parsed as Partial<Backup>
    if (backup.v !== 1 || typeof backup.data !== 'object' || backup.data === null) return false
    for (const key of KEYS) {
      const value = backup.data[key]
      if (typeof value === 'string') localStorage.setItem(key, value)
    }
    return true
  } catch {
    return false
  }
}

export function downloadCsv(stats: Stats): void {
  const header = 'fecha,dificultad,modo,puntos,resultado,segundos'
  const rows = stats.history.map((entry) =>
    [entry.date, entry.difficulty, entry.mode, entry.score, entry.won ? 'ganada' : 'perdida', entry.seconds].join(','),
  )
  triggerDownload('salud-mental-partidas.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8')
}

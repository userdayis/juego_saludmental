export type SoundName = 'flip' | 'match' | 'miss' | 'win' | 'lose'

const STORAGE_KEY = 'salud-mental:sound'

let context: AudioContext | null = null
let enabled = true

if (typeof window !== 'undefined') {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) enabled = stored === 'true'
  } catch {
    enabled = true
  }
}

export function isSoundEnabled(): boolean {
  return enabled
}

export function setSoundEnabled(value: boolean): boolean {
  enabled = value
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    /* almacenamiento no disponible */
  }
  return enabled
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!context) context = new Ctor()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(ctx: AudioContext, freq: number, start: number, duration: number, volume: number) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(ctx.currentTime + start)
  oscillator.stop(ctx.currentTime + start + duration + 0.05)
}

const MELODIES: Record<SoundName, { freq: number; start: number; duration: number }[]> = {
  flip: [{ freq: 520, start: 0, duration: 0.08 }],
  match: [
    { freq: 587, start: 0, duration: 0.12 },
    { freq: 784, start: 0.08, duration: 0.16 },
  ],
  miss: [
    { freq: 260, start: 0, duration: 0.12 },
    { freq: 200, start: 0.09, duration: 0.16 },
  ],
  win: [
    { freq: 523, start: 0, duration: 0.14 },
    { freq: 659, start: 0.12, duration: 0.14 },
    { freq: 784, start: 0.24, duration: 0.14 },
    { freq: 1046, start: 0.36, duration: 0.3 },
  ],
  lose: [
    { freq: 392, start: 0, duration: 0.18 },
    { freq: 311, start: 0.15, duration: 0.2 },
    { freq: 233, start: 0.3, duration: 0.35 },
  ],
}

export function playSound(name: SoundName): void {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  for (const note of MELODIES[name]) {
    tone(ctx, note.freq, note.start, note.duration, 0.08)
  }
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* vibración no soportada */
  }
}

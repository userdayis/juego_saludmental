import { es } from './es'
import { en } from './en'

export type Lang = 'es' | 'en'
export type Bi = { es: string; en: string }

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
]

const KEY = 'salud-mental:lang'

const dicts: Record<Lang, Record<string, string>> = { es, en }

export function pick(value: Bi, lang: Lang): string {
  return value[lang] ?? value.es
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const raw = dicts[lang]?.[key] ?? dicts.es[key] ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match))
}

export function getLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl === 'en' || fromUrl === 'es') return fromUrl
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* almacenamiento no disponible */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = lang
}

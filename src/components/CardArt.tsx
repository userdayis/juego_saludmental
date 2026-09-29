import type { ReactNode } from 'react'

type CardArtProps = {
  itemId: string
  fallback: string
}

function svg(children: ReactNode) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="card__art"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const ACCENT = 'var(--accent)'

function artFor(itemId: string): ReactNode {
  switch (itemId) {
    case 'respiracion':
      return svg(
        <>
          <path d="M24 8v12" />
          <path d="M24 20c0 8-6 6-6 14s6 6 6 6" />
          <path d="M24 20c0 8 6 6 6 14s-6 6-6 6" />
          <path d="M18 26h-4a4 4 0 0 0-4 4c0 6 4 8 8 8" />
          <path d="M30 26h4a4 4 0 0 1 4 4c0 6-4 8-8 8" />
        </>,
      )
    case 'sueno':
      return svg(
        <>
          <path d="M30 6a16 16 0 1 0 12 26A18 18 0 0 1 30 6z" fill={ACCENT} stroke="none" />
          <path d="M34 34h6l-6 8h6" />
        </>,
      )
    case 'ejercicio':
      return svg(
        <>
          <rect x="6" y="18" width="6" height="12" rx="2" fill={ACCENT} stroke="none" />
          <rect x="36" y="18" width="6" height="12" rx="2" fill={ACCENT} stroke="none" />
          <rect x="12" y="14" width="6" height="20" rx="2" />
          <rect x="30" y="14" width="6" height="20" rx="2" />
          <path d="M18 24h12" />
        </>,
      )
    case 'meditacion':
      return svg(
        <>
          <circle cx="24" cy="12" r="5" fill={ACCENT} stroke="none" />
          <path d="M24 20v8" />
          <path d="M12 40c2-8 6-12 12-12s10 4 12 12" />
          <path d="M10 40h28" />
        </>,
      )
    case 'desconexion':
      return svg(
        <>
          <rect x="14" y="6" width="20" height="36" rx="4" />
          <path d="M20 36h8" />
          <path d="M8 8l32 32" stroke={ACCENT} />
        </>,
      )
    case 'hablar':
      return svg(
        <>
          <path d="M8 10h24a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H20l-8 6v-6h-4a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
          <path d="M24 30h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h-4l-6 4v-4" stroke={ACCENT} />
        </>,
      )
    case 'diario':
      return svg(
        <>
          <path d="M12 6h22a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H12z" />
          <path d="M12 6a4 4 0 0 0 0 8h4" />
          <path d="M18 20h12M18 27h12" stroke={ACCENT} />
        </>,
      )
    case 'naturaleza':
      return svg(
        <>
          <path d="M24 4l12 16H12z" fill={ACCENT} stroke="none" />
          <path d="M24 14l10 14H14z" fill={ACCENT} stroke="none" />
          <path d="M24 28v14" />
          <path d="M18 42h12" />
        </>,
      )
    case 'apoyo':
      return svg(
        <>
          <path
            d="M24 40S8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z"
            fill={ACCENT}
            stroke="none"
          />
          <path d="M24 16v10" stroke="#fff" />
          <path d="M19 21h10" stroke="#fff" />
        </>,
      )
    case 'alimentacion':
      return svg(
        <>
          <path d="M24 14c-8-6-16 0-16 10s8 18 16 18 16-8 16-18S32 8 24 14z" />
          <path d="M24 14V6" />
          <path d="M24 10c4-4 8-4 10-2-2 4-6 6-10 4" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'creatividad':
      return svg(
        <>
          <path d="M24 8a16 16 0 1 0 0 32c3 0 4-2 3-5-1-3 1-5 4-5h3a8 8 0 0 0 8-8c0-8-9-14-18-14z" />
          <circle cx="16" cy="20" r="2.5" fill={ACCENT} stroke="none" />
          <circle cx="26" cy="15" r="2.5" fill={ACCENT} stroke="none" />
          <circle cx="14" cy="30" r="2.5" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'limites':
      return svg(
        <>
          <path d="M24 6l14 6v10c0 10-6 16-14 20-8-4-14-10-14-20V12z" />
          <path d="M17 24l5 5 9-9" stroke={ACCENT} />
        </>,
      )
    case 'luz':
      return svg(
        <>
          <circle cx="24" cy="24" r="9" fill={ACCENT} stroke="none" />
          <path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5L37 37M37 11l-3.5 3.5M14.5 33.5L11 37" />
        </>,
      )
    case 'terapia':
      return svg(
        <>
          <path d="M6 34h36" />
          <path d="M8 34v-8a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v8" />
          <path d="M12 20v-4a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v4" stroke={ACCENT} />
          <path d="M12 34v4M36 34v4" />
        </>,
      )
    case 'musica':
      return svg(
        <>
          <path d="M18 34V12l18-4v22" />
          <circle cx="14" cy="34" r="4" fill={ACCENT} stroke="none" />
          <circle cx="32" cy="30" r="4" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'emociones':
      return svg(
        <>
          <circle cx="24" cy="24" r="17" />
          <circle cx="18" cy="20" r="2" fill="currentColor" stroke="none" />
          <circle cx="30" cy="20" r="2" fill="currentColor" stroke="none" />
          <path d="M17 30c3 3 11 3 14 0" stroke={ACCENT} />
        </>,
      )
    case 'rutina':
      return svg(
        <>
          <circle cx="24" cy="24" r="16" />
          <path d="M24 14v10l7 5" stroke={ACCENT} />
        </>,
      )
    case 'hidratacion':
      return svg(
        <>
          <path d="M24 6s12 14 12 22a12 12 0 0 1-24 0C12 20 24 6 24 6z" fill={ACCENT} stroke="none" />
          <path d="M19 30a5 5 0 0 0 5 5" stroke="#fff" />
        </>,
      )
    case 'risa':
      return svg(
        <>
          <circle cx="24" cy="24" r="17" />
          <path d="M15 18l4 3M33 18l-4 3" />
          <path d="M15 28a12 12 0 0 0 18 0z" fill={ACCENT} stroke="none" />
          <path d="M15 28h18" stroke="#fff" />
        </>,
      )
    case 'mascotas':
      return svg(
        <>
          <ellipse cx="24" cy="32" rx="9" ry="7" fill={ACCENT} stroke="none" />
          <circle cx="12" cy="20" r="4" fill="currentColor" stroke="none" />
          <circle cx="21" cy="14" r="4" fill="currentColor" stroke="none" />
          <circle cx="31" cy="14" r="4" fill="currentColor" stroke="none" />
          <circle cx="38" cy="20" r="4" fill="currentColor" stroke="none" />
        </>,
      )
    case 'gratitud':
      return svg(
        <>
          <path
            d="M24 40S8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z"
            fill={ACCENT}
            stroke="none"
          />
          <path d="M40 6l1.5 4L46 11.5 41.5 13 40 17l-1.5-4L34 11.5 38.5 10z" fill="#fff" stroke="none" />
        </>,
      )
    case 'pausa-activa':
      return svg(
        <>
          <circle cx="24" cy="10" r="5" fill={ACCENT} stroke="none" />
          <path d="M24 15v12M24 27l-8 12M24 27l8 12" />
          <path d="M12 20l12-4 12 4" />
        </>,
      )
    case 'objetivos':
      return svg(
        <>
          <circle cx="24" cy="24" r="16" />
          <circle cx="24" cy="24" r="9" stroke={ACCENT} />
          <circle cx="24" cy="24" r="3" fill={ACCENT} stroke="none" />
          <path d="M24 24l14-14M34 10h6v6" />
        </>,
      )
    case 'conversacion':
      return svg(
        <>
          <path d="M6 10h22a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H16l-6 5v-5H6a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z" />
          <path d="M34 18h6a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-2v5l-6-5h-6a4 4 0 0 1-4-4" stroke={ACCENT} />
        </>,
      )
    case 'estiramiento':
      return svg(
        <>
          <circle cx="24" cy="10" r="5" />
          <path d="M24 15v10M14 18l10-2 10 2M18 42l6-17 6 17" />
        </>,
      )
    case 'lectura':
      return svg(
        <>
          <path d="M24 12c-5-4-11-4-16-2v26c5-2 11-2 16 2 5-4 11-4 16-2V10c-5-2-11-2-16 2z" />
          <path d="M24 12v26" stroke={ACCENT} />
        </>,
      )
    case 'bailar':
      return svg(
        <>
          <circle cx="26" cy="10" r="5" fill={ACCENT} stroke="none" />
          <path d="M26 15l-6 10 6 6-4 10" />
          <path d="M20 25l-10 2M26 21l10 4" />
          <path d="M40 14c2 2 2 6 0 8M43 10c4 4 4 12 0 16" stroke={ACCENT} />
        </>,
      )
    case 'cocinar':
      return svg(
        <>
          <path d="M10 22h28v12a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" />
          <path d="M6 22h36" />
          <path d="M18 14c0-3 4-3 4-6M26 14c0-3 4-3 4-6" stroke={ACCENT} />
          <path d="M38 26h4a3 3 0 0 1 0 6h-4" />
        </>,
      )
    case 'silencio':
      return svg(
        <>
          <path d="M8 20h8l10-8v24l-10-8H8z" />
          <path d="M34 20l8 8M42 20l-8 8" stroke={ACCENT} />
        </>,
      )
    case 'abrazos':
      return svg(
        <>
          <path d="M10 26c-4-4-4-10 0-13s10-2 12 2l2 3 2-3c2-4 8-6 12-2s4 9 0 13" />
          <path d="M24 40S14 33 14 26" stroke={ACCENT} />
          <path d="M24 40s10-7 10-14" stroke={ACCENT} />
        </>,
      )
    case 'prioridades':
      return svg(
        <>
          <rect x="10" y="8" width="28" height="32" rx="4" />
          <path d="M16 17l3 3 5-6" stroke={ACCENT} />
          <path d="M26 17h8M16 28l3 3 5-6" stroke={ACCENT} />
          <path d="M26 28h8" />
        </>,
      )
    case 'pensamientos':
      return svg(
        <>
          <path d="M10 10h28a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H24l-8 7v-7h-6a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z" />
          <path d="M16 20c2-4 8-4 10 0 2-4 8-4 10 0-2 4-8 6-10 3-2 3-8 1-10-3z" stroke={ACCENT} />
        </>,
      )
    case 'victorias':
      return svg(
        <>
          <path d="M14 8h20v10a10 10 0 0 1-20 0z" fill={ACCENT} stroke="none" />
          <path d="M14 10h-4a6 6 0 0 0 6 8M34 10h4a6 6 0 0 1-6 8" />
          <path d="M24 28v6M17 40h14l-2-6H19z" />
        </>,
      )
    case 'descanso-visual':
      return svg(
        <>
          <path d="M6 24s7-10 18-10 18 10 18 10-7 10-18 10S6 24 6 24z" />
          <path d="M14 32l-2 6M24 34v6M34 32l2 6" stroke={ACCENT} />
          <circle cx="24" cy="24" r="4" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'juego':
      return svg(
        <>
          <rect x="6" y="16" width="36" height="20" rx="8" />
          <path d="M15 22v6M12 25h6" stroke={ACCENT} />
          <circle cx="32" cy="23" r="2.5" fill={ACCENT} stroke="none" />
          <circle cx="37" cy="28" r="2.5" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'cantar':
      return svg(
        <>
          <rect x="19" y="6" width="10" height="20" rx="5" fill={ACCENT} stroke="none" />
          <path d="M13 24a11 11 0 0 0 22 0" />
          <path d="M24 35v7M18 42h12" />
        </>,
      )
    case 'amistad':
      return svg(
        <>
          <circle cx="16" cy="16" r="6" />
          <circle cx="32" cy="16" r="6" stroke={ACCENT} />
          <path d="M6 40c0-8 4-12 10-12s10 4 10 12" />
          <path d="M22 40c0-8 4-12 10-12s10 4 10 12" stroke={ACCENT} />
        </>,
      )
    case 'ayudar':
      return svg(
        <>
          <path d="M8 34l8-8 6 6 8-12 10 14" />
          <path d="M30 12a5 5 0 0 1 8 5c0 4-8 9-8 9s-8-5-8-9a5 5 0 0 1 8-5z" fill={ACCENT} stroke="none" />
          <path d="M6 40h36" />
        </>,
      )
    case 'orden':
      return svg(
        <>
          <rect x="8" y="8" width="14" height="14" rx="3" fill={ACCENT} stroke="none" />
          <rect x="26" y="8" width="14" height="14" rx="3" />
          <rect x="8" y="26" width="14" height="14" rx="3" />
          <rect x="26" y="26" width="14" height="14" rx="3" fill={ACCENT} stroke="none" />
        </>,
      )
    case 'voluntariado':
      return svg(
        <>
          <path d="M14 42c0-6 4-10 10-10s10 4 10 10" />
          <path d="M24 34V22" stroke={ACCENT} />
          <path d="M24 14a6 6 0 0 1 6-6c4 0 6 4 4 7-2 3-10 8-10 8s-8-5-10-8c-2-3 0-7 4-7a6 6 0 0 1 6 6z" fill={ACCENT} stroke="none" />
        </>,
      )
    default:
      return null
  }
}

export function CardArt({ itemId, fallback }: CardArtProps) {
  const art = artFor(itemId)
  if (art) return art
  return (
    <span className="card__icon" aria-hidden="true">
      {fallback}
    </span>
  )
}

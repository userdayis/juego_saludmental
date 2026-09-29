import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { computeScore } from '../hooks/useGame'
import { buildShareText } from '../utils/share'

const TUTORIAL_KEY = 'salud-mental:tutorial-seen'

function startEasyGame(modeLabel?: string): HTMLElement {
  render(<App />)
  if (modeLabel) fireEvent.click(screen.getByRole('button', { name: modeLabel }))
  fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
  return screen.getByRole('grid')
}

function winEasyGame(): HTMLElement {
  const board = startEasyGame()
  for (const group of pairGroups(board)) {
    fireEvent.click(group[0])
    fireEvent.click(group[1])
  }
  return board
}

function pairGroups(grid: HTMLElement): HTMLButtonElement[][] {
  const groups = new Map<string, HTMLButtonElement[]>()
  within(grid)
    .getAllByRole('button')
    .forEach((button) => {
      const key = button.textContent ?? ''
      const list = groups.get(key) ?? []
      list.push(button as HTMLButtonElement)
      groups.set(key, list)
    })
  return [...groups.values()]
}

function faceDownCount(grid: HTMLElement): number {
  return within(grid)
    .getAllByRole('button')
    .filter((card) => card.getAttribute('aria-label') === 'Carta boca abajo').length
}

beforeEach(() => {
  localStorage.setItem(TUTORIAL_KEY, '1')
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  delete document.documentElement.dataset.theme
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('computeScore', () => {
  it('premia aciertos y penaliza intentos fallidos y el tiempo', () => {
    expect(computeScore(6, 6, 0)).toBe(1100)
    expect(computeScore(10, 6, 0)).toBe(1060)
    expect(computeScore(6, 6, 100)).toBe(1050)
    expect(computeScore(99, 0, 9999)).toBe(0)
  })

  it('sumas por tiempo restante en contra reloj y por vidas en modo vidas', () => {
    expect(computeScore(6, 6, 10, { mode: 'reloj', timeLimit: 90 })).toBe(600 + 80 * 10)
    expect(computeScore(6, 6, 10, { mode: 'vidas', lives: 5 })).toBe(600 + 495 + 5 * 50)
  })

  it('cobra 150 puntos por cada pista usada', () => {
    expect(computeScore(6, 6, 0, { hintsUsed: 1 })).toBe(950)
    expect(computeScore(6, 6, 0, { hintsUsed: 3 })).toBe(650)
  })
})

describe('juego de memoria', () => {
  it('inicia con 12 cartas y 6 pares distintos', () => {
    const board = startEasyGame()
    expect(within(board).getAllByRole('button')).toHaveLength(12)
    expect(pairGroups(board)).toHaveLength(6)
    expect(faceDownCount(board)).toBe(12)
    expect(screen.getByText('0/6')).toBeInTheDocument()
  })

  it('encuentra todos los pares y muestra el resultado con tips y ayuda', () => {
    const board = startEasyGame()

    for (const group of pairGroups(board)) {
      expect(group).toHaveLength(2)
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }

    expect(screen.getByText('6/6')).toBeInTheDocument()
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/¡Muy bien!/)).toBeInTheDocument()
    expect(dialog.getByText('Para llevar')).toBeInTheDocument()
    expect(dialog.getByText('¿Necesitas hablar con alguien?')).toBeInTheDocument()
    const helpLinks = screen
      .getAllByRole('link')
      .filter((link) => (link.textContent ?? '').trim().startsWith('Línea 106'))
    expect(helpLinks.length).toBeGreaterThan(0)
    for (const link of helpLinks) {
      expect(link).toHaveAttribute('href', 'tel:106')
    }
    expect(dialog.getByRole('button', { name: 'Jugar otra vez' })).toBeInTheDocument()
  })

  it('vuelve a tapar las cartas si no coinciden y anuncia el fallo', () => {
    vi.useFakeTimers()
    const board = startEasyGame()
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    expect(screen.getByRole('status')).toHaveTextContent('Carta volteada:')

    fireEvent.click(groups[1][0])
    expect(faceDownCount(board)).toBe(10)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('No coinciden.')

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(faceDownCount(board)).toBe(12)
    expect(screen.queryByText(/¡Muy bien!/)).not.toBeInTheDocument()
  })

  it('las cartas emparejadas quedan inactivas pero siguen enfocables', () => {
    const board = startEasyGame()
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    fireEvent.click(groups[0][1])

    const matched = [groups[0][0], groups[0][1]]
    for (const card of matched) {
      expect(card).toHaveAttribute('aria-disabled', 'true')
      expect(card).not.toBeDisabled()
      card.focus()
      expect(card).toHaveFocus()
    }
    expect(screen.getByRole('status')).toHaveTextContent('Par encontrado:')
  })

  it('pierde cuando se acaba el tiempo en modo contra reloj', () => {
    vi.useFakeTimers()
    startEasyGame('Contra reloj')
    expect(screen.getByText('Restante')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(95_000)
    })

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/Se acabó el tiempo/)).toBeInTheDocument()
    expect(dialog.queryByText(/¡Muy bien!/)).not.toBeInTheDocument()
  })

  it('pierde las vidas al fallar demasiadas veces', () => {
    vi.useFakeTimers()
    const board = startEasyGame('Vidas')
    const groups = pairGroups(board)

    for (let attempt = 0; attempt < 7; attempt++) {
      fireEvent.click(groups[0][0])
      fireEvent.click(groups[1][0])
      act(() => {
        vi.advanceTimersByTime(900)
      })
    }

    expect(screen.getByText('❤️ 0')).toBeInTheDocument()
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/Sin vidas/)).toBeInTheDocument()
    expect(faceDownCount(board)).toBe(12)
  })

  it('mantiene las dos cartas visibles y la vida intacta hasta el segundo del fallo', () => {
    vi.useFakeTimers()
    const board = startEasyGame('Vidas')
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    fireEvent.click(groups[1][0])
    expect(faceDownCount(board)).toBe(10)
    expect(screen.getByText('❤️ 7')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(faceDownCount(board)).toBe(10)
    expect(screen.getByText('❤️ 7')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(faceDownCount(board)).toBe(12)
    expect(screen.getByText('❤️ 6')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('guarda el récord por dificultad y modo', () => {
    const board = startEasyGame()
    for (const group of pairGroups(board)) {
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }
    const saved: Record<string, { score: number }> = JSON.parse(
      localStorage.getItem('salud-mental:records') ?? '{}',
    )
    expect(saved['facil:clasico']).toBeDefined()
    expect(saved['facil:clasico'].score).toBeGreaterThan(0)
  })

  it('migra el récord antiguo al nuevo formato', () => {
    localStorage.setItem(
      'salud-mental:highscore',
      JSON.stringify({ score: 777, seconds: 42, moves: 12 }),
    )
    render(<App />)

    const saved: Record<string, { score: number }> = JSON.parse(
      localStorage.getItem('salud-mental:records') ?? '{}',
    )
    expect(saved['normal:clasico']?.score).toBe(777)
    expect(localStorage.getItem('salud-mental:highscore')).toBeNull()
  })

  it('cambia el tema oscuro y lo persiste', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).not.toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('salud-mental:theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('alterna el sonido y lo persiste', () => {
    const board = startEasyGame()
    const toggle = screen.getByRole('button', { name: 'Desactivar sonido' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Activar sonido' })).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('salud-mental:sound')).toBe('false')
    expect(pairGroups(board)).toHaveLength(6)
  })
})

describe('pistas', () => {
  it('destapa un par gratis, anuncia la pista y descuenta una pista', () => {
    vi.useFakeTimers()
    const board = startEasyGame()
    const hint = screen.getByRole('button', { name: '💡 Pista (3)' })
    expect(hint).not.toBeDisabled()

    fireEvent.click(hint)

    expect(faceDownCount(board)).toBe(10)
    expect(screen.getByRole('status')).toHaveTextContent('Pista: te falta el par de')
    const hinted = within(board)
      .getAllByRole('button')
      .filter((card) => card.className.includes('card--hint'))
    expect(hinted).toHaveLength(2)
    expect(screen.getByRole('button', { name: '💡 Pista (2)' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(faceDownCount(board)).toBe(12)
  })

  it('no deja usar la pista con cartas volteadas ni sin pistas restantes', () => {
    vi.useFakeTimers()
    const board = startEasyGame()
    const hint = () => screen.getByRole('button', { name: /Pista/ })

    fireEvent.click(pairGroups(board)[0][0])
    expect(hint()).toBeDisabled()

    fireEvent.click(pairGroups(board)[1][0])
    act(() => {
      vi.advanceTimersByTime(900)
    })
    expect(hint()).not.toBeDisabled()

    fireEvent.click(hint())
    expect(screen.getByRole('button', { name: '💡 Pista (2)' })).toBeInTheDocument()
    expect(hint()).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1600)
    })
    fireEvent.click(hint())
    expect(screen.getByRole('button', { name: '💡 Pista (1)' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1600)
    })
    fireEvent.click(hint())
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(screen.getByRole('button', { name: '💡 Pista (0)' })).toBeInTheDocument()
    expect(hint()).toBeDisabled()
  })
})

describe('estadísticas y logros', () => {
  it('registra la partida ganada en estadísticas y desbloquea logros', () => {
    winEasyGame()

    const saved: {
      games: number
      wins: number
      pairs: number
      achievements: string[]
    } = JSON.parse(localStorage.getItem('salud-mental:stats') ?? '{}')
    expect(saved.games).toBe(1)
    expect(saved.wins).toBe(1)
    expect(saved.pairs).toBe(6)
    expect(saved.achievements).toContain('primera-victoria')
    expect(saved.achievements).toContain('partida-perfecta')
  })

  it('muestra el aviso de logro desbloqueado', async () => {
    winEasyGame()

    const toastTitle = await screen.findByText('¡Logro desbloqueado!')
    const toast = toastTitle.closest('.toast')
    expect(toast).toHaveTextContent('Primera victoria')
    expect(toast).toHaveTextContent('Completa tu primera partida')
  })

  it('abre el panel de estadísticas con logros', () => {
    winEasyGame()

    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const dialog = screen.getByRole('dialog', { name: 'Estadísticas' })
    expect(within(dialog).getByText(/Tus estadísticas/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Logros \(3\/8\)/)).toBeInTheDocument()
    expect(within(dialog).getByText('Primera victoria')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog', { name: 'Estadísticas' })).not.toBeInTheDocument()
  })

  it('conserva las estadísticas entre partidas', () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
    const board = screen.getByRole('grid')
    for (const group of pairGroups(board)) {
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }
    view.unmount()

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const dialog = screen.getByRole('dialog', { name: 'Estadísticas' })
    expect(within(dialog).getByText(/Logros \(3\/8\)/)).toBeInTheDocument()
  })
})

describe('compartir', () => {
  it('construye el texto de compartir', () => {
    expect(buildShareText(1100)).toContain('1100 puntos')
    expect(buildShareText(1100)).toContain('Memoria · Salud Mental')
  })

  it('copia el resultado al portapapeles si no hay API de compartir', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    winEasyGame()
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))

    expect(await screen.findByRole('button', { name: '¡Copiado!' })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('saludmental-five.vercel.app'))
  })

  it('marca fallo si no hay forma de compartir', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    winEasyGame()
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))

    expect(await screen.findByRole('button', { name: 'No se pudo' })).toBeInTheDocument()
  })
})

describe('tutorial', () => {
  it('muestra el tutorial en la primera visita y lo guarda al cerrarlo', () => {
    localStorage.removeItem(TUTORIAL_KEY)
    render(<App />)

    const dialog = screen.getByRole('dialog', { name: 'Cómo se juega' })
    expect(within(dialog).getByText(/Voltea dos cartas/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }))
    expect(within(dialog).getByText(/Llévate un tip/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '¡Entendido!' }))

    expect(localStorage.getItem(TUTORIAL_KEY)).toBe('1')
    expect(screen.queryByRole('dialog', { name: 'Cómo se juega' })).not.toBeInTheDocument()
  })

  it('no vuelve a mostrar el tutorial en visitas posteriores', () => {
    render(<App />)
    expect(screen.queryByRole('dialog', { name: 'Cómo se juega' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cómo se juega' }))
    expect(screen.getByRole('dialog', { name: 'Cómo se juega' })).toBeInTheDocument()
  })
})

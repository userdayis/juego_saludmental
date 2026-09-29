import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { finalBonus, multiplierFor, timeBonus } from '../hooks/useGame'
import { buildShareText } from '../utils/share'
import { todayISO } from '../utils/format'

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

function statByLabel(label: string): HTMLElement {
  const el = screen
    .getAllByText(label)
    .map((node) => node.closest('.stat'))
    .find(Boolean)
  if (!el) throw new Error(`stat "${label}" not found`)
  return el as HTMLElement
}

function scoreValue(): string {
  const stats = screen.getAllByText('Puntos').map((node) => node.closest('.stat') as HTMLElement)
  const score = stats.find((el) => !(el.textContent ?? '').includes('Racha'))
  return (score?.querySelector('.stat__value')?.textContent ?? '').trim()
}

function boardLabels(grid: HTMLElement): string[] {
  return within(grid)
    .getAllByRole('button')
    .map((card) => card.getAttribute('aria-label') ?? '')
}

beforeEach(() => {
  localStorage.setItem(TUTORIAL_KEY, '1')
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
  delete document.documentElement.dataset.theme
  Reflect.deleteProperty(navigator, 'clipboard')
  window.history.replaceState({}, '', '/')
})

describe('puntuación', () => {
  it('multiplica por la racha de aciertos consecutivos', () => {
    expect(multiplierFor(0)).toBe(1)
    expect(multiplierFor(1)).toBe(1)
    expect(multiplierFor(2)).toBe(2)
    expect(multiplierFor(4)).toBe(2)
    expect(multiplierFor(5)).toBe(3)
  })

  it('calcula el bono de tiempo y el bono final por modo', () => {
    expect(timeBonus('reloj', 10, 90)).toBe(80 * 10)
    expect(timeBonus('clasico', 10, 0)).toBe(500 - 5)
    expect(finalBonus({ mode: 'vidas', seconds: 10, timeLimit: 0, lives: 5 })).toBe(495 + 250)
    expect(finalBonus({ mode: 'zen', seconds: 0, timeLimit: 0, lives: null })).toBe(500)
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
    expect(within(dialog).getByText(/Logros \(4\/16\)/)).toBeInTheDocument()
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
    expect(within(dialog).getByText(/Logros \(4\/16\)/)).toBeInTheDocument()
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

describe('comodín y racha', () => {
  it('usa el comodín una sola vez por partida', () => {
    startEasyGame()
    const wild = screen.getByRole('button', { name: '🎁 Comodín' })
    expect(wild).not.toBeDisabled()

    fireEvent.click(wild)

    expect(screen.getByText('1/6')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🎁 Comodín' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Comodín usado: par')
  })

  it('suma puntos y activa el multiplicador tras aciertos seguidos', () => {
    const board = startEasyGame()
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    fireEvent.click(groups[0][1])
    expect(scoreValue()).toBe('100')

    fireEvent.click(groups[1][0])
    fireEvent.click(groups[1][1])
    expect(scoreValue()).toBe('300')
    expect(screen.getByText(/Racha ×2/)).toBeInTheDocument()
  })
})

describe('modo zen', () => {
  it('no aplica multiplicadores ni vidas', () => {
    const board = startEasyGame('Zen')
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    fireEvent.click(groups[0][1])
    fireEvent.click(groups[1][0])
    fireEvent.click(groups[1][1])

    expect(scoreValue()).toBe('200')
    expect(screen.queryByText(/❤️/)).not.toBeInTheDocument()
  })
})

describe('dificultad experto', () => {
  it('inicia con 24 pares y 48 cartas', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Experto · 24 pares' }))

    const board = screen.getByRole('grid')
    expect(within(board).getAllByRole('button')).toHaveLength(48)
    expect(screen.getByText('0/24')).toBeInTheDocument()
  })
})

describe('partida guardada', () => {
  it('guarda la partida en curso y permite continuarla con el mismo mazo', () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
    const board = screen.getByRole('grid')
    fireEvent.click(within(board).getAllByRole('button')[0])
    const before = boardLabels(board)

    view.unmount()
    expect(localStorage.getItem('salud-mental:session')).not.toBeNull()

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '▶ Continuar partida guardada' }))
    const resumed = screen.getByRole('grid')
    expect(boardLabels(resumed)).toEqual(before)
    expect(screen.queryByText('¿Listo para entrenar la memoria?')).not.toBeInTheDocument()
  })
})

describe('panel de estadísticas ampliado', () => {
  it('muestra nivel, historial, heatmap y metas tras una victoria', () => {
    winEasyGame()

    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const dialog = screen.getByRole('dialog', { name: 'Estadísticas' })

    expect(within(dialog).getByText('Nivel: Practicante (485 XP)')).toBeInTheDocument()
    expect(within(dialog).getByText(/Últimas partidas/)).toBeInTheDocument()
    expect(within(dialog).getByText('ganó')).toBeInTheDocument()
    expect(within(dialog).getByText(/Juega 3 partidas \(1\/3\)/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Encuentra 50 pares \(6\/50\)/)).toBeInTheDocument()
    expect(within(dialog).getAllByTitle(/^\d{4}-\d{2}-\d{2}$/)).toHaveLength(210)
  })

  it('exporta CSV y JSON generando un blob', () => {
    winEasyGame()
    const createObjectURL = vi.fn(() => 'blob:fake')
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
      writable: true,
    })
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const dialog = screen.getByRole('dialog', { name: 'Estadísticas' })
    fireEvent.click(within(dialog).getByRole('button', { name: '⬇ CSV' }))
    fireEvent.click(within(dialog).getByRole('button', { name: '⬇ Exportar JSON' }))

    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(clickSpy).toHaveBeenCalledTimes(2)

    clickSpy.mockRestore()
    delete (URL as { createObjectURL?: unknown }).createObjectURL
  })

  it('borra todo el progreso con confirmación', () => {
    winEasyGame()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const dialog = screen.getByRole('dialog', { name: 'Estadísticas' })
    fireEvent.click(within(dialog).getByRole('button', { name: '🗑 Borrar todo' }))

    expect(localStorage.getItem('salud-mental:stats')).toBeNull()
    expect(screen.queryByRole('dialog', { name: 'Estadísticas' })).not.toBeInTheDocument()
  })
})

describe('reto del día', () => {
  it('muestra completado el reto del día de hoy', () => {
    localStorage.setItem(
      'salud-mental:daily',
      JSON.stringify({ date: todayISO(), done: true }),
    )
    render(<App />)
    expect(screen.getByRole('button', { name: '📅 ✅ Reto del día' })).toBeInTheDocument()
  })

  it('al ganar la baraja del día lo marca como hecho', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Reto del día/ }))
    const board = screen.getByRole('grid')
    for (const group of pairGroups(board)) {
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }

    const saved = JSON.parse(localStorage.getItem('salud-mental:daily') ?? '{}') as {
      date?: string
      done?: boolean
    }
    expect(saved.done).toBe(true)
    expect(saved.date).toBe(todayISO())
  })
})

describe('check-in diario', () => {
  it('registra el ánimo del día y lo cuenta en estadísticas', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Me siento bien' }))

    expect(screen.getByText('¡Registrado! Vuelve mañana.')).toBeInTheDocument()
    const saved = JSON.parse(localStorage.getItem('salud-mental:stats') ?? '{}') as {
      checkins?: number
    }
    expect(saved.checkins).toBe(1)
  })
})

describe('bienestar en partida', () => {
  it('abre la respiración guiada y la cierra', () => {
    startEasyGame()
    fireEvent.click(screen.getByRole('button', { name: 'Pausa consciente: respiración guiada' }))

    const dialog = screen.getByRole('dialog', { name: 'Pausa consciente: respiración guiada' })
    expect(within(dialog).getByText('Inhala por la nariz')).toBeInTheDocument()
    expect(within(dialog).getByText('Ciclos completados: 0')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Listo, gracias' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre los primeros auxilios con la Línea 106', () => {
    startEasyGame()
    fireEvent.click(screen.getByRole('button', { name: 'Primeros auxilios emocionales' }))

    const dialog = screen.getByRole('dialog', { name: 'Primeros auxilios emocionales' })
    expect(within(dialog).getByText(/Escucha sin interrumpir/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Si hay riesgo inmediato/)).toBeInTheDocument()
    const helpLinks = within(dialog)
      .getAllByRole('link')
      .filter((link) => (link.textContent ?? '').includes('Línea 106'))
    expect(helpLinks.length).toBeGreaterThan(0)
  })
})

describe('mini quiz', () => {
  it('juega tres preguntas tras ganar y cierra con el resultado', () => {
    winEasyGame()
    fireEvent.click(screen.getByRole('button', { name: '🧠 Quiz' }))

    const dialog = screen.getByRole('dialog', { name: 'Quiz' })
    expect(within(dialog).getByText('Pregunta 1 de 3')).toBeInTheDocument()

    for (let round = 0; round < 3; round++) {
      const options = within(dialog)
        .getAllByRole('button')
        .filter((button) => button.className.includes('quiz__option'))
      expect(options).toHaveLength(4)
      fireEvent.click(options[0])
      expect(within(dialog).getByText(/¡Correcto!|No: la respuesta era/)).toBeInTheDocument()
      fireEvent.click(
        within(dialog).getByRole('button', {
          name: round === 2 ? 'Terminar' : 'Siguiente',
        }),
      )
    }

    expect(within(dialog).getByText(/Acertaste \d de 3/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog', { name: 'Quiz' })).not.toBeInTheDocument()

    const saved = JSON.parse(localStorage.getItem('salud-mental:stats') ?? '{}') as {
      quizCorrect?: number
    }
    expect(saved.quizCorrect).toBeDefined()
  })
})

describe('campaña', () => {
  it('lista 10 etapas con solo la primera desbloqueada', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Campaña/ }))

    const dialog = screen.getByRole('dialog', { name: 'Campaña de retos' })
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(10)
    const stageButtons = within(dialog)
      .getAllByRole('button')
      .filter((button) => button.className.includes('stage__btn'))
    expect(stageButtons).toHaveLength(10)
    expect(stageButtons.filter((button) => (button as HTMLButtonElement).disabled)).toHaveLength(9)
  })

  it('juega la etapa 1 con sus cartas fijas', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Campaña/ }))
    const dialog = screen.getByRole('dialog', { name: 'Campaña de retos' })
    const firstStage = within(dialog)
      .getAllByRole('button')
      .filter((button) => button.className.includes('stage__btn'))[0]
    fireEvent.click(firstStage)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('0/3')).toBeInTheDocument()
  })
})

describe('certificado', () => {
  it('muestra el certificado cuando se completaron las 10 etapas', () => {
    localStorage.setItem(
      'salud-mental:stats',
      JSON.stringify({
        games: 12,
        wins: 12,
        losses: 0,
        streak: 4,
        bestStreak: 4,
        pairs: 140,
        perfect: 6,
        bestTime: 30,
        achievements: [],
        daysPlayed: [],
        history: [],
        quizCorrect: 6,
        stagesDone: 10,
        checkins: 5,
      }),
    )
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver estadísticas y logros' }))
    const statsDialog = screen.getByRole('dialog', { name: 'Estadísticas' })
    fireEvent.click(within(statsDialog).getByRole('button', { name: '📜 Certificado' }))

    const cert = screen.getByRole('dialog', { name: '📜 Certificado de bienestar' })
    expect(within(cert).getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(within(cert).getByText(/completó la campaña de 10 etapas/)).toBeInTheDocument()
  })
})

describe('retos y parámetros de URL', () => {
  it('muestra el reto con ?reto y lo marca al superarlo', () => {
    window.history.replaceState({}, '', '/?reto=100')
    render(<App />)
    expect(screen.getByText(/Reto: supera 100 puntos/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
    const board = screen.getByRole('grid')
    for (const group of pairGroups(board)) {
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('🏆 ¡Reto superado!')).toBeInTheDocument()
  })

  it('genera siempre el mismo mazo con ?seed', () => {
    window.history.replaceState({}, '', '/?seed=42')

    const first = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
    const firstLabels = boardLabels(screen.getByRole('grid'))
    first.unmount()

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
    expect(boardLabels(screen.getByRole('grid'))).toEqual(firstLabels)
    expect(firstLabels.filter((label) => label === 'Carta boca abajo')).toHaveLength(12)
  })

  it('activa el modo aula con ?kiosk=1', () => {
    window.history.replaceState({}, '', '/?kiosk=1')
    render(<App />)

    expect(document.querySelector('.app--kiosk')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Dificultad' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver estadísticas y logros' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salir del modo aula' })).toBeInTheDocument()
  })
})

describe('i18n', () => {
  it('alterna entre inglés y español', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar idioma' }))

    expect(screen.getByRole('heading', { name: 'Ready to train your memory?' })).toBeInTheDocument()
    expect(localStorage.getItem('salud-mental:lang')).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: 'Change language' }))
    expect(screen.getByRole('heading', { name: '¿Listo para entrenar la memoria?' })).toBeInTheDocument()
  })
})

describe('límite de errores', () => {
  it('muestra la pantalla de error ante una excepción', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Bomb(): never {
      throw new Error('boom')
    }

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo salió mal 😕')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
    spy.mockRestore()
  })
})

describe('imagen para compartir', () => {
  it('informa fallo si el navegador no puede generar la imagen', async () => {
    winEasyGame()
    fireEvent.click(screen.getByRole('button', { name: '🖼️ Imagen' }))

    expect(await screen.findByRole('button', { name: 'No se pudo' })).toBeInTheDocument()
  })
})

describe('modo duelo', () => {
  it('cambia el turno cuando falla un jugador', () => {
    vi.useFakeTimers()
    const board = startEasyGame('Duelo')
    expect(statByLabel('Turno')).toHaveTextContent('1')

    const groups = pairGroups(board)
    fireEvent.click(groups[0][0])
    fireEvent.click(groups[1][0])
    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(statByLabel('Turno')).toHaveTextContent('2')
  })
})

describe('música ambiental', () => {
  it('la activa y la persiste', () => {
    startEasyGame()
    const toggle = screen.getByRole('button', { name: 'Música ambiental' })
    expect(toggle.className).not.toContain('btn--on')

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Música ambiental' }).className).toContain('btn--on')
    expect(localStorage.getItem('salud-mental:ambient')).toBe('true')
  })
})

describe('confeti', () => {
  it('muestra confeti en la pantalla de victoria', () => {
    winEasyGame()
    expect(document.querySelector('[data-confetti]')).toBeInTheDocument()
  })
})


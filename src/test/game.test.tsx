import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { computeScore } from '../hooks/useGame'

function startEasyGame(modeLabel?: string): HTMLElement {
  render(<App />)
  if (modeLabel) fireEvent.click(screen.getByRole('button', { name: modeLabel }))
  fireEvent.click(screen.getByRole('button', { name: 'Fácil · 6 pares' }))
  return screen.getByRole('grid')
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

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  delete document.documentElement.dataset.theme
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

    for (let life = 6; life >= 0; life--) {
      fireEvent.click(groups[0][0])
      fireEvent.click(groups[1][0])
      expect(screen.getByText(`❤️ ${life}`)).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(900)
      })
    }

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/Sin vidas/)).toBeInTheDocument()
    expect(faceDownCount(board)).toBe(12)
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

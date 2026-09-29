import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { computeScore } from '../hooks/useGame'

function startEasyGame(): HTMLElement {
  render(<App />)
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
})

describe('computeScore', () => {
  it('premia aciertos y penaliza intentos fallidos y el tiempo', () => {
    expect(computeScore(6, 6, 0)).toBe(1100)
    expect(computeScore(10, 6, 0)).toBe(1060)
    expect(computeScore(6, 6, 100)).toBe(1050)
    expect(computeScore(99, 0, 9999)).toBe(0)
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

  it('encuentra todos los pares y muestra el resultado con tips', () => {
    const board = startEasyGame()

    for (const group of pairGroups(board)) {
      expect(group).toHaveLength(2)
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }

    expect(screen.getByText('6/6')).toBeInTheDocument()
    expect(screen.getByText(/¡Muy bien!/)).toBeInTheDocument()
    expect(screen.getByText('Para llevar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jugar otra vez' })).toBeInTheDocument()
  })

  it('vuelve a tapar las cartas si no coinciden', () => {
    vi.useFakeTimers()
    const board = startEasyGame()
    const groups = pairGroups(board)

    fireEvent.click(groups[0][0])
    fireEvent.click(groups[1][0])

    expect(faceDownCount(board)).toBe(10)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0/6')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(faceDownCount(board)).toBe(12)
    expect(screen.queryByText(/¡Muy bien!/)).not.toBeInTheDocument()
  })

  it('guarda el récord en localStorage al ganar', () => {
    const board = startEasyGame()
    for (const group of pairGroups(board)) {
      fireEvent.click(group[0])
      fireEvent.click(group[1])
    }
    const saved = JSON.parse(localStorage.getItem('salud-mental:highscore') ?? 'null')
    expect(saved).not.toBeNull()
    expect(saved.score).toBeGreaterThan(0)
  })
})

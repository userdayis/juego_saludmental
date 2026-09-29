import type { CSSProperties } from 'react'
import { getItemById } from '../data/cards'
import type { DeckCard } from '../hooks/useGame'
import { Card } from './Card'

type BoardProps = {
  deck: DeckCard[]
  flipped: number[]
  matched: Set<string>
  locked: boolean
  onFlip: (index: number) => void
}

export function Board({ deck, flipped, matched, locked, onFlip }: BoardProps) {
  if (deck.length === 0) return null
  const columns = deck.length <= 12 ? 3 : deck.length <= 18 ? 4 : 5

  return (
    <div
      className="board"
      style={{ '--board-columns': columns } as CSSProperties}
      role="grid"
      aria-label="Tablero de memoria"
    >
      {deck.map((card, index) => {
        const item = getItemById(card.itemId)
        if (!item) return null
        return (
          <Card
            key={card.key}
            icon={item.icon}
            label={item.label}
            flipped={flipped.includes(index)}
            matched={matched.has(card.itemId)}
            locked={locked || flipped.length >= 2}
            onClick={() => onFlip(index)}
          />
        )
      })}
    </div>
  )
}

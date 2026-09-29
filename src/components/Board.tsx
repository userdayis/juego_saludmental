import type { CSSProperties } from 'react'
import { getItemById, itemLabel } from '../data/cards'
import type { DeckCard } from '../hooks/useGame'
import { useI18n } from '../i18n/context'
import { Card } from './Card'

type BoardProps = {
  deck: DeckCard[]
  flipped: number[]
  matched: Set<string>
  hintOpen: boolean
  locked: boolean
  onFlip: (index: number) => void
}

export function Board({ deck, flipped, matched, hintOpen, locked, onFlip }: BoardProps) {
  const { t, lang } = useI18n()
  if (deck.length === 0) return null
  const columns = deck.length <= 12 ? 3 : deck.length <= 18 ? 4 : deck.length <= 24 ? 5 : 6

  return (
    <div
      className="board"
      style={{ '--board-columns': columns } as CSSProperties}
      role="grid"
      aria-label={t('aria.board')}
    >
      {deck.map((card, index) => {
        const item = getItemById(card.itemId)
        if (!item) return null
        return (
          <Card
            key={card.key}
            itemId={item.id}
            icon={item.icon}
            label={itemLabel(item, lang)}
            flipped={flipped.includes(index)}
            matched={matched.has(card.itemId)}
            hinted={hintOpen && flipped.includes(index)}
            locked={locked || flipped.length >= 2}
            onClick={() => onFlip(index)}
          />
        )
      })}
    </div>
  )
}

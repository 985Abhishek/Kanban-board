import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Card, useBoardContext } from '../context/boardContext';
import { KanbanCard } from './KanbanCard';

type KanbanColumnProps = {
  column: Column;
  cards: Card[];
};

export const KanbanColumn = ({ column, cards }: KanbanColumnProps) => {
  const { addCard } = useBoardContext();

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.order - b.order),
    [cards]
  );

  return (
    <section className="kanban-column">
      <header className="kanban-column-header" style={{ borderColor: column.accent }}>
        <div>
          <h2>{column.title}</h2>
          <span>{sortedCards.length} cards</span>
        </div>
        <button type="button" className="column-add" onClick={() => addCard(column.id)}>
          + Add Card
        </button>
      </header>
      <div className="kanban-column-body">
        <SortableContext items={sortedCards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map(card => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
};


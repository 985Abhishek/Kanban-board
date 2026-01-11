import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { useBoardContext, BoardProvider, ColumnId, Card } from '../context/boardContext';
import { KanbanColumn } from './KanbanColumn';

const BoardShell = () => {
  const { columns, cards, moveCard } = useBoardContext();
  const [activeId, setActiveId] = useState<string | null>(null);

  const cardsByColumn = useMemo(() => {
    return columns.reduce<Record<ColumnId, Card[]>>((acc, column) => {
      acc[column.id] = cards
        .filter(card => card.columnId === column.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<ColumnId, Card[]>);
  }, [cards, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const activeCard = cards.find(card => card.id === active.id);
    if (!activeCard) {
      return;
    }
    const destinationColumnId = cards.find(card => card.id === over.id)?.columnId ?? activeCard.columnId;
    const destinationCards = cardsByColumn[destinationColumnId] ?? [];
    const overIndex = destinationCards.findIndex(card => card.id === over.id);
    const insertIndex = overIndex === -1 ? destinationCards.length : overIndex;
    moveCard(activeCard.id, destinationColumnId, insertIndex);
  };

  const activeCard = activeId ? cards.find(card => card.id === activeId) : null;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Project</p>
          <h1>Kanban Board</h1>
        </div>
        <p className="app-description">Drag cards between phases, add new work, or keep track of completed tasks.</p>
      </header>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map(column => (
            <KanbanColumn key={column.id} column={column} cards={cardsByColumn[column.id] ?? []} />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <article className="kanban-card card-overlay">
              <div className="kanban-card-body">
                <div className="kanban-card-handle">
                  <span />
                </div>
                <div className="kanban-card-text">
                  <p>{activeCard.title}</p>
                </div>
              </div>
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
};

export const KanbanBoard = () => (
  <BoardProvider>
    <BoardShell />
  </BoardProvider>
);


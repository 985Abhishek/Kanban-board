import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, useBoardContext } from '../context/boardContext';

type KanbanCardProps = {
  card: Card;
};

export const KanbanCard = ({ card, isDragging = false }: KanbanCardProps) => {
  const { updateCardTitle, deleteCard } = useBoardContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: card.id });
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(card.title);

  useEffect(() => {
    setValue(card.title);
  }, [card.title]);

  const saveTitle = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== card.title) {
      updateCardTitle(card.id, trimmed);
    } else {
      setValue(card.title);
    }
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article className="kanban-card" ref={setNodeRef} style={style}>
      <div className="kanban-card-body">
        <div className="kanban-card-handle" {...attributes} {...listeners}>
          <span />
        </div>
        <div className="kanban-card-text" onDoubleClick={() => setIsEditing(true)}>
          {isEditing ? (
            <input
              autoFocus
              className="card-input"
              value={value}
              onChange={event => setValue(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  saveTitle();
                } else if (event.key === 'Escape') {
                  setValue(card.title);
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <p>{card.title}</p>
          )}
        </div>
      </div>
      <button type="button" className="kanban-card-delete" onClick={() => deleteCard(card.id)}>
        ×
      </button>
    </article>
  );
};


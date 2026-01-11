import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

export type ColumnId = 'todo' | 'in-progress' | 'done';

export type Column = {
  id: ColumnId;
  title: string;
  accent: string;
};

export type Card = {
  id: string;
  title: string;
  columnId: ColumnId;
  order: number;
};

const columnDefinitions: Column[] = [
  { id: 'todo', title: 'Todo', accent: '#1e88e5' },
  { id: 'in-progress', title: 'In Progress', accent: '#fb8c00' },
  { id: 'done', title: 'Done', accent: '#43a047' }
];

const initialCards: Card[] = [
  { id: 'card-1', title: 'Create initial project plan', columnId: 'todo', order: 0 },
  { id: 'card-2', title: 'Design landing page', columnId: 'todo', order: 1 },
  { id: 'card-3', title: 'Review codebase structure', columnId: 'todo', order: 2 },
  { id: 'card-4', title: 'Implement authentication', columnId: 'in-progress', order: 0 },
  { id: 'card-5', title: 'Set up database schema', columnId: 'in-progress', order: 1 },
  { id: 'card-6', title: 'Fix navbar bugs', columnId: 'in-progress', order: 2 },
  { id: 'card-7', title: 'Organize project repository', columnId: 'done', order: 0 },
  { id: 'card-8', title: 'Write API documentation', columnId: 'done', order: 1 }
];

type BoardContextValue = {
  columns: Column[];
  cards: Card[];
  addCard: (columnId: ColumnId) => void;
  updateCardTitle: (cardId: string, title: string) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetColumnId: ColumnId, targetIndex: number) => void;
};

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `card-${Math.random().toString(36).slice(2, 9)}`;
};

const reindexColumns = (records: Record<ColumnId, Card[]>) =>
  columnDefinitions.flatMap(column =>
    records[column.id].map((card, index) => ({ ...card, order: index }))
  );

export const BoardProvider = ({ children }: { children: React.ReactNode }) => {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const addCard = useCallback((columnId: ColumnId) => {
    setCards(prev => {
      const columnCards = prev
        .filter(card => card.columnId === columnId)
        .sort((a, b) => a.order - b.order);
      const newCard: Card = {
        id: createId(),
        title: 'New card',
        columnId,
        order: columnCards.length
      };
      const records: Record<ColumnId, Card[]> = columnDefinitions.reduce((acc, column) => {
        const group =
          column.id === columnId
            ? [...columnCards, newCard]
            : prev.filter(card => card.columnId === column.id);
        acc[column.id] = group.sort((a, b) => a.order - b.order);
        return acc;
      }, {} as Record<ColumnId, Card[]>);
      return reindexColumns(records);
    });
  }, []);

  const updateCardTitle = useCallback((cardId: string, title: string) => {
    setCards(prev => prev.map(card => (card.id === cardId ? { ...card, title } : card)));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => {
      const records = columnDefinitions.reduce((acc, column) => {
        const group = prev
          .filter(card => card.columnId === column.id && card.id !== cardId)
          .sort((a, b) => a.order - b.order);
        acc[column.id] = group;
        return acc;
      }, {} as Record<ColumnId, Card[]>);
      return reindexColumns(records);
    });
  }, []);

  const moveCard = useCallback((cardId: string, targetColumnId: ColumnId, targetIndex: number) => {
    setCards(prev => {
      const cardToMove = prev.find(card => card.id === cardId);
      if (!cardToMove) {
        return prev;
      }
      const records = columnDefinitions.reduce((acc, column) => {
        acc[column.id] = prev
          .filter(card => card.columnId === column.id && card.id !== cardId)
          .sort((a, b) => a.order - b.order);
        return acc;
      }, {} as Record<ColumnId, Card[]>);
      const targetList = records[targetColumnId] ?? [];
      const normalizedIndex = Math.min(Math.max(targetIndex, 0), targetList.length);
      const movedCard = { ...cardToMove, columnId: targetColumnId };
      targetList.splice(normalizedIndex, 0, movedCard);
      records[targetColumnId] = targetList;
      return reindexColumns(records);
    });
  }, []);

  const value = useMemo(
    () => ({
      columns: columnDefinitions,
      cards,
      addCard,
      updateCardTitle,
      deleteCard,
      moveCard
    }),
    [cards, addCard, updateCardTitle, deleteCard, moveCard]
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
};


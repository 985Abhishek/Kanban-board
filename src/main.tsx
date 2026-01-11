import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { KanbanBoard } from './components/KanbanBoard';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KanbanBoard />
  </React.StrictMode>
);


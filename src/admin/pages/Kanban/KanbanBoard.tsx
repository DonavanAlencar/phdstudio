/**
 * Board de Kanban
 */

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../utils/api';
import type { KanbanBoard as KanbanBoardType, KanbanColumn, KanbanCard } from '../../types';
import { Plus, X } from 'lucide-react';

interface SortableCardProps {
  card: KanbanCard;
  onDelete: (id: number) => void;
}

function SortableCard({ card, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {card.description && (
        <p className="text-sm text-gray-600 mb-2">{card.description}</p>
      )}
      {card.lead_email && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-gray-500">Lead: {card.lead_email}</p>
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardId, setBoardId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadDefaultBoard();
  }, []);

  const loadDefaultBoard = async () => {
    try {
      const boards = await api.getBoards();
      const defaultBoard = boards.find((b) => b.is_default) || boards[0];
      if (defaultBoard) {
        setBoardId(defaultBoard.id);
        await loadBoard(defaultBoard.id);
      }
    } catch (error) {
      // console.error('Erro ao carregar board:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBoard = async (id: number) => {
    try {
      const boardData = await api.getBoard(id);
      setBoard(boardData);
    } catch (error) {
      // console.error('Erro ao carregar board:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar coluna e card origem
    const sourceColumn = board.columns?.find((col) =>
      col.cards?.some((c) => c.id.toString() === activeId)
    );
    const sourceCard = sourceColumn?.cards?.find(
      (c) => c.id.toString() === activeId
    );

    if (!sourceCard || !sourceColumn) return;

    // Verificar se foi solto em outra coluna ou em uma coluna diretamente
    let destColumn: KanbanColumn | undefined;
    let newPosition = 0;

    // Se foi solto em uma coluna
    if (board.columns?.some((col) => col.id.toString() === overId)) {
      destColumn = board.columns.find((col) => col.id.toString() === overId);
      newPosition = (destColumn?.cards?.length || 0);
    }
    // Se foi solto em outro card
    else {
      destColumn = board.columns?.find((col) =>
        col.cards?.some((c) => c.id.toString() === overId)
      );
      const destCard = destColumn?.cards?.find(
        (c) => c.id.toString() === overId
      );
      if (destCard && destColumn) {
        newPosition = destCard.position;
      }
    }

    if (!destColumn || destColumn.id === sourceColumn.id) {
      // Mesma coluna, apenas reordenar
      if (destColumn) {
        const cards = [...(destColumn.cards || [])];
        const oldIndex = cards.findIndex((c) => c.id === sourceCard.id);
        const newIndex = cards.findIndex((c) => c.id.toString() === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          cards.splice(oldIndex, 1);
          cards.splice(newIndex, 0, sourceCard);
          cards.forEach((card, index) => {
            card.position = index;
          });
        }

        // Atualizar UI
        const newBoard = { ...board };
        const newColumns = newBoard.columns?.map((col) =>
          col.id === destColumn.id ? { ...col, cards } : col
        );
        newBoard.columns = newColumns;
        setBoard(newBoard);
      }
      return;
    }

    // Atualização otimista
    const newBoard = { ...board };
    const newColumns = newBoard.columns?.map((col) => {
      if (col.id === sourceColumn.id) {
        // Remover da coluna origem
        const newCards = col.cards?.filter((c) => c.id !== sourceCard.id) || [];
        newCards.forEach((card, index) => {
          card.position = index;
        });
        return { ...col, cards: newCards };
      } else if (col.id === destColumn.id) {
        // Adicionar à coluna destino
        const newCards = [...(col.cards || [])];
        newCards.splice(newPosition, 0, {
          ...sourceCard,
          column_id: destColumn.id,
        });
        newCards.forEach((card, index) => {
          card.position = index;
        });
        return { ...col, cards: newCards };
      }
      return col;
    });
    newBoard.columns = newColumns;
    setBoard(newBoard);

    // Atualizar no servidor
    try {
      await api.moveCard(sourceCard.id, destColumn.id, newPosition);
    } catch (error) {
      // console.error('Erro ao mover card:', error);
      // Reverter em caso de erro
      if (boardId) await loadBoard(boardId);
    }
  };

  const handleCreateCard = async (columnId: number) => {
    const title = prompt('Título do card:');
    if (!title) return;

    try {
      await api.createCard({
        column_id: columnId,
        title,
        position: 0,
      });
      if (boardId) await loadBoard(boardId);
    } catch (error) {
      // console.error('Erro ao criar card:', error);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Deseja deletar este card?')) return;

    try {
      await api.deleteCard(cardId);
      if (boardId) await loadBoard(boardId);
    } catch (error) {
      // console.error('Erro ao deletar card:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!board || !board.columns) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum board encontrado</p>
      </div>
    );
  }

  const activeCard = board.columns
    .flatMap((col) => col.cards || [])
    .find((card) => card.id.toString() === activeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
          {board.description && (
            <p className="text-gray-600 mt-1">{board.description}</p>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <div
                key={column.id}
                id={column.id.toString()}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
              >
                {/* Header da Coluna */}
                <div
                  className="mb-4 pb-3 border-b-2"
                  style={{ borderColor: column.color }}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="font-semibold text-gray-900"
                      style={{ color: column.color }}
                    >
                      {column.name}
                    </h3>
                    <button
                      onClick={() => handleCreateCard(column.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Adicionar card"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(column.cards || []).length} card
                    {(column.cards || []).length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards */}
                <SortableContext
                  id={column.id.toString()}
                  items={column.cards?.map((c) => c.id.toString()) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px]">
                    {column.cards &&
                      column.cards
                        .sort((a, b) => a.position - b.position)
                        .map((card) => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            onDelete={handleDeleteCard}
                          />
                        ))}
                  </div>
                </SortableContext>
              </div>
            ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white rounded-lg shadow-xl p-4 w-80 rotate-2">
              <h4 className="font-medium text-gray-900">{activeCard.title}</h4>
              {activeCard.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {activeCard.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

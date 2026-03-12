import React, { useRef, useCallback, useMemo } from 'react';
import { DayOfWeek, Block } from '../../types';
import { useScheduleStore } from '../../store/scheduleStore';
import { useTranslation } from 'react-i18next';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableBlockItem } from './SortableBlockItem';
import { AddBlockModal, AddBlockModalHandle } from './AddBlockModal';

interface DayCardProps {
  day: DayOfWeek;
  blocks: Block[];
  activeBlockId: string | null;
}

export const DayCard = React.memo(({ day, blocks, activeBlockId }: DayCardProps) => {
  const { t } = useTranslation();
  const removeBlock = useScheduleStore(s => s.removeBlock);
  const modalRef = useRef<AddBlockModalHandle>(null);

  const { setNodeRef, isOver } = useDroppable({ id: day });

  const totalMinutes = useMemo(() => blocks.reduce((acc, b) => acc + b.duration_minutes, 0), [blocks]);
  const isDraggingOver = isOver && !blocks.some(b => b.id === activeBlockId);

  const handleRemoveBlock = useCallback((blockId: string) => {
    removeBlock(day, blockId);
  }, [removeBlock, day]);

  return (
    <>
      <AddBlockModal ref={modalRef} day={day} />

      {/* Card */}
      <div className={`bg-base-100 shadow-sm border rounded-md overflow-hidden flex flex-col h-full w-[300px] transition-colors
        ${isDraggingOver ? 'border-primary shadow-primary/20 shadow-md' : 'border-base-300'}`}
      >
        {/* Header */}
        <div className="bg-base-200 px-4 py-3 border-b border-base-300 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base-content text-base">{t(`days.${day}`)}</h3>
            {totalMinutes > 0
              ? <span className="inline-flex items-center gap-1 text-primary text-sm font-bold mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="block shrink-0">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {totalMinutes} {t('dayCard.min')}
              </span>
              : <span className="inline-flex items-center text-xs text-base-content/30 mt-0.5 h-[16px]">—</span>
            }
          </div>
          <button
            onClick={() => modalRef.current?.open()}
            className="btn btn-primary btn-sm btn-square rounded-md"
            title="Adicionar Bloco"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          ref={setNodeRef}
          className={`p-3 flex-1 overflow-y-auto min-h-[150px] transition-colors
            ${isDraggingOver ? 'bg-primary/5' : 'bg-base-200/30'}`}
        >
          {blocks.length === 0 ? (
            <div className={`flex items-center justify-center h-full min-h-[100px] rounded-md border-2 border-dashed transition-colors
              ${isDraggingOver ? 'border-primary/40 bg-primary/5' : 'border-base-300'}`}
            >
              <p className={`text-sm font-mono font-semibold space-x-1.5 ${isDraggingOver ? 'text-primary/60' : 'text-base-content/30'}`}>
                {isDraggingOver ? t('dayCard.dropHere') : t('dayCard.rest')}
              </p>
            </div>
          ) : (
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {blocks.map(block => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    isActiveBlock={block.id === activeBlockId}
                    onRemove={() => handleRemoveBlock(block.id)}
                  />
                ))}
                {isDraggingOver && (
                  <li className="h-10 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
                    <span className="text-xs text-primary/50">{t('dayCard.dropHere')}</span>
                  </li>
                )}
              </ul>
            </SortableContext>
          )}
        </div>
      </div>
    </>
  );
});

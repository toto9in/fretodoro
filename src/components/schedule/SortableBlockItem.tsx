import React from 'react';
import { Block } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableBlockItem = React.memo(function SortableBlockItem({ block, onRemove, isActiveBlock }: {
  block: Block;
  onRemove: () => void;
  isActiveBlock: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-base-100 border rounded-md group transition-colors cursor-grab active:cursor-grabbing select-none
        ${isActiveBlock
          ? 'opacity-30 border-dashed border-base-300'
          : 'shadow-sm border-base-300 hover:border-2 hover:border-primary/60'
        }`}
    >
      <div className="p-4 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Grip decorativo */}
          <span className="text-base-content/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content line-clamp-2 leading-tight">{block.title}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-primary font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="block shrink-0">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {block.duration_minutes} min
            </span>
          </div>
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onRemove}
          className="text-error/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-error/10 cursor-pointer"
          title="Remover"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </li>
  );
});

import { Block } from '../../types';
import { GripVertical, Clock3 } from 'lucide-react';

export function BlockOverlay({ block }: { block: Block }) {
  return (
    <div className="bg-base-100 border-2 border-primary rounded-md shadow-2xl rotate-1 cursor-grabbing w-[268px]">
      <div className="p-4 flex-row items-center gap-3 flex justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-base-content/20 shrink-0">
            <GripVertical size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content line-clamp-2 leading-tight">{block.title}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-primary text-xs font-bold">
              <Clock3 size={12} className="block shrink-0" />
              {block.duration_minutes} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Block } from '../../types';

export function BlockOverlay({ block }: { block: Block }) {
  return (
    <div className="bg-base-100 border-2 border-primary rounded-md shadow-2xl rotate-1 cursor-grabbing w-[268px]">
      <div className="p-4 flex-row items-center gap-3 flex justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-base-content/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content line-clamp-2 leading-tight">{block.title}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-primary text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="block shrink-0">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {block.duration_minutes} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

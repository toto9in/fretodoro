import { useEffect } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { useTranslation } from 'react-i18next';

export function DeleteToast() {
  const { t } = useTranslation();
  const lastDeleted = useScheduleStore(s => s.lastDeleted);
  const undoDelete = useScheduleStore(s => s.undoDelete);
  const clearLastDeleted = useScheduleStore(s => s.clearLastDeleted);

  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => clearLastDeleted(), 5000);
    return () => clearTimeout(timer);
  }, [lastDeleted, clearLastDeleted]);

  if (!lastDeleted) return null;

  return (
    <div className="toast toast-end toast-bottom z-50">
      <div
        className="alert bg-base-100 border border-base-300 shadow-xl flex items-center gap-4 px-5 py-4 rounded-lg animate-[slideIn_0.3s_ease-out]"
        style={{ '--tw-enter-translate-x': '100%' } as React.CSSProperties}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error shrink-0">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        <span className="text-base">
          <strong>{lastDeleted.block.title}</strong> {t('scheduleBoard.activityRemoved', { title: '', day: t(`days.${lastDeleted.day}`) }).replace('  ', ' ')}
        </span>
        <button
          onClick={() => undoDelete()}
          className="btn btn-md  btn-primary"
        >
          {t('scheduleBoard.undo')}
        </button>
        <button
          onClick={() => clearLastDeleted()}
          className="btn btn-sm btn-ghost text-base-content/30"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

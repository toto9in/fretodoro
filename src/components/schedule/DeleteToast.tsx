import { useEffect } from 'react';
import { useScheduleStore } from '../../store/scheduleStore';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

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
        <Trash2 size={18} className="text-error shrink-0" />
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

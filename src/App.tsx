import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from './store/scheduleStore';
import { ScheduleBoard } from './components/schedule/ScheduleBoard';
import { PracticeRoom } from './components/practice/PracticeRoom';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import './App.css';

function App() {
  const { t } = useTranslation();
  const loadSchedule = useScheduleStore(s => s.loadSchedule);
  const isLoading = useScheduleStore(s => s.isLoading);
  const error = useScheduleStore(s => s.error);
  const [isPracticing, setIsPracticing] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-8">
        <div role="alert" className="alert alert-error max-w-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">{t('errors.loadFailed')}</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => loadSchedule()} className="btn btn-sm btn-ghost">
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (isPracticing) {
    return (
      <div className="min-h-screen bg-base-200 p-6 lg:p-8 flex flex-col h-screen overflow-hidden">
        <PracticeRoom onBack={() => setIsPracticing(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 lg:p-8 flex flex-col h-screen">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div className="flex gap-4 items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content tracking-tight">{t('app.title')}</h1>
            <p className="text-base-content/50 mt-1 font-medium text-sm">{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        <button
          onClick={() => setIsPracticing(true)}
          className="btn btn-primary gap-2"
        >
          {t('app.startTodayPractice')}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-x-auto pb-4">
        <ScheduleBoard />
      </main>
    </div>
  );
}

export default App;

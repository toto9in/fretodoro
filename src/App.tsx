import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useScheduleStore } from "./store/scheduleStore";
import { ScheduleBoard } from "./components/schedule/ScheduleBoard";
import { PracticeRoom } from "./components/practice/PracticeRoom";
import { LanguageSwitcher } from "./components/common/LanguageSwitcher";
import { ExportPdfButton } from "./components/common/ExportPdfButton";
import { XCircle, Play } from "lucide-react";
import "./App.css";

function App() {
  const { t } = useTranslation();
  const loadSchedule = useScheduleStore((s) => s.loadSchedule);
  const isLoading = useScheduleStore((s) => s.isLoading);
  const error = useScheduleStore((s) => s.error);
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
          <XCircle className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="font-bold">{t("errors.loadFailed")}</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => loadSchedule()}
            className="btn btn-sm btn-ghost"
          >
            {t("errors.tryAgain")}
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
      <header className="mb-8 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight">
            {t("app.title")}
          </h1>
          <p className="text-base-content/50 mt-1 font-medium text-sm">
            {t("app.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <LanguageSwitcher />
          <ExportPdfButton />
          <button
            onClick={() => setIsPracticing(true)}
            className="btn btn-primary gap-2"
          >
            {t("app.startTodayPractice")}
            <Play size={16} fill="currentColor" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto pb-4">
        <ScheduleBoard />
      </main>
    </div>
  );
}

export default App;

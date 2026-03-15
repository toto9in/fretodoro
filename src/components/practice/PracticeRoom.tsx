import { useEffect, useState, useRef, useCallback } from "react";
import { useScheduleStore } from "../../store/scheduleStore";
import { usePomodoroTimer } from "../../hooks/usePomodoroTimer";
import { useTranslation } from "react-i18next";
import { Block } from "../../types";
import { TimerPanel } from "./TimerPanel";
import { MetronomePanel } from "./MetronomePanel";
import { QueueSidebar } from "./QueueSidebar";
import { ArrowLeft } from "lucide-react";
import { getTodayDayOfWeek } from "../../utils/date";

interface PracticeRoomProps {
  onBack: () => void;
}

export const PracticeRoom = ({ onBack }: PracticeRoomProps) => {
  const { t } = useTranslation();
  const schedule = useScheduleStore((s) => s.schedule);

  const [todayBlocks, setTodayBlocks] = useState<Block[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [hasStartedContext, setHasStartedContext] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const todayName = getTodayDayOfWeek();
    const todayRoutine = schedule.routines.find(
      (r) => r.day_of_week === todayName,
    );
    if (todayRoutine) setTodayBlocks(todayRoutine.blocks || []);
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
      );
    }
  }, [schedule]);

  const currentBlock = todayBlocks[currentBlockIndex];

  const {
    timeLeft,
    isRunning,
    isFinished,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  } = usePomodoroTimer(0);

  useEffect(() => {
    if (currentBlock) {
      resetTimer(currentBlock.duration_minutes * 60);
      setHasStartedContext(false);
    }
  }, [currentBlockIndex, currentBlock, resetTimer]);

  useEffect(() => {
    if (isFinished && hasStartedContext && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [isFinished, hasStartedContext]);

  const handleStartToggle = useCallback(() => {
    setHasStartedContext(true);
    isRunning ? pauseTimer() : startTimer();
  }, [isRunning, pauseTimer, startTimer]);

  const handleNextBlock = useCallback(() => {
    if (currentBlockIndex < todayBlocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
    } else {
      onBack();
    }
  }, [currentBlockIndex, todayBlocks.length, onBack]);

  if (todayBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="bg-base-100 border border-base-300 rounded-md shadow-sm p-10 text-center max-w-md">
          <p className="text-base-content/50 text-sm mb-6">
            {t("practiceRoom.noActivities")}
          </p>
          <button onClick={onBack} className="btn btn-neutral btn-sm">
            {t("practiceRoom.returnHome")}
          </button>
        </div>
      </div>
    );
  }

  const totalSeconds = currentBlock ? currentBlock.duration_minutes * 60 : 1;

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full h-full">
      {/* Top Nav */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm gap-1 text-base-content/60"
        >
          <ArrowLeft size={16} />
          {t("practiceRoom.back")}
        </button>
        <span className="text-sm text-base-content/40 font-medium">
          {t("practiceRoom.exerciseCounter", { current: currentBlockIndex + 1, total: todayBlocks.length })}
        </span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
          <TimerPanel
            currentBlock={currentBlock}
            timeLeft={timeLeft}
            totalSeconds={totalSeconds}
            isRunning={isRunning}
            isFinished={isFinished}
            hasStartedContext={hasStartedContext}
            isFirstBlock={currentBlockIndex === 0}
            isLastBlock={currentBlockIndex === todayBlocks.length - 1}
            onStartToggle={handleStartToggle}
            onSkip={skipTimer}
            onNext={handleNextBlock}
          />

          <MetronomePanel />
        </div>

        <QueueSidebar
          blocks={todayBlocks}
          currentBlockIndex={currentBlockIndex}
        />
      </div>
    </div>
  );
};

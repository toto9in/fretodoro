import React from "react";
import { Block } from "../../types";
import { useTranslation } from "react-i18next";
import { CountdownDigit } from "./CountdownDigit";
import { Clock3, SkipForward } from "lucide-react";

interface TimerPanelProps {
  currentBlock: Block | undefined;
  timeLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  hasStartedContext: boolean;
  isLastBlock: boolean;
  onStartToggle: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export const TimerPanel = React.memo(function TimerPanel({
  currentBlock,
  timeLeft,
  totalSeconds,
  isRunning,
  isFinished,
  hasStartedContext,
  isLastBlock,
  onStartToggle,
  onSkip,
  onNext,
}: TimerPanelProps) {
  const { t } = useTranslation();

  const progressPercentage = currentBlock
    ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100)
    : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-base-100 border border-base-300 rounded-md shadow-sm flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-center">
        <p className="text-base-content/30 uppercase tracking-widest text-[10px] font-bold mb-1">
          Exercício Atual
        </p>
        <h2 className="text-lg font-bold text-base-content tracking-tight">
          {currentBlock?.title || "—"}
        </h2>
      </div>

      <div className="relative" style={{ width: "12rem", height: "12rem" }}>
        <div
          className={`radial-progress text-primary transition-colors duration-500 ${isFinished ? "text-success" : ""}`}
          style={
            {
              "--value": progressPercentage,
              "--size": "12rem",
              "--thickness": "5px",
            } as React.CSSProperties
          }
          role="progressbar"
          aria-valuenow={progressPercentage}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center font-mono font-semibold ${isFinished ? "text-success" : "text-base-content"}`}
        >
          <CountdownDigit value={minutes} />
          <span className="text-3xl text-base-content/30">:</span>
          <CountdownDigit value={seconds} />
        </div>
      </div>

      <span className="inline-flex items-center gap-1 text-base-content/30 text-xs font-medium">
        <Clock3 size={11} className="block shrink-0" />
        {currentBlock?.duration_minutes} min
      </span>

      <div className="flex items-center gap-3 w-full max-w-xs">
        {!isFinished && (
          <>
            <button
              onClick={onStartToggle}
              className={`btn btn-md flex-1 gap-2 ${isRunning ? "btn-warning" : "btn-primary"}`}
            >
              {isRunning
                ? `⏸ ${t("practiceRoom.pause")}`
                : `▶ ${hasStartedContext ? t("practiceRoom.resume") : t("dayCard.startDay")}`}
            </button>
            <button
              onClick={onSkip}
              className="btn btn-md btn-outline btn-ghost"
              title="Pular bloco"
            >
              <SkipForward size={16} fill="currentColor" />
            </button>
          </>
        )}
        {isFinished && (
          <button
            onClick={onNext}
            className="btn btn-md btn-success w-full gap-2"
          >
            {isLastBlock ? `${t("practiceRoom.finishPractice")}` : "→"}
          </button>
        )}
      </div>
    </div>
  );
});

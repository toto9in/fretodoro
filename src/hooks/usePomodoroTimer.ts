import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePomodoroTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newDurationSeconds: number) => void;
  skipTimer: () => void;
  formatTime: (seconds: number) => string;
}

export function usePomodoroTimer(initialDurationSeconds: number): UsePomodoroTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Ref para evitar que o effect dependa de timeLeft —
  // sem isso, cada tick recria o interval (60 creates+clears por minuto).
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    if (!isRunning) return;

    const timerId = window.setInterval(() => {
      if (timeLeftRef.current <= 1) {
        clearInterval(timerId);
        setTimeLeft(0);
        setIsRunning(false);
        setIsFinished(true);
      } else {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning]); // ← só depende de isRunning agora

  const startTimer = useCallback(() => {
    if (timeLeftRef.current > 0) {
      setIsRunning(true);
      setIsFinished(false);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((newDurationSeconds: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(newDurationSeconds);
  }, []);

  const skipTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsFinished(true);
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, []);

  return { timeLeft, isRunning, isFinished, startTimer, pauseTimer, resetTimer, skipTimer, formatTime };
}

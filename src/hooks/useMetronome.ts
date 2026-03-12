import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMetronomeReturn {
  bpm: number;
  setBpm: (bpm: number) => void;
  isPlaying: boolean;
  toggle: () => void;
  beat: number; // contador de batida atual (para feedback visual)
}

export function useMetronome(initialBpm = 120): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Garante que o AudioContext é criado apenas uma vez
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(() => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);

    setBeat(prev => prev + 1);
  }, [getAudioCtx]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback((currentBpm: number) => {
    stopInterval();
    const ms = 60000 / currentBpm;
    playClick(); // primeiro beat imediato
    intervalRef.current = window.setInterval(playClick, ms);
  }, [stopInterval, playClick]);

  // Reinicia interval quando BPM muda durante play
  useEffect(() => {
    if (isPlaying) {
      startInterval(bpm);
    }
    return stopInterval;
  }, [bpm, isPlaying, startInterval, stopInterval]);

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
    setBeat(0);
  }, []);

  const setBpm = useCallback((newBpm: number) => {
    setBpmState(Math.max(30, Math.min(300, newBpm)));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopInterval();
      audioCtxRef.current?.close();
    };
  }, [stopInterval]);

  return { bpm, setBpm, isPlaying, toggle, beat };
}

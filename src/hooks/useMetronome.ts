import { useState, useRef, useCallback, useEffect } from "react";

export interface TimeSig {
  label: string;
  beats: number;
}

export interface Subdivision {
  label: string;
  value: number;
  name: string;
}

export const TIME_SIGNATURES: TimeSig[] = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
  { label: "5/4", beats: 5 },
  { label: "6/8", beats: 6 },
  { label: "7/8", beats: 7 },
];

export const SUBDIVISIONS: Subdivision[] = [
  { label: "♩", value: 1, name: "Quarter" },
  { label: "♫", value: 2, name: "Eighth" },
  { label: "♬", value: 3, name: "Triplet" },
  { label: "𝅘𝅥𝅯", value: 4, name: "Sixteenth" },
];

export interface UseMetronomeReturn {
  bpm: number;
  setBpm: (bpm: number) => void;
  isPlaying: boolean;
  toggle: () => void;
  beat: number;
  subBeat: number;
  volume: number;
  setVolume: (v: number) => void;
  timeSigIndex: number;
  setTimeSigIndex: (i: number) => void;
  subdivIndex: number;
  setSubdivIndex: (i: number) => void;
  tap: () => void;
}

const MIN_BPM = 30;
const MAX_BPM = 300;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

export function useMetronome(initialBpm = 120): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [subBeat, setSubBeat] = useState(-1);
  const [volume, setVolumeState] = useState(0.5);
  const [timeSigIndex, setTimeSigIndexState] = useState(2); // 4/4
  const [subdivIndex, setSubdivIndexState] = useState(0); // Quarter

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const currentSubBeatRef = useRef(0);
  const bpmRef = useRef(initialBpm);
  const volumeRef = useRef(0.5);
  const isRunningRef = useRef(false);
  const timeSigRef = useRef(TIME_SIGNATURES[2]);
  const subdivRef = useRef(SUBDIVISIONS[0]);
  const tapTimesRef = useRef<number[]>([]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      const master = audioCtxRef.current.createGain();
      master.gain.value = volumeRef.current;
      master.connect(audioCtxRef.current.destination);
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const scheduleNote = useCallback(() => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const time = nextNoteTimeRef.current;
    const beatNum = currentBeatRef.current;
    const subBeatNum = currentSubBeatRef.current;
    const isAccent = beatNum === 0 && subBeatNum === 0;
    const isSubClick = subBeatNum > 0;

    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);

    if (isAccent) {
      osc.frequency.value = 1500;
      filter.type = "bandpass";
      filter.frequency.value = 1500;
      filter.Q.value = 8;
      envelope.gain.setValueAtTime(0.6, time);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    } else if (isSubClick) {
      osc.frequency.value = 800;
      filter.type = "highpass";
      filter.frequency.value = 600;
      envelope.gain.setValueAtTime(0.12, time);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    } else {
      osc.frequency.value = 1000;
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 6;
      envelope.gain.setValueAtTime(0.35, time);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    }

    osc.start(time);
    osc.stop(time + 0.1);
    osc.onended = () => {
      osc.disconnect();
      envelope.disconnect();
      filter.disconnect();
    };

    setBeat(beatNum);
    setSubBeat(subBeatNum);

    const secondsPerBeat = 60.0 / bpmRef.current;
    const secondsPerSubBeat = secondsPerBeat / subdivRef.current.value;
    nextNoteTimeRef.current += secondsPerSubBeat;

    currentSubBeatRef.current++;
    if (currentSubBeatRef.current >= subdivRef.current.value) {
      currentSubBeatRef.current = 0;
      currentBeatRef.current++;
      if (currentBeatRef.current >= timeSigRef.current.beats) {
        currentBeatRef.current = 0;
      }
    }
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !isRunningRef.current) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleNote();
    }
    timerRef.current = window.setTimeout(scheduler, LOOKAHEAD_MS);
  }, [scheduleNote]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    const ctx = getAudioCtx();
    isRunningRef.current = true;

    if (masterGainRef.current) {
      masterGainRef.current.gain.cancelScheduledValues(0);
      masterGainRef.current.gain.setValueAtTime(
        volumeRef.current,
        ctx.currentTime,
      );
    }

    currentBeatRef.current = 0;
    currentSubBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    scheduler();
  }, [getAudioCtx, scheduler]);

  const toggle = useCallback(() => {
    if (isRunningRef.current) {
      stop();
      setIsPlaying(false);
      setBeat(-1);
      setSubBeat(-1);
    } else {
      start();
      setIsPlaying(true);
    }
  }, [start, stop]);

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm));
    setBpmState(clamped);
    bpmRef.current = clamped;
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        clamped,
        audioCtxRef.current.currentTime,
      );
    }
  }, []);

  const setTimeSigIndex = useCallback(
    (i: number) => {
      setTimeSigIndexState(i);
      timeSigRef.current = TIME_SIGNATURES[i];
      if (isRunningRef.current) {
        stop();
        setIsPlaying(false);
        setBeat(-1);
        setSubBeat(-1);
        // Restart after brief delay to reset beat position
        setTimeout(() => {
          start();
          setIsPlaying(true);
        }, 50);
      }
    },
    [stop, start],
  );

  const setSubdivIndex = useCallback((i: number) => {
    setSubdivIndexState(i);
    subdivRef.current = SUBDIVISIONS[i];
  }, []);

  const tap = useCallback(() => {
    const now = Date.now();
    const times = tapTimesRef.current.filter((t) => now - t < 3000);
    times.push(now);
    tapTimesRef.current = times;

    if (times.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      if (newBpm >= MIN_BPM && newBpm <= MAX_BPM) {
        setBpmState(newBpm);
        bpmRef.current = newBpm;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      masterGainRef.current = null;
    };
  }, [stop]);

  return {
    bpm,
    setBpm,
    isPlaying,
    toggle,
    beat,
    subBeat,
    volume,
    setVolume,
    timeSigIndex,
    setTimeSigIndex,
    subdivIndex,
    setSubdivIndex,
    tap,
  };
}

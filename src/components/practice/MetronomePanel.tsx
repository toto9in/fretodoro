import React from "react";
import {
  useMetronome,
  TIME_SIGNATURES,
  SUBDIVISIONS,
} from "../../hooks/useMetronome";
import { useTranslation } from "react-i18next";
import { Volume2, Pause, Play, Minus, Plus } from "lucide-react";

export const MetronomePanel = React.memo(function MetronomePanel() {
  const { t } = useTranslation();
  const m = useMetronome(120);

  const timeSig = TIME_SIGNATURES[m.timeSigIndex];
  const subdiv = SUBDIVISIONS[m.subdivIndex];

  return (
    <div className="bg-base-100 border border-base-300 rounded-md shadow-sm overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-base-300 bg-base-200">
        <h3 className="font-bold text-base-content text-sm flex items-center gap-2">
          <Volume2 size={13} />
          {t("metronome.title")}
        </h3>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Beat indicators */}
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: timeSig.beats }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full transition-all duration-75 ${
                  m.isPlaying && m.beat === i && m.subBeat === 0
                    ? i === 0
                      ? "bg-primary scale-125 shadow-sm shadow-primary/50"
                      : "bg-secondary scale-110"
                    : "bg-base-300"
                }`}
              />
              {subdiv.value > 1 && (
                <div className="flex gap-1">
                  {Array.from({ length: subdiv.value - 1 }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
                        m.isPlaying && m.beat === i && m.subBeat === j + 1
                          ? "bg-accent scale-125"
                          : "bg-base-300/60"
                      }`}
                    />
                  ))}
                </div>
              )}
              <span className="text-[9px] text-base-content/30 tabular-nums">
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* BPM + Play/Tap row */}
        <div className="flex items-center gap-4">
          {/* Tap button */}
          <button
            onClick={m.tap}
            className="btn btn-sm btn-ghost btn-square text-[10px] font-bold tracking-wider border-base-300"
            title={t("metronome.tap")}
          >
            TAP
          </button>

          {/* Play */}
          <button
            onClick={m.toggle}
            className={`btn btn-circle btn-md ${m.isPlaying ? "btn-warning" : "btn-primary"}`}
          >
            {m.isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>

          {/* BPM display + fine adjust */}
          <div className="flex items-center gap-1.5 flex-1 justify-center">
            <button
              onClick={() => m.setBpm(m.bpm - 5)}
              className="btn btn-xs btn-ghost btn-square"
              title="-5"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => m.setBpm(m.bpm - 1)}
              className="btn btn-xs btn-ghost btn-square text-[10px] font-bold"
            >
              -1
            </button>
            <div className="text-center min-w-[4.5rem]">
              <span className="text-2xl font-black text-base-content tabular-nums">
                {m.bpm}
              </span>
              <span className="text-base-content/30 text-[10px] font-bold uppercase tracking-widest ml-1">
                BPM
              </span>
            </div>
            <button
              onClick={() => m.setBpm(m.bpm + 1)}
              className="btn btn-xs btn-ghost btn-square text-[10px] font-bold"
            >
              +1
            </button>
            <button
              onClick={() => m.setBpm(m.bpm + 5)}
              className="btn btn-xs btn-ghost btn-square"
              title="+5"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* BPM slider */}
        <input
          type="range"
          min="30"
          max="300"
          value={m.bpm}
          onChange={(e) => m.setBpm(Number(e.target.value))}
          className="range range-primary range-xs w-full"
        />

        {/* Preset BPMs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[60, 80, 100, 120, 140, 160, 200].map((v) => (
            <button
              key={v}
              onClick={() => m.setBpm(v)}
              className={`btn btn-xs rounded-md ${m.bpm === v ? "btn-primary" : "btn-ghost text-base-content/40"}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Time signature + Subdivision */}
        <div className="flex gap-4 pt-2 border-t border-base-300">
          {/* Time signature */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-base-content/40">
              {t("metronome.timeSig")}
            </span>
            <div className="flex gap-1 flex-wrap">
              {TIME_SIGNATURES.map((ts, i) => (
                <button
                  key={ts.label}
                  onClick={() => m.setTimeSigIndex(i)}
                  className={`btn btn-xs rounded-md min-w-[2.2rem] ${m.timeSigIndex === i ? "btn-primary" : "btn-ghost text-base-content/40"}`}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subdivision */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-base-content/40">
              {t("metronome.subdivision")}
            </span>
            <div className="flex gap-1">
              {SUBDIVISIONS.map((s, i) => (
                <button
                  key={s.value}
                  onClick={() => m.setSubdivIndex(i)}
                  className={`btn btn-xs rounded-md text-base min-w-[2rem] ${m.subdivIndex === i ? "btn-primary" : "btn-ghost text-base-content/40"}`}
                  title={s.name}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 pt-2 border-t border-base-300">
          <Volume2 size={14} className="text-base-content/50 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={m.volume}
            onChange={(e) => m.setVolume(Number(e.target.value))}
            className="range range-xs w-full"
            title={t("metronome.volume")}
          />
          <span className="text-xs text-base-content/40 tabular-nums w-8 text-right shrink-0">
            {Math.round(m.volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
});

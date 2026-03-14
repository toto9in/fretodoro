import React from "react";
import { useMetronome } from "../../hooks/useMetronome";
import { useTranslation } from "react-i18next";
import { Volume2, Pause, Play, Minus, Plus } from "lucide-react";

export const MetronomePanel = React.memo(function MetronomePanel() {
  const { t } = useTranslation();
  const metronome = useMetronome(120);

  return (
    <div className="bg-base-100 border border-base-300 rounded-md shadow-sm overflow-hidden shrink-0">
      <div className="px-4 py-2.5 border-b border-base-300 bg-base-200">
        <h3 className="font-bold text-base-content text-sm flex items-center gap-2">
          <Volume2 size={13} />
          {t("metronome.title")}
        </h3>
      </div>

      <div className="flex items-center gap-6 px-5 py-4">
        {/* Beat dots + Play */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-[background-color,transform] duration-75 ${
                  metronome.isPlaying && metronome.beat % 4 === i
                    ? i === 0
                      ? "bg-primary scale-125 shadow-primary/50 shadow-sm"
                      : "bg-secondary scale-110"
                    : "bg-base-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={metronome.toggle}
            className={`btn btn-circle btn-md ${metronome.isPlaying ? "btn-warning" : "btn-primary"}`}
          >
            {metronome.isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
        </div>

        {/* BPM controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => metronome.setBpm(metronome.bpm - 5)}
              className="btn btn-xs btn-ghost btn-square"
              title="-5"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => metronome.setBpm(metronome.bpm - 1)}
              className="btn btn-xs btn-ghost btn-square text-[10px] font-bold"
            >
              -1
            </button>
            <div className="text-center flex-1">
              <span className="text-2xl font-black text-base-content tabular-nums">
                {metronome.bpm}
              </span>
              <span className="text-base-content/30 text-[10px] font-bold uppercase tracking-widest ml-1.5">
                BPM
              </span>
            </div>
            <button
              onClick={() => metronome.setBpm(metronome.bpm + 1)}
              className="btn btn-xs btn-ghost btn-square text-[10px] font-bold"
            >
              +1
            </button>
            <button
              onClick={() => metronome.setBpm(metronome.bpm + 5)}
              className="btn btn-xs btn-ghost btn-square"
              title="+5"
            >
              <Plus size={12} />
            </button>
          </div>

          <input
            type="range"
            min="30"
            max="300"
            value={metronome.bpm}
            onChange={(e) => metronome.setBpm(Number(e.target.value))}
            className="range range-primary range-xs w-full"
          />

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {[60, 80, 100, 120, 140, 160, 200].map((v) => (
              <button
                key={v}
                onClick={() => metronome.setBpm(v)}
                className={`btn btn-xs rounded-md ${metronome.bpm === v ? "btn-primary" : "btn-ghost text-base-content/40"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

import React from "react";
import { Block } from "../../types";
import { useTranslation } from "react-i18next";
import { List } from "lucide-react";

export const QueueSidebar = React.memo(
  ({
    blocks,
    currentBlockIndex,
  }: {
    blocks: Block[];
    currentBlockIndex: number;
  }) => {
    const { t } = useTranslation();
    return (
      <div className="w-64 shrink-0 bg-base-100 border border-base-300 rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-base-300 bg-base-200">
          <h3 className="font-bold text-base-content text-xs flex items-center gap-2">
            <List size={12} />
            {t("queueSidebar.title")}
          </h3>
        </div>
        <ul className="p-3 overflow-y-auto flex-1 space-y-2">
          {blocks.map((block, index) => {
            const isPast = index < currentBlockIndex;
            const isCurrent = index === currentBlockIndex;
            return (
              <li
                key={block.id}
                className={`rounded-md border px-3 py-2 flex justify-between items-center transition-colors text-sm ${
                  isCurrent
                    ? "bg-primary/10 border-primary"
                    : isPast
                      ? "opacity-40 border-base-300 line-through"
                      : "border-base-300 bg-base-200/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                  <span
                    className={`font-semibold truncate ${isCurrent ? "text-primary" : "text-base-content"}`}
                  >
                    {block.title}
                  </span>
                </div>
                <span className="text-xs text-base-content/40 shrink-0 ml-2">
                  {block.duration_minutes}
                  {t("queueSidebar.min")}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

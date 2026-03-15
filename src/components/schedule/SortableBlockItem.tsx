import React from "react";
import { Block } from "../../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock3, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SortableBlockItem = React.memo(function SortableBlockItem({
  block,
  onRemove,
  isActiveBlock,
}: {
  block: Block;
  onRemove: () => void;
  isActiveBlock: boolean;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-base-100 border rounded-md group transition-colors cursor-grab active:cursor-grabbing select-none
        ${
          isActiveBlock
            ? "opacity-30 border-dashed border-base-300"
            : "shadow-sm border-base-300 hover:border-2 hover:border-primary/60"
        }`}
    >
      <div className="p-4 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Grip decorativo */}
          <span className="text-base-content/20 shrink-0">
            <GripVertical size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content line-clamp-2 leading-tight">
              {block.title}
            </p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-primary font-bold text-sm">
              <Clock3 size={13} className="block shrink-0" />
              {block.duration_minutes} min
            </span>
          </div>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="text-error/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-error/10 cursor-pointer"
          title={t("dayCard.remove")}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
});

import React, {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
} from "react";
import { DayOfWeek } from "../../types";
import { useScheduleStore } from "../../store/scheduleStore";
import { useTranslation } from "react-i18next";

export interface AddBlockModalHandle {
  open: () => void;
}

export const AddBlockModal = React.forwardRef<
  AddBlockModalHandle,
  { day: DayOfWeek }
>(function AddBlockModal({ day }, ref) {
  const { t } = useTranslation();
  const addBlock = useScheduleStore((s) => s.addBlock);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => {
      setTitle("");
      setDuration("");
      setError("");
      dialogRef.current?.showModal();
    },
  }));

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const mins = Number(duration);
      if (!title.trim()) {
        setError("Informe o nome do exercício.");
        return;
      }
      if (!duration || isNaN(mins) || mins <= 0) {
        setError("Informe uma duração válida em minutos.");
        return;
      }
      await addBlock(day, { title: title.trim(), duration_minutes: mins });
      dialogRef.current?.close();
    },
    [title, duration, addBlock, day],
  );

  return (
    <dialog ref={dialogRef} className="modal modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-1">{t("dayCard.newActivity")}</h3>
        <p className="text-base-content/50 text-sm mb-6">{t(`days.${day}`)}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              {t("dayCard.newActivity")}
            </legend>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={t("dayCard.newActivityPlaceholder")}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              {t("dayCard.estimatedTime")} ({t("dayCard.min")})
            </legend>
            <input
              type="number"
              className="input input-bordered w-full"
              placeholder="Ex: 15"
              min="1"
              max="180"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setError("");
              }}
            />
          </fieldset>

          {error && <p className="text-error text-sm">{error}</p>}

          <div className="modal-action mt-2">
            <button
              type="button"
              className="btn"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {t("dayCard.newActivity")}
            </button>
          </div>
        </form>
      </div>
      {/* Fechar ao clicar fora */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

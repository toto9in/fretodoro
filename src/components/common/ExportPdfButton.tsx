import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FileDown } from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export function ExportPdfButton() {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const path = await save({
      filters: [{ name: "PDF", extensions: ["pdf"] }],
      defaultPath: "cronograma-fretodoro.pdf",
    });
    if (!path) return;

    setIsExporting(true);
    try {
      await invoke("export_schedule_pdf", { path, lang: i18n.language });
    } finally {
      setIsExporting(false);
    }
  }, [i18n.language]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn btn-ghost btn-sm btn-square"
      title={t("app.exportPdf")}
    >
      {isExporting ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <FileDown size={18} />
      )}
    </button>
  );
}

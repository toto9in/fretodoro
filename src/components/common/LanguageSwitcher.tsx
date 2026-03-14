import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../i18n/config";
import { Settings } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "pt-BR", label: "PT-BR" },
];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-square"
        title={t("app.language")}
      >
        <Settings size={18} />
      </div>
      <ul
        tabIndex={-1}
        className="menu dropdown-content bg-base-200 rounded-box z-10 w-28 p-1 shadow-sm"
      >
        {LANGUAGES.map(({ code, label }) => (
          <li key={code}>
            <button
              className={i18n.language === code ? "menu-active" : ""}
              onClick={() => changeLanguage(code)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

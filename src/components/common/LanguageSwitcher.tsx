import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config';
import { Settings } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt-BR', label: 'PT-BR' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost btn-sm btn-square" title="Language / Idioma">
        <Settings size={16} />
      </summary>
      <ul className="menu dropdown-content bg-base-200 rounded-box z-10 w-28 p-1 shadow-sm">
        {LANGUAGES.map(({ code, label }) => (
          <li key={code}>
            <button
              className={i18n.language === code ? 'menu-active' : ''}
              onClick={() => changeLanguage(code)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

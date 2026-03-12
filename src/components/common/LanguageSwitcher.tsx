import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/config';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      className="select select-bordered select-sm ml-4"
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="pt-BR">PT-BR</option>
      <option value="en">EN</option>
    </select>
  );
}

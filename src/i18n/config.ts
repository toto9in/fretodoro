import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { load } from '@tauri-apps/plugin-store';

import translationEN from './locales/en/translation.json';
import translationPTBR from './locales/pt-BR/translation.json';

const resources = {
  en: { translation: translationEN },
  'pt-BR': { translation: translationPTBR },
};

export const STORE_FILENAME = 'settings.json';
export const LANG_STORE_KEY = 'app_language';

export async function initI18n() {
  let initialLang = 'pt-BR'; // default fallback

  try {
    // Check if running in Tauri environment
    if (window.__TAURI_INTERNALS__) {
      const store = await load(STORE_FILENAME, { autoSave: false, defaults: {} });
      const savedLang = await store.get<{ value: string }>(LANG_STORE_KEY);
      if (savedLang?.value) {
        initialLang = savedLang.value;
      }
    } else {
      // Fallback for browser testing
      const browserLang = localStorage.getItem(LANG_STORE_KEY);
      if (browserLang) {
        initialLang = browserLang;
      }
    }
  } catch (error) {
    console.error('Failed to load language from store:', error);
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: 'pt-BR',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });

  return i18n;
}

export async function changeLanguage(lng: string) {
  await i18n.changeLanguage(lng);
  try {
    if (window.__TAURI_INTERNALS__) {
      const store = await load(STORE_FILENAME, { autoSave: false, defaults: {} });
      await store.set(LANG_STORE_KEY, { value: lng });
      await store.save();
    } else {
      localStorage.setItem(LANG_STORE_KEY, lng);
    }
  } catch (error) {
    console.error('Failed to save language to store:', error);
  }
}

export default i18n;

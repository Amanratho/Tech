import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files import
import translationEN from './locales/en.json';
import translationHI from './locales/hi.json';

const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    hi: { translation: translationHI },
  },
  lng: savedLanguage, // Default language
  fallbackLng: 'en', // Fallback language
  interpolation: { escapeValue: false },
});

export default i18n;

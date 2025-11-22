import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

// Detectar idioma del navegador o usar español por defecto
const getDefaultLanguage = () => {
  const savedLanguage = localStorage.getItem('huerta_language');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  const browserLanguage = navigator.language.split('-')[0];
  return ['es', 'en'].includes(browserLanguage) ? browserLanguage : 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: es,
      en: en
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    react: {
      useSuspense: false // Evitar suspense para mayor compatibilidad
    }
  });

// Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('huerta_language', lng);
  console.log('🌍 Language changed to:', lng);
});

export default i18n;

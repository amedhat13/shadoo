import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextValue {
  language: string;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  direction: 'ltr',
  isRTL: false,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  const language = i18n.language || 'en';
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', direction);
    html.setAttribute('lang', language);

    // Update body font family for Arabic
    if (isRTL) {
      document.body.classList.add('font-ar');
      document.body.classList.remove('font-en');
    } else {
      document.body.classList.add('font-en');
      document.body.classList.remove('font-ar');
    }
  }, [direction, language, isRTL]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, isRTL, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

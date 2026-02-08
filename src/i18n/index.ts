import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// EN translations
import commonEN from './locales/en/common.json';
import navEN from './locales/en/nav.json';
import dashboardEN from './locales/en/dashboard.json';
import missionsEN from './locales/en/missions.json';
import branchesEN from './locales/en/branches.json';
import walletEN from './locales/en/wallet.json';
import settingsEN from './locales/en/settings.json';
import authEN from './locales/en/auth.json';
import landingEN from './locales/en/landing.json';
import adminEN from './locales/en/admin.json';

// AR translations
import commonAR from './locales/ar/common.json';
import navAR from './locales/ar/nav.json';
import dashboardAR from './locales/ar/dashboard.json';
import missionsAR from './locales/ar/missions.json';
import branchesAR from './locales/ar/branches.json';
import walletAR from './locales/ar/wallet.json';
import settingsAR from './locales/ar/settings.json';
import authAR from './locales/ar/auth.json';
import landingAR from './locales/ar/landing.json';
import adminAR from './locales/ar/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEN,
        nav: navEN,
        dashboard: dashboardEN,
        missions: missionsEN,
        branches: branchesEN,
        wallet: walletEN,
        settings: settingsEN,
        auth: authEN,
        landing: landingEN,
        admin: adminEN,
      },
      ar: {
        common: commonAR,
        nav: navAR,
        dashboard: dashboardAR,
        missions: missionsAR,
        branches: branchesAR,
        wallet: walletAR,
        settings: settingsAR,
        auth: authAR,
        landing: landingAR,
        admin: adminAR,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'nav', 'dashboard', 'missions', 'branches', 'wallet', 'settings', 'auth', 'landing', 'admin'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'shadoo-lang',
    },
  });

export default i18n;

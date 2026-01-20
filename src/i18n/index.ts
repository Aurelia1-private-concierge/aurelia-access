import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Production debugging
const log = (msg: string) => console.log(`[i18n ${Date.now()}] ${msg}`);

log("i18n module loading");

import en from "./translations/en.json";
import fr from "./translations/fr.json";
import de from "./translations/de.json";
import ar from "./translations/ar.json";
import zh from "./translations/zh.json";
import ru from "./translations/ru.json";
import es from "./translations/es.json";
import it from "./translations/it.json";

log("i18n translations imported");

export const languages = [
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "it", name: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "ru", name: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  ar: { translation: ar },
  zh: { translation: zh },
  ru: { translation: ru },
  es: { translation: es },
  it: { translation: it },
};

// Wrap initialization in try-catch to prevent blocking
try {
  log("i18n initializing...");
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
  log("i18n initialized successfully");
} catch (error) {
  console.error("i18n initialization failed:", error);
}

// Update document direction for RTL languages
try {
  i18n.on("languageChanged", (lng) => {
    const language = languages.find((l) => l.code === lng);
    if (language) {
      document.documentElement.dir = language.dir;
      document.documentElement.lang = lng;
    }
  });
} catch (error) {
  console.error("i18n language change listener failed:", error);
}

log("i18n module complete");

export default i18n;

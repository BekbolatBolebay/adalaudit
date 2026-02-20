"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Locale = "kz" | "ru"

type Translations = {
  [key: string]: { kz: string; ru: string }
}

const translations: Translations = {
  // Header
  "app.title": { kz: "ADAL-AUDIT | Цифрлық тергеуші", ru: "ADAL-AUDIT | Цифровой следователь" },
  "app.subtitle": { kz: "Сот-сараптамалық платформа", ru: "Судебно-экспертная платформа" },
  "user.role": { kz: "ДЭР Майоры", ru: "Майор ДЭР" },
  "user.name": { kz: "Сериков А.М.", ru: "Сериков А.М." },

  // Sidebar
  "nav.scanner": { kz: "Сканер", ru: "Сканер" },
  "nav.cases": { kz: "Іс тарихы", ru: "История дел" },
  "nav.legal": { kz: "Заң базасы", ru: "Правовая база" },
  "nav.settings": { kz: "Баптаулар", ru: "Настройки" },

  // Scanner
  "scanner.title": { kz: "AI Криминалистикалық сканер", ru: "AI Криминалистический сканер" },
  "scanner.dropzone": { kz: "PDF/DOCX файлдарын осында сүйреңіз", ru: "Перетащите PDF/DOCX файлы сюда" },
  "scanner.dropzone.sub": { kz: "немесе файлды таңдау үшін басыңыз", ru: "или нажмите для выбора файла" },
  "scanner.formats": { kz: "Қабылданатын форматтар: PDF, DOCX (макс. 50МБ)", ru: "Допустимые форматы: PDF, DOCX (макс. 50МБ)" },
  "scanner.processing": { kz: "Цифрлық дәлелдемелерді өңдеу", ru: "Обработка цифровых доказательств" },
  "scanner.step1": { kz: "Латын әріптерін ауыстыруды іздеу...", ru: "Поиск замен латинских букв..." },
  "scanner.step2": { kz: "Бренд фаворитизмін тексеру...", ru: "Проверка фаворитизма брендов..." },
  "scanner.step3": { kz: "Нарықтық бағаларды талдау...", ru: "Анализ рыночных цен..." },
  "scanner.risk": { kz: "Манипуляция ықтималдығы", ru: "Вероятность манипуляций" },
  "scanner.upload": { kz: "Файлды жүктеу", ru: "Загрузить файл" },

  // Risk levels
  "risk.critical": { kz: "СЫНИ", ru: "КРИТИЧЕСКИЙ" },
  "risk.high": { kz: "ЖОҒАРЫ", ru: "ВЫСОКИЙ" },
  "risk.medium": { kz: "ОРТАША", ru: "СРЕДНИЙ" },
  "risk.low": { kz: "ТӨМЕН", ru: "НИЗКИЙ" },

  // Forensic view
  "forensic.title": { kz: "Криминалистикалық салыстыру", ru: "Криминалистическое сравнение" },
  "forensic.original": { kz: "Түпнұсқа (RU)", ru: "Оригинал (RU)" },
  "forensic.translation": { kz: "Заңды аударма (KZ)", ru: "Юридический перевод (KZ)" },
  "forensic.violations": { kz: "Табылған бұзушылықтар", ru: "Обнаруженные нарушения" },

  // Protocol
  "protocol.title": { kz: "Протокол осмотра (Жоба)", ru: "Протокол осмотра (Проект)" },
  "protocol.export": { kz: "DOCX-ға экспорттау", ru: "Экспорт в DOCX" },
  "protocol.time": { kz: "Уақыты", ru: "Время" },
  "protocol.place": { kz: "Орны", ru: "Место" },
  "protocol.objective": { kz: "Мақсаты", ru: "Цель" },
  "protocol.evidence": { kz: "Табылған дәлелдемелер", ru: "Обнаруженные доказательства" },
  "protocol.legal": { kz: "Заңға сілтеме", ru: "Ссылка на закон" },
  "protocol.investigator": { kz: "Тергеуші", ru: "Следователь" },

  // Status
  "status.ready": { kz: "Талдауға дайын", ru: "Готов к анализу" },
  "status.scanning": { kz: "Сканерлеу...", ru: "Сканирование..." },
  "status.complete": { kz: "Талдау аяқталды", ru: "Анализ завершён" },

  // Notifications
  "notif.title": { kz: "Хабарландырулар", ru: "Уведомления" },
  "notif.new_case": { kz: "Жаңа іс тағайындалды", ru: "Назначено новое дело" },
  "notif.scan_complete": { kz: "Сканерлеу аяқталды", ru: "Сканирование завершено" },

  // Language
  "lang.toggle": { kz: "RU", ru: "KZ" },
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru")

  const t = (key: string): string => {
    return translations[key]?.[locale] ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}

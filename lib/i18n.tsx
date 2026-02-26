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
  "nav.network": { kz: "Байланыс талдау", ru: "Анализ связей" },
  "nav.legal": { kz: "Заң базасы", ru: "Правовая база" },
  "nav.settings": { kz: "Баптаулар", ru: "Настройки" },

  // Scanner
  "scanner.title": { kz: "AI Криминалистикалық сканер", ru: "AI Криминалистический сканер" },
  "scanner.dropzone": { kz: "PDF/DOCX файлдарын осында сүйреңіз", ru: "Перетащите PDF/DOCX файлы сюда" },
  "scanner.dropzone.sub": { kz: "немесе файлды таңдау үшін басыңыз", ru: "или нажмите для выбора файла" },
  "scanner.formats": { kz: "Қабылданатын форматтар: PDF, DOCX (макс. 50МБ)", ru: "Допустимые форматы: PDF, DOCX (макс. 50МБ)" },
  "scanner.processing": { kz: "Цифрлық дәлелдемелерді өңдеу", ru: "Обработка цифровых доказательств" },
  "scanner.step1": { kz: "Құжат мазмұнын талдау...", ru: "Анализ содержимого документа..." },
  "scanner.step2": { kz: "Манипуляциялар мен тәуекелдерді іздеу...", ru: "Поиск манипуляций и рисков..." },
  "scanner.step3": { kz: "Сараптамалық қорытындыны дайындау...", ru: "Подготовка экспертного заключения..." },
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

  // Tracking
  "tracking.tokens": { kz: "Токендер", ru: "Токены" },
  "quota.estimation_note": { kz: "Болжамды мән", ru: "Оценочное значение" },
  "settings.offline_mode": { kz: "Автономды режим", ru: "Автономный режим" },
  "settings.offline_mode.sub": { kz: "Байланыс болмаған жағдайда сараптамалық деректердің тұрақтылығын қамтамасыз ету", ru: "Обеспечение стабильности экспертных данных при отсутствии связи" },

  // Network Analysis
  "network.title": { kz: "Байланысты талдау", ru: "Анализ связей" },
  "network.form.customer": { kz: "Тапсырыс беруші", ru: "Заказчик" },
  "network.form.winner": { kz: "Жеңімпаз", ru: "Победитель" },
  "network.form.bin": { kz: "БСН (міндетті)", ru: "БИН (обязательно)" },
  "network.form.submit": { kz: "Байланысты тексеру", ru: "Проверить связи" },
  "network.risk.index": { kz: "Тәуекел индексі", ru: "Индекс риска" },
  "network.risk.explanation": { kz: "Төменде анықталған байланыстар мен тарихи деректер негізінде есептелген.", ru: "Рассчитано на основе выявленных связей и исторических данных." },

  "network.card.founders": { kz: "Ортақ құрылтайшылар", ru: "Общие учредители" },
  "network.card.address": { kz: "Мекенжай сәйкестігі", ru: "Совпадение адресов" },
  "network.card.repeated": { kz: "Қайталанатын келісімшарттар", ru: "Повторные контракты" },
  "network.card.related": { kz: "Байланысты компаниялар", ru: "Связанные компании" },
  "network.card.evidence": { kz: "Дәлелді көрсету", ru: "Показать доказательство" },

  "network.stats.total": { kz: "Жалпы тендер саны (3 жыл)", ru: "Всего тендеров (3 года)" },
  "network.stats.unique": { kz: "Бірегей жеңімпаздар саны", ru: "Количество уникальных победителей" },
  "network.stats.frequent": { kz: "Ең жиі жеңген компания", ru: "Самый частый победитель" },
  "network.stats.average": { kz: "Орташа сома", ru: "Средняя сумма" },

  "network.charts.frequency": { kz: "Жеңістер жиілігінің графигі", ru: "График частоты побед" },
  "network.charts.dynamics": { kz: "Баға динамикасы", ru: "Динамика цен" },

  "network.alert.title": { kz: "Күмәнді үрдіс анықталды", ru: "Обнаружена подозрительная закономерность" },
  "network.evidence.title": { kz: "Дәлелдемелер панелі", ru: "Панель доказательств" },
  "network.evidence.quote": { kz: "Цитата", ru: "Цитата" },
  "network.evidence.date": { kz: "Күні", ru: "Дата" },
  "network.evidence.amount": { kz: "Сома", ru: "Сумма" },
  "network.evidence.source": { kz: "Дереккөз", ru: "Источник" },
  "network.evidence.confidence": { kz: "Сенімділік деңгейі", ru: "Уровень уверенности" },
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("kz")

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

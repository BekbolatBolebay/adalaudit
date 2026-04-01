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
  "scanner.expert_console": { kz: "Expert Forensic Console (Logic)", ru: "Экспертная форензик-консоль" },
  "scanner.meta.location": { kz: "Жеткізу орны", ru: "Место поставки" },
  "scanner.meta.payment": { kz: "Төлем шарттары", ru: "Условия оплаты" },

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
  "network.form.customer_bin": { kz: "Тапсырыс беруші БСН-і", ru: "БИН Заказчика" },
  "network.form.winner": { kz: "Жеңімпаз / Қатысушы", ru: "Победитель / Участник" },
  "network.form.bin": { kz: "Жеңімпаз БСН-і (міндетті)", ru: "БИН Победителя (обязательно)" },
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
  
  // Hero / Intro
  "hero.title": { kz: "ADAL-AUDIT: Цифрлық егемендік және әділдік", ru: "ADAL-AUDIT: Цифровой суверенитет и справедливость" },
  "hero.subtitle": { kz: "Мемлекеттік сатып алуларды форензик-талдауға арналған 100% дербес AI платформасы", ru: "100% суверенная AI-платформа для форензик-анализа государственных закупок" },
  "hero.feat1.title": { kz: "Деректер егемендігі", ru: "Суверенитет данных" },
  "hero.feat1.desc": { kz: "Барлық талдау локальді желіде, интернетсіз орындалады. Деректер қауіпсіздігі 100%.", ru: "Весь анализ выполняется в локальной сети, без интернета. Безопасность данных 100%." },
  "hero.feat2.title": { kz: "Криминалистикалық логика", ru: "Криминалистическая логика" },
  "hero.feat2.desc": { kz: "Unicode манипуляцияларын, жасырын таңбаларды және бағаны асыра көрсетуді автоматты анықтау.", ru: "Автоматическое обнаружение Unicode-манипуляций, скрытых символов и завышения цен." },
  "hero.feat3.title": { kz: "Ресми хаттама", ru: "Официальный протокол" },
  "hero.feat3.desc": { kz: "Талдау нәтижесі бойынша экспортқа дайын заңды күші бар хаттама жобасын жасау.", ru: "Генерация готового к экспорту проекта протокола с юридической силой по результатам анализа." },
  "hero.start": { kz: "Жұмысты бастау", ru: "Начать работу" },
  
  // Landing Page Premium
  "landing.welcome": { kz: "ҚОШ КЕЛДІҢІЗДЕР", ru: "ДОБРО ПОЖАЛОВАТЬ" },
  "landing.title": { kz: "Адал Аудит: Мемлекеттік сатып алулардағы әділдік", ru: "Адал Аудит: Правосудие в государственных закупках" },
  "landing.tagline": { kz: "Жасанды интеллект негізіндегі алғашқы отандық форензик-платформа", ru: "Первая отечественная форензик-платформа на базе искусственного интеллекта" },
  "landing.cta": { kz: "Платформаға кіру", ru: "Войти в платформу" },
  "landing.features.title": { kz: "Неліктен ADAL-AUDIT?", ru: "Почему ADAL-AUDIT?" },
  "landing.sov.title": { kz: "100% Цифрлық егемендік", ru: "100% Цифровой суверенитет" },
  "landing.sov.desc": { kz: "Деректер ешқашан сыртқы серверлерге жіберілмейді. Барлық есептеулер оқшауланған ортада өтеді.", ru: "Данные никогда не передаются на внешние серверы. Все вычисления проходят в изолированной среде." },
  "landing.logic.title": { kz: "Терең форензик-талдау", ru: "Глубокий форензик-анализ" },
  "landing.logic.desc": { kz: "Мәтіндегі Unicode манипуляцияларын, жасырын кедергілерді және бағаның асыра көрсетілуін анықтау.", ru: "Выявление Unicode-манипуляций, скрытых барьеров и завышения цен в тексте." },
  "landing.impact.title": { kz: "Мемлекеттік маңыздылық", ru: "Государственная значимость" },
  "landing.impact.desc": { kz: "Бюджет қаражатын тиімді пайдалануды бақылау және заңсыз әрекеттердің алдын алу құралы.", ru: "Инструмент контроля эффективности использования бюджетных средств и предотвращения незаконных действий." },
  "landing.footer": { kz: "inDrive Hackathon: AI for Government трегіне арнайы әзірленген", ru: "Разработано специально для трека AI for Government хакатона inDrive" },
  
  // Premium Landing Page Elements
  "landing.sov.sub": { kz: "ЕГЕМЕН ИНТЕЛЛЕКТ", ru: "СУВЕРЕННЫЙ ИНТЕЛЛЕКТ" },
  "landing.nav.analysis": { kz: "Талдау", ru: "Анализ" },
  "landing.nav.sovereign": { kz: "Егемен", ru: "Суверенный" },
  "landing.nav.security": { kz: "Қауіпсіздік", ru: "Безопасность" },
  "landing.nav.logs": { kz: "Журналдар", ru: "Журналы" },
  "landing.lang.switch": { kz: "RU тіліне ауысу", ru: "Перейти на RU" },
  "landing.lang.switch_ru": { kz: "KZ тіліне ауысу", ru: "Перейти на KZ" },
  "landing.access_portal": { kz: "ПОРТАЛҒА КІРУ", ru: "ВХОД В ПОРТАЛ" },
  "landing.core_deployed": { kz: "ЕГЕМЕН ЯДРО ОРНАТЫЛДЫ", ru: "СУВЕРЕННОЕ ЯДРО РАЗВЕРНУТО" },
  "landing.feat.airgapped": { kz: "ОҚШАУЛАНҒАН СӘЙКЕСТІК", ru: "ИЗОЛИРОВАННОЕ СООТВЕТСТВИЕ" },
  "landing.feat.airgapped.desc": { kz: "100% Деректер егемендігі", ru: "100% Суверенитет данных" },
  "landing.feat.deterministic": { kz: "ДЕТЕРМИНИСТИКАЛЫҚ ФОРЕНЗИКА", ru: "ДЕТЕРМИНИСТИЧЕСКАЯ ФОРЕНЗИКА" },
  "landing.feat.deterministic.desc": { kz: "Галлюцинациясыз логика", ru: "Логика без галлюцинаций" },
  "landing.feat.govtech": { kz: "GOVTECH ОРЫНДАУ", ru: "GOVTECH ИСПОЛНЕНИЕ" },
  "landing.feat.govtech.desc": { kz: "Протокол дайын интеграция", ru: "Интеграция готова к протоколу" },
  "landing.stat.precision": { kz: "АНЫҚТАУ_ДӘЛДІГІ", ru: "ТОЧНОСТЬ_ОБНАРУЖЕНИЯ" },
  "landing.stat.precision.sub": { kz: "Үлгі дәлдігінің дельтасы", ru: "Дельта точности паттерна" },
  "landing.stat.latency": { kz: "ІШКІ_КІДІРІС", ru: "ВНУТРЕННЯЯ_ЗАДЕРЖКА" },
  "landing.stat.latency.sub": { kz: "Локальді NLP инференс", ru: "Локальный NLP инференс" },
  "landing.stat.dependency": { kz: "НӨЛДІК_ТӘУЕЛДІЛІК", ru: "НУЛЕВАЯ_ЗАВИСИМОСТЬ" },
  "landing.stat.dependency.sub": { kz: "Егемен фреймворк", ru: "Суверенный фреймворк" },
  "landing.stat.unit_status": { kz: "UNIT_КҮЙІ_G-01", ru: "СТАТУС_UNIT_G-01" },
  "landing.stat.unit_status.sub": { kz: "Операциялық тұтастық", ru: "Операционная целостность" },
  "landing.bento.arch": { kz: "АРХИТЕКТУРА_ҮСТЕМДІГІ", ru: "ПРЕВОСХОДСТВО_АРХИТЕКТУРЫ" },
  "landing.cta.justice": { kz: "ӘДІЛДІК", ru: "ПРАВОСУДИЕ" },
  "landing.cta.truth": { kz: "ШЫНДЫҚ.", ru: "ИСТИНА." },
  "landing.cta.enforced": { kz: "ОРЫНДАЛДЫ.", ru: "ИСПОЛНЕНО." },
  "landing.footer.unit": { kz: "Сандық егемендікті қамтамасыз ету бөлімі", ru: "Отдел обеспечения цифрового суверенитета" },
  "landing.footer.index": { kz: "БӨЛІМ_ИНДЕКСІ", ru: "ИНДЕКС_ОТДЕЛА" },
  "landing.footer.online": { kz: "UNIT_G01_ОНЛАЙН", ru: "UNIT_G01_ОНЛАЙН" },
  "landing.footer.rights": { kz: "© 2026 DECENTRATHON 5.0 — ҰЛТТЫҚ ФОРЕНЗИК ЕНГИНЕ", ru: "© 2026 DECENTRATHON 5.0 — НАЦИОНАЛЬНЫЙ ФОРЕНЗИК ДВИЖОК" },

  // Tender URL feature
  "nav.tender_audit": { kz: "Тендер аудиті", ru: "Аудит тендера" },
  "tender.title": { kz: "Тендерді сілтеме арқылы талдау", ru: "Анализ тендера по ссылке" },
  "tender.input.label": { kz: "Тендер сілтемесін енгізіңіз", ru: "Введите ссылку на тендер" },
  "tender.input.placeholder": { kz: "goszakup.gov.kz/utender/show/...", ru: "goszakup.gov.kz/utender/show/..." },
  "tender.button.analyze": { kz: "Талдауды бастау", ru: "Начать анализ" },
  "tender.status.fetching": { kz: "Деректерді алу...", ru: "Получение данных..." },
  "tender.recommendation.title": { kz: "Сарапшылық ұсыныс", ru: "Экспертная рекомендация" },
  "tender.recommendation.desc": { kz: "Талдау нәтижелерін негізге ала отырып, Экономикалық тергеу департаментіне (ЭТД) ресми сұраныс жіберу ұсынылады.", ru: "На основании результатов анализа рекомендуется направить официальный запрос в Департамент экономических расследований (ДЭР)." },
  "tender.button.protocol": { kz: "Ресми хаттама қалыптастыру", ru: "Сформировать официальный протокол" },
  "tender.label.budget": { kz: "Мәлімделген бюджет", ru: "Заявленный бюджет" },
  "tender.label.violations": { kz: "Бұзушылықтар журналы", ru: "Журнал нарушений" },

  // Scanner Additional
  "scanner.error.no_result": { kz: "Талдау нәтижесі алынбады. Жүйені немесе файлды тексеріңіз.", ru: "Результаты анализа не получены. Проверьте систему или файл." },
  "scanner.error.unsupported": { kz: "Қолдау көрсетілмейтін файл форматы. PDF немесе DOCX жүктеңіз.", ru: "Неподдерживаемый формат файла. Пожалуйста, используйте PDF или DOCX." },
  "scanner.phase.scanning": { kz: "ЗЕРТТЕЛУДЕ", ru: "ИССЛЕДУЕТСЯ" },
  "scanner.phase.cached": { kz: "КЭШТЕЛГЕН", ru: "ИЗ КЭША" },
  "scanner.phase.analyzed": { kz: "ТАЛДАНДЫ", ru: "ПРОАНАЛИЗИРОВАНО" },
  "scanner.button.reset": { kz: "Қайта", ru: "Заново" },
  "scanner.error.title": { kz: "Талдау қатесі", ru: "Ошибка анализа" },
  "scanner.button.retry": { kz: "Қайталау", ru: "Повторить" },
  "scanner.button.market_check": { kz: "Нарықтық бағаны тексеру", ru: "Проверить рыночные цены" },

  // Dashboard Additional
  "dash.error.connection": { kz: "Жүйемен байланыс қатесі (Connection Error)", ru: "Ошибка связи с системой (Connection Error)" },
  "dash.violations.found": { kz: "ТАБЫЛҒАН БҰЗУШЫЛЫҚТАР", ru: "НАЙДЕННЫЕ НАРУШЕНИЯ" },
  "dash.comparison.hide": { kz: "САЛЫСТЫРУДЫ ЖАСЫРУ", ru: "СКРЫТЬ СРАВНЕНИЕ" },
  "dash.comparison.show": { kz: "ТОЛЫҚ САЛЫСТЫРУДЫ КӨРСЕТУ", ru: "ПОКАЗАТЬ ПОЛНОЕ СРАВНЕНИЕ" },

  // Forensic Comparison Additional
  "forensic.badge": { kz: "ҚҰҚЫҚТЫҚ АЙ ТАЛДАУ", ru: "ПРАВОВОЙ ИИ АНАЛИЗ" },
  "forensic.violations.count": { kz: "БҰЗУШЫЛЫҚТАР", ru: "НАРУШЕНИЙ" },
  "forensic.expert.name": { kz: "ADAL AI САРАПШЫСЫ", ru: "ADAL AI ЭКСПЕРТ" },
  "forensic.original.loading": { kz: "Түпнұсқа мәтінді талдау...", ru: "Анализ оригинального текста..." },
  "forensic.waiting": { kz: "Деректер күтілуде...", ru: "Ожидание данных..." },
  "forensic.translated.loading": { kz: "Құқықтық аударма жасалуда...", ru: "Генерация правового перевода..." },
  "protocol.loading": { kz: "Протокол жасалуда...", ru: "Формирование протокола..." },
  "protocol.project": { kz: "РЕСМИ ҚҰЖАТ ЖОБАСЫ", ru: "ПРОЕКТ ОФИЦИАЛЬНОГО ДОКУМЕНТА" },
  "protocol.signature": { kz: "Қолы", ru: "Подпись" },
  "protocol.date": { kz: "Күні", ru: "Дата" },
  "scanner.analysis.suffix": { kz: "ТАЛДАУЫ", ru: "АНАЛИЗ" },
  "header.status.live": { kz: "БЕЛСЕНДІ", ru: "В СЕТИ" },
  "header.app_title": { kz: "ADAL AUDIT", ru: "ADAL AUDIT" },
  
  // New Tender Result Keys
  "scanner.result.sector": { kz: "Экономика секторы", ru: "Сектор экономики" },
  "scanner.result.winning_prob": { kz: "Ұту ықтималдығы", ru: "Вероятность выигрыша" },
  "scanner.result.traps": { kz: "Жасырын тұзақтар (Traps)", ru: "Скрытые ловушки (Traps)" },
  "scanner.result.submission_guide": { kz: "Тапсыру бойынша нұсқаулық", ru: "Инструкция по подаче" },
  "scanner.result.winning_prob.high": { kz: "ЖОҒАРЫ", ru: "ВЫСОКАЯ" },
  "scanner.result.winning_prob.med": { kz: "ОРТАША", ru: "СРЕДНЯЯ" },
  "scanner.result.winning_prob.low": { kz: "ТӨМЕН", ru: "НИЗКАЯ" },
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

<div align="center">

# ⚖️ Adal Audit — Sovereign Forensic Platform

> **Мемлекеттік сатып алуларды форензик-аудиттеуге және сыбайлас жемқорлықты анықтауға арналған 100% дербес (Sovereign) AI платформасы**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Logic-Python%203.11-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![SovereignAI](https://img.shields.io/badge/AI-Sovereign%20Only-orange?style=flat-square)](https://github.com/BekbolatBolebay/adalaudit)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📌 Проблема және құндылық

### Текущее состояние

Мемлекеттік сатып алулардағы басты кедергі — деректердің құпиялылығы және манипуляцияларды анықтаудың қиындығы. Бұл келесі жүйелі дисфункцияларға әкеледі:

| Проблема | Последствие |
|----------|-------------|
| **Деректердің ағып кетуі** | Құжаттарды сыртқы ИИ-ге (бұлтқа) жіберу ақпараттық қауіпсіздікке қатер төндіреді |
| **Unicode манипуляциясы** | Кириллица таңбаларын латынмен алмастыру арқылы іздеу жүйелерін алдау |
| **Бағаны асыра көрсету** | Нарықтық бағамен салыстырудың болмауы бюджет қаражатының тиімсіз жұмсалуына әкеледі |
| **Қолмен тексеру** | Сараптамалық хаттамаларды қолмен толтыру ұзақ және қателіктерге толы процесс |

### Решение: Adal Audit (Sovereign AI)

**Adal Audit** бұл мәселені **Local-First** тәсілімен шешеді. Барлық талдаулар локальді желіде (Air-Gapped), интернетсіз орындалады. Жүйе құжатты сканерлеп, манипуляцияларды анықтайды және ДЭР экспертіне дайын хаттама жобасын ұсынады.

> **Принцип:** ИИ — эксперттің көмекшісі, эксперт — финальный арбитр. Барлық шешімдер тек локальді есептеулерге негізделген.

---

## ✨ Ключевые возможности

### 1. 🤖 Sovereign AI Scanner
- Құжаттарды (PDF/DOCX) локальді машинада 100% құпия талдау.
- Деректер ешқашан сыртқы серверлерге (Cloud) жіберілмейді.

### 2. 🛡️ Dual-Layer Forensic Engine

```
Слой 1: Heuristic Rules (Deterministic) — Unicode манипуляциясын 99% дәлдікпен анықтау
Слой 2: Local NLP Engine (Semantic)   — Құжаттағы жасырын кедергілер мен заң бұзушылықтарды табу
```

**Unicode Detection** қозғалтқышы келесі манипуляцияларды табады:
- `TRANS_LATIN_CYRILLIC` — латын әріптерін кириллица арасында қолдану.
- `HIDDEN_SYMBOLS` — мәтіндегі жасырын пробелдер мен таңбалар.
- `CONTEXT_MISMATCH` — техникалық ерекшелік пен лот атауының сәйкес келмеуі.

### 3. 📊 Market Price Integration
- Тендерлік бағаны нарықтық (Global/Local) көрсеткіштермен салыстыру.
- Бюджеттік шығынды автоматты түрде есептеп, "Risk Gauge" арқылы көрсету.

### 4. 🗣️ Local Forensic Expert Chat
- Талдау нәтижесі бойынша кәсіби инспектор-ботпен сұхбат.
- Табылған бұзушылықтарды ҚР заңнамасы тұрғысынан түсіндіріп беру.

### 5. ✅ Bilingual Legal Verdicts (RU / KZ)
- Барлық талдау нәтижелері мен хаттамалар екі тілде (Қазақ/Орыс) автоматты түрде дайындалады.

---

## 🏗️ Архитектура системы

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                 │
│  Scanner Dashboard │ Risk Analytics │ Forensic Chat      │
└────────────────────────────┬────────────────────────────┘
                             │ Local REST API (Next-to-AI)
                             ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Python FastAPI Service)             │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ forensic_eng │  │ price_engine │  │ legal_expert  │  │
│  │ Unicode Det  │  │ Market Comp  │  │ Local Chat    │  │
│  │ Rule-based   │  │ Diff Calc    │  │ Specialist    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│                    ┌──────▼──────┐                      │
│                    │ Protocol Gen│ (Official Draft)    │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    Local PDF/DocX      Legal Laws DB     Market Price DB
    (Analysis Source)   (Compliance)       (Reference)
```

---

## 🚀 Инструкция по запуску

### Требования
- **Node.js**: 18.0+
- **Python**: 3.10+
- **OS**: Windows / Linux / macOS (Local execution only)

### 1. Клонировать репозиторий
```bash
git clone https://github.com/BekbolatBolebay/adalaudit.git
cd adalaudit
```

### 2. ML-сервисті (Python) іске қосу
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*Backend `http://localhost:8000` портында іске қосылады.*

### 3. Frontend-ті (Next.js) іске қосу
```bash
# Негізгі папкаға оралу
npm install
npm run dev
```
*Приложение `http://localhost:3000` адресінде қолжетімді.*

---

## 🛠️ Технологический стек

| Слой | Технология | Назначение |
|------|-----------|------------|
| **Frontend** | Next.js 15 + TS | UI және API Gateway |
| **Backend** | FastAPI (Python) | Forensic / ML logic |
| **Logic** | Heuristic Engine | Unicode манипуляциясын тану |
| **Styling** | Tailwind CSS | Кәсіби Dashboard дизайны |
| **I18n** | Custom Native | Билингвальді қолдау (RU/KZ) |
| **Chat** | Local NLP | Сараптамалық сұхбат жүйесі |

---

## 📡 API Reference

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `POST` | `/analyze` | Құжатты толық сканерлеу (Unicode, Risks) |
| `POST` | `/chat` | Локальді экспертпен сұхбат |
| `POST` | `/protocol` | Ресми хаттама жобасын жасау |
| `POST` | `/translate` | Заңдық терминдерді аудару |

---

## 📋 Соответствие требованиям ТЗ

| Требование | Статус | Реализация |
|-----------|--------|-----------|
| **Explainability** | ✅ | Әрбір бұзушылықтың неге қауіпті екенін түсіндіретін чат пен хаттама. |
| **Data Sovereignty** | ✅ | Деректерді бұлтқа (Gemini/GPT) жібермеу, тек локальді талдау. |
| **Билингвальный интерфейс** | ✅ | Барлық интерфейс пен талдау Қазақ және Орыс тілдерінде. |
| **Forensic Logic** | ✅ | Unicode манипуляцияларын табудың бірегей алгоритмдері. |
| **Visual UX** | ✅ | Премиум Landing Page және интерактивті Risk Gauges. |

---

## 🗺️ Roadmap

| Этап | Функциональность | Статус |
|------|-----------------|--------|
| **Phase 1** | Локальді сканер және Unicode талдау | ✅ Дайын |
| **Phase 2** | Нарықтық бағалар базасын кеңейту | 🔄 Жоспарда |
| **Phase 3** | ДЭР ресми базасына интеграция (Mock) | 🔄 Жоспарда |

---

## 👥 Команда
- **Bekbolat Bolebay** — Lead Fullstack / ML Engineer

---

<div align="center">

**Adal Audit** — Адалдық деректен басталады

*Сделано специально для хакатона inDrive | AI for Government*

---

📐 [ARCHITECTURE.md](ARCHITECTURE.md) · 📸 [docs/](docs/) · 🏁 [Submission](SUBMISSION.md)

</div>
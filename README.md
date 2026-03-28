# ⚖️ Adal Audit — Sovereign Forensic Platform

**Adal Audit** (Адал Аудит) — бұл мемлекеттік сатып алуларды форензик-аудиттеуге және сыбайлас жемқорлық қауіптерін анықтауға арналған **100% дербес (sovereign)** локальді платформа. 

Жобаның басты ерекшелігі — ол сыртқы ИИ сервистеріне (Gemini/ChatGPT) тәуелді емес. Барлық талдаулар мен аудармалар **локальді Python ML-микросервисі** арқылы, деректердің қауіпсіздігін (Data Sovereignty) сақтай отырып орындалады.

## 🚀 Негізгі мүмкіндіктер

- **Sovereign AI Scanner**: Құжаттарды (PDF/Мәтін) локальді машинада талдау. Сыртқы желіге деректер шықпайды.
- **Forensic Engine**: Мәтіндегі Unicode-манипуляцияны (латын әріптерімен алмастыру), жасырын техникалық кедергілерді және бағаны негізсіз көтеруді автоматты түрде анықтау.
- **Market Price Analysis**: Тендерлік бағаны нарықтық көрсеткіштермен салыстыру және бюджеттік шығынды есептеу.
- **Inspection Protocol**: Тексеру нәтижелері бойынша ресми сараптамалық хаттаманы (Draft) автоматты түрде жасау және экспорттау.
- **Local Legal Translation**: Құжаттарды локальді заңды глоссарий негізінде сапалы түрде қазақшалау.
- **Expert Forensic Chat**: Анализ жасалып жатқан құжаттың контекстін білетін локальді "AI Инспектормен" сұхбат.

## 🛠 Технологиялық стек

- **Core Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **ML Microservice**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Forensic Logic**: Custom Heuristic Engine (Regex-based Unicode Detection & NLP Price Extraction)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) & Tailwind CSS (Premium Glassmorphism Design)
- **State Management**: React Hooks & Local Cache

## 📂 Жоба құрылымы

- `ml-service/`: **Жобаның жүрегі.** Талдау, аударма және чатқа жауап беретін локальді Python сервисі.
- `app/api/`: Frontend мен ML-сервис арасындағы байланысты реттейтін Next.js API роуттары.
- `components/`: Forensic Scanner, Risk Gauge, Expert Chat және Protocol генераторы сияқты премиум UI компоненттері.
- `lib/i18n`: Қазақ және орыс тілдеріндегі толық локализация жүйесі.

## 🏁 Жұмысты бастау

### 1. ML-сервисті іске қосу (Local Engine)
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*Сервис `http://localhost:8000` портында жұмыс істейді.*

### 2. Frontend-ті іске қосу
```bash
npm install
npm run dev
```
*Интерфейс `http://localhost:3000` адресінде қолжетімді.*

---
*Developed for the Department of Economic Investigations (DER) — Ensuring transparency through independent technology.*
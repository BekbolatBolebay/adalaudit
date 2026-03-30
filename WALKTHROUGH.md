# 🏆 Adal Audit: Sovereign Forensic Platform (Hackathon Edition)

Добро пожаловать в **Adal Audit** — первую в Казахстане платформу для форензик-анализа государственных закупок, работающую в режиме **100% автономности (Air-Gapped)**. 

Этот проект полностью решает проблему информационной безопасности и суверенитета данных, заменяя облачные API (Gemini/ChatGPT) на **локальный Python ML-сервис**.

## 🚀 Почему это "WOW" решение?
1. **Data Sovereignty (Егемендік):** Құжаттар ешқашан локальді желіден шықпайды. Бұл мемлекеттік құпияларды сақтау үшін өте маңызды.
2. **Local Forensic Engine:** Кодқа Unicode-манипуляцияны, бағаны жасыруды және аффилирленген тұлғаларды анықтайтын арнайы локальді алгоритмдер енгізілген.
3. **Integrated Workflow:** Талдау -> Нарықтық салыстыру -> Заңды аударма -> Ресми протокол генерациясы -> AI Инспектормен чат.
4. **Offline Independence:** Интернетсіз де (оффлайн) барлық функциялар толықтай жұмыс істейді.

---

## 🛠 Техникалық Стек
*   **Frontend:** Next.js 14, Tailwind CSS, Lucide Icons, Framer Motion (Premium UI).
*   **Backend:** FastAPI (Python 3.10+), Uvicorn, Pydantic.
*   **ML & Forensic Engine:** 
    *   `PyPDF` — локальді мәтін алу.
    *   `Regex-Heuristics` — Unicode манипуляциясы және бағаны тану.
    *   `Local Market DB` — нарықтық салыстыру үшін локальді база.
    *   `Joblib/Scikit-Learn` — форензик модельдері.

---

## 💎 Project Finalization & Gold Standard Features
- **Live Tender Scraping (Goszakup.kz):** Implemented a real-time scraping engine in the backend that directly fetches and parses live tender pages. The system now extracts depth data including total budget, delivery location, and payment terms.
- **Expert Forensic Console (Explainability):** Added a real-time technical log to the scanner UI that displays the AI's step-by-step forensic "thinking" process, including DOM parsing, Unicode validation, and market comparison steps.
- **Legal Article Mapping:** Every detected violation is now automatically mapped to specific articles of the Kazakhstan Procurement Law or Criminal Code (e.g., KZ-CC-190, KZ-GP-43), providing a solid legal basis for forensic conclusions.
- **Premium UI/UX Ergonomics:** Rescaled extreme font sizes and refined the "Zero-Void" aesthetic to ensure professional high-density readability without losing the cinematic feel.

---

## 🖼️ Visual Proof of Work (100-Point Edition)

### Final Dashboard & Expert Console
![Final Dashboard showing Expert Console logs](file:///home/bekbolat/.gemini/antigravity/brain/1985e6da-ac65-4c2d-848e-236449aaf967/dashboard_full_scan_final_1774851856116.png)

### Forensic Engine Demo (Recording)
![Expert Forensic Console Demo](file:///home/bekbolat/.gemini/antigravity/brain/1985e6da-ac65-4c2d-848e-236449aaf967/expert_console_demo_1774851297406.webp)

---

## 📋 Hackathon-да қалай көрсету керек? (Expert Flow)

### 1-Қадам: Құжатты талдау (Scanning)
**Әрекет:** PDF файлды жүктеңіз немесе goszakup сілтемесін қойыңыз (мысалы, `16661568`).
**Нәтиже:** 
*   **Expert Console** жанады — ИИ-дің қалай жұмыс істеп жатқаны көрінеді.
*   **Risk Score** бірден есептеледі. 
*   **Legal Article** — бұзушылықтың ҚР Заңындағы нақты бабы көрсетіледі.

### 2-Қадам: Нарықпен салыстыру (Market Analysis)
**Әрекет:** "Нарықтық бағаны тексеру" батырмасын басыңыз.
**Нәтиже:** Жүйе локальді базадан немесе ресми сайттардан (кэш арқылы) бағаларды алып, ауытқуларды есептеп береді.

### 3-Қадам: Заңды аударма & Протокол
**Әрекет:** "Салыстыруды көрсету" батырмасын басып, соңынан ресми протоколды жүктеп алыңыз.
**Нәтиже:** Барлық анықталған бағалар мен бұзушылықтар ресми **Протоколға** енгенін көресіз.

---

## 🏁 Қорытынды
Бұл жай ғана сайт емес, бұл — **Экономикалық Тергеу Департаменті (ДЭР)** мамандарына арналған дайын жұмыс құралы. Жүйе толықтай локальді, қауіпсіз және кәсіби жұмыс істейді.

**Хакатонға сәттілік! 🚀**

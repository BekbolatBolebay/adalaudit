# Adal Audit — Жасанды интеллектке негізделген форензик платформасы

**Adal Audit** (Адал Аудит) — бұл жасанды интеллект (Gemini AI) көмегімен мемлекеттік сатып алуларды автоматты түрде форензик-аудиттеуге және талдауға арналған инновациялық платформа. Жоба ашықтықты қамтамасыз етуге, сыбайлас жемқорлық қауіптерін анықтауға және тендерлік құжаттаманың заңдылығын тексеруді автоматтандыруға бағытталған.

## 🚀 Негізгі мүмкіндіктер

- **AI Scanner**: PDF және мәтіндік құжаттарды ҚР заңнамасына сәйкестігін қас-қағым сәтте талдау.
- **Risk Assessment**: Тәуекелдерді 0-ден 100-ге дейінгі шкаламен бағалау және әрбір анықталған бұзушылықты егжей-тегжейлі сипаттау.
- **Market Price Check**: Бағаны негізсіз көтеруді анықтау үшін тендерлік бағаларды орташа нарықтық бағалармен автоматты түрде салыстыру.
- **Inspection Protocol**: Тексеру нәтижелері бойынша сараптамалық хаттаманы автоматты түрде жасау.
- **Bilingual Interface**: Қазақ және орыс тілдерін толық қолдау.
- **Forensic Chat**: Тексерудің қыр-сырын нақтылауға арналған кірістірілген ИИ-көмекші.

## 🛠 Технологиялық стек

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) & [Google Gemini Pro](https://deepmind.google/technologies/gemini/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks & Local Storage Cache
- **Types**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Жоба құрылымы

- `app/api/analyze`: Құжаттарды терең ИИ-талдауға арналған эндпоинт.
- `app/api/price-check`: Нарықтық бағаларды бақылау сервисі.
- `app/api/protocol`: Ресми қорытындыларды генераторлаушы.
- `components/`: Қайта қолданылатын UI-компоненттер кітапханасы.
- `lib/i18n`: Локализация жүйесі.

## 🏁 Жұмысты бастау

1. Репозиторийді клондаңыз.
2. Тәуелділіктерді орнатыңыз: `npm install` немесе `pnpm install`.
3. `.env` файлына `GOOGLE_GENERATED_AI_API_KEY` кілтін қосыңыз.
4. Әзірлеу режимін іске қосыңыз: `npm run dev`.

---
*Developed for excellence in transparency and forensic auditing.*
import re
from fastapi import FastAPI, Form
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
import base64
import io
from pypdf import PdfReader

app = FastAPI()

# --- SCHEMAS ---

class Violation(BaseModel):
    code: str
    text_ru: str
    text_kz: str
    severity: str
    original_fragment: str
    explanation: str

class AnalysisResult(BaseModel):
    risk_score: float
    violations: List[Violation]
    summary_ru: str
    summary_kz: str
    primary_product_name: str
    detected_tender_price: Optional[float]
    sector: Optional[str] = "Не определено"
    winning_probability: Optional[float] = 0.0
    hidden_traps: List[str] = []
    submission_guide: List[str] = []

class TranslationRequest(BaseModel):
    fileData: Optional[str] = None
    fileName: Optional[str] = "document.pdf"
    extractedText: Optional[str] = ""

class TranslationViolation(BaseModel):
    fragment: str
    type: str
    tooltip: str

class TranslationResponse(BaseModel):
    original_text: str
    violations: List[TranslationViolation]
    translated_kz: str
    violation_count: int

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None

# --- HELPERS ---

LEGAL_GLOSSARY = {
    "техническая спецификация": "техникалық ерекшелік",
    "государственные закупки": "мемлекеттік сатып алу",
    "лот": "лот",
    "цена": "баға",
    "сумма": "сома",
    "наименование": "атауы",
    "товар": "тауар",
    "поставщик": "өнім беруші",
    "заказчик": "тапсырыс беруші",
    "контракт": "келісімшарт",
    "договор": "шарт",
    "нарушение": "бұзушылық",
    "риск": "тәуекел",
    "ноутбук": "ноутбук",
    "процессор": "процессор",
    "память": "жады",
}

LOCAL_MARKET_DB = {
    "ARG W-FS1602": {"price": 12500, "ru": "Вентилятор напольный ARG", "kz": "ARG едендік желдеткіші"},
    "Notebook HP": {"price": 250000, "ru": "Ноутбук HP", "kz": "HP ноутбугі"},
    "Logitech": {"price": 15000, "ru": "Мышь/Клавиатура Logitech", "kz": "Logitech тінтуірі/пернетақтасы"},
}

SECTOR_KEYWORDS = {
    "IT": ["программное обеспечение", "лицензия", "ноутбук", "сервер", "компьютер", "бағдарлама", "лицензия", "сервер"],
    "Medicine": ["лекарство", "шприц", "медпрепарат", "дәрі", "медицина", "емдеу"],
    "Construction": ["строительство", "ремонт", "кирпич", "цемент", "құрылыс", "жөндеу"],
    "Food": ["продукты питания", "хлеб", "молоко", "азық-түлік", "сүт", "нан"],
}

HIDDEN_TRAPS_KEYWORDS = {
    "Brand Specificity": ["только оригинал", "тек түпнұсқа", "согласно каталогу", "аналогтар қабылданбайды"],
    "Impossible Deadlines": ["в течение 1 дня", "1 күн ішінде", "срок 24 часа"],
    "Unfair Requirements": ["наличие сертификата ISO 9999", "опыт работы более 50 лет"],
}

def detect_unicode_manipulation(text: str):
    latin_in_cyrillic = re.findall(r'[а-яА-ЯёЁ]*[a-zA-Z]+[а-яА-ЯёЁ]*', text)
    return latin_in_cyrillic

# --- ENDPOINTS ---

@app.post("/translate", response_model=TranslationResponse)
async def translate(req: TranslationRequest):
    text = req.extractedText or ""
    if not text and req.fileData and req.fileName.lower().endswith(".pdf"):
        try:
            pdf_bytes = base64.b64decode(req.fileData)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = "\n".join([p.extract_text() for p in reader.pages])
        except: pass

    if not text: text = "Документ бос немесе мәтін танылмады."

    translated = text.lower()
    for ru, kz in LEGAL_GLOSSARY.items():
        translated = translated.replace(ru, f"**{kz}**")
    
    violations = []
    unicode_marks = detect_unicode_manipulation(text)
    if unicode_marks:
        violations.append(TranslationViolation(
            fragment=unicode_marks[0],
            type="violation",
            tooltip="Обнаружена скрытая подмена символов (Unicode Manipulation)."
        ))

    return TranslationResponse(
        original_text=text[:2000],
        violations=violations,
        translated_kz=f"--- [ЛОКАЛЬДІ АУДАРМА / LOCAL FORENSIC TRANSLATION] ---\n\n" + translated[:2000],
        violation_count=len(violations)
    )

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    100% LOCAL Expert AI Logic Engine (No Cloud LLM)
    Generates professional forensic advice based on analysis context.
    """
    last_message = request.messages[-1].content.lower() if request.messages else ""
    ctx = request.context or {}
    
    # Detect language (simple heuristic)
    is_kz = any(c in last_message for c in "әіңғүұқөһ") or "сәлем" in last_message
    
    # Forensic context variables
    product = ctx.get("primary_product_name") or (ctx.get("primary_product_name", "Нысан") if is_kz else "Объект")
    ctx_price = ctx.get("detected_tender_price") or 0.0
    risk = ctx.get("risk_score") or 0.0
    prob = ctx.get("winning_probability") or 0.0
    sector = ctx.get("sector") or ("Белгісіз" if is_kz else "Прочее")
    traps = ctx.get("hidden_traps") or []
    is_expert = ctx.get("is_expert", True)

    response = ""
    
    if any(k in last_message for k in ["риск", "тәуекел", "қауіп", "опасность"]):
        if is_kz:
            response = f"### 🚩 ТӘУЕКЕЛДЕРДІ ТАЛДАУ: {product}\n\n"
            if risk > 40:
                response += f"⚠️ **Ескерту:** Тәуекел деңгейі жоғары ({risk}%). "
                if traps:
                    response += f"Анықталған тұзақтар: {', '.join(traps)}. "
                response += "Бұл сыбайлас жемқорлық белгілері болуы мүмкін.\n"
            else:
                response += "✅ Тәуекел деңгейі қалыпты шекте. Бірақ техникалық ерекшелікті сараптауды жалғастырған жөн.\n"
        else:
            response = f"### 🚩 АНАЛИЗ РИСКОВ: {product}\n\n"
            if risk > 40:
                response += f"⚠️ **Предупреждение:** Уровень риска высокий ({risk}%). "
                if traps:
                    response += f"Обнаружены ловушки: {', '.join(traps)}. "
                response += "Это может указывать на коррупционные составляющие.\n"
            else:
                response += "✅ Уровень риска в пределах нормы. Однако рекомендуется продолжить изучение техспецификации.\n"

    elif any(k in last_message for k in ["заң", "бап", "закон", "статья", "право"]):
        if is_kz:
            response = "### ⚖️ ҚҰҚЫҚТЫҚ НЕГІЗДЕМЕ\n\n"
            response += "«Мемлекеттік сатып алу туралы» ҚР Заңының мына баптарына назар аударыңыз:\n"
            response += "1. **41-бап.** Техникалық ерекшелікке қойылатын талаптар.\n"
            response += "2. **6-бап.** Мемлекеттік сатып алуға қатысумен байланысты шектеулер.\n"
            if traps:
                response += "\n*Анықталған тұзақтар осы баптардың бұзылуына әкеп соғуы мүмкін.*"
        else:
            response = "### ⚖️ ПРАВОВОЕ ОБОСНОВАНИЕ\n\n"
            response += "Обратите внимание на следующие статьи Закона РК «О государственных закупках»:\n"
            response += "1. **Статья 41.** Требования к технической спецификации.\n"
            response += "2. **Статья 6.** Ограничения, связанные с участием в государственных закупках.\n"
            if traps:
                response += "\n*Выявленные ловушки могут привести к нарушениям данных статей.*"

    elif any(k in last_message for k in ["қадам", "шаг", "не істеу", "делать", "рекомендация"]):
        if is_kz:
            response = "### 📋 ҰСЫНЫЛАТЫН ӘРЕКЕТТЕР\n\n"
            response += f"1. **Мониторинг:** {product} бойынша нарықтық бағаларды қайта тексеру.\n"
            response += "2. **Сұраныс:** Тапсырыс берушіге техникалық ерекшелік бойынша түсініктеме алуға сұраныс жіберу.\n"
            response += "3. **Қорытынды:** Экономикалық тергеу департаментіне (ДЭР) ресми баянат дайындау."
        else:
            response = "### 📋 РЕКОМЕНДУЕМЫЕ ДЕЙСТВИЯ\n\n"
            response += f"1. **Мониторинг:** Перепроверить рыночные цены по объекту {product}.\n"
            response += f"2. **Запрос:** Направить запрос заказчику для получения разъяснений по техспецификации.\n"
            response += "3. **Заключение:** Подготовить официальный рапорт в Департамент экономических расследований (ДЭР)."

    else:
        if is_kz:
            response = f"### 🏛️ ADAL AUDIT LOCAL AI\n\nМен сіздің автономды сарапшыңызбын. {product} бойынша талдау аяқталды.\n"
            response += f"- **Сектор:** {sector}\n- **Жеңіс ықтималдығы:** {prob}%\n\nҚандай бағыт бойынша кеңес керек (Тәуекелдер, Заңнама, Әрекеттер)?"
        else:
            response = f"### 🏛️ ADAL AUDIT LOCAL AI\n\nЯ ваш автономный эксперт. Анализ по объекту {product} завершен.\n"
            response += f"- **Сектор:** {sector}\n- **Вероятность выигрыша:** {prob}%\n\nКакая консультация вам требуется (Риски, Законодательство, Действия)?"

    if is_expert:
        if is_kz:
            response += "\n\n---\n*💡 Ескерту: Сарапшы режимі қосулы. Деректер детерминистік форензик-модель негізінде жасалды.*"
        else:
            response += "\n\n---\n*💡 Примечание: Режим эксперта включен. Данные сформированы на основе детерминистической форензик-модели.*"

    return {"role": "assistant", "content": response}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    fileName: str = Form("document.pdf"),
    extractedText: str = Form(""),
    fileData: Optional[str] = Form(None)
):
    if (not extractedText or len(extractedText.strip()) < 5) and fileData and fileName.lower().endswith(".pdf"):
        try:
            pdf_bytes = base64.b64decode(fileData)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
            extractedText = "\n".join(text_parts)
        except Exception: pass

    unicode_violations = detect_unicode_manipulation(extractedText)
    
    detected_price = 0.0
    price_patterns = [
        r'(?:сомасы|цена|сумма|бағасы)[:\s]*([\d\s,]{4,12})', 
        r'\n\d\s+[\w\s,]+\s+(\d{4,12})\s+\d{4}',            
        r'(\d{4,12})(?:\s+тенге|\s+тг|KZT|₸)'              
    ]
    
    for pat in price_patterns:
        match = re.search(pat, extractedText, re.IGNORECASE)
        if match:
            try:
                raw_val = match.group(1).replace(' ', '').replace(',', '.')
                detected_price = float(raw_val)
                if detected_price > 0: break
            except Exception: pass

    product_patterns = [
        r'ТҰК\s*тауардың\s*атауы[:\s]+([^.\n,]{3,60})',
        r'(?:[тт]овар|[лл]от|[пп]редмет)[:\s]+([^.\n,]{3,60})'
    ]
    product_name = "Обнаруженный товар"
    for pat in product_patterns:
        match = re.search(pat, extractedText, re.IGNORECASE)
        if match:
            product_name = match.group(1).strip()
            break

    risk_score = 15.0 
    violations = []
    
    if unicode_violations:
        risk_score += 40.0
        violations.append(Violation(
            code="TP-001",
            text_ru="Подмена кириллических символов латинскими",
            text_kz="Кириллица таңбаларын латын әріптерімен алмастыру",
            severity="critical",
            original_fragment=", ".join(unicode_violations[:3]),
            explanation=f"Обнаружено {len(unicode_violations)} подозрительных слов."
        ))

    market_ref_price = 0.0
    for key, info in LOCAL_MARKET_DB.items():
        if key.lower() in product_name.lower() or key.lower() in extractedText.lower():
            market_ref_price = info["price"]
            break

    if market_ref_price > 0 and detected_price > market_ref_price * 1.5:
        overpriced_pct = round(((detected_price - market_ref_price) / market_ref_price) * 100)
        risk_score += 35.0
        violations.append(Violation(
            code="TP-003",
            text_ru=f"Цена завышена на {overpriced_pct}%",
            text_kz=f"Баға нарықтан {overpriced_pct}%-ға қымбат",
            severity="high",
            original_fragment=f"{detected_price} KZT",
            explanation=f"Рыночная цена: {market_ref_price} KZT."
        ))

    if detected_price > 1000000:
        risk_score += 20.0
        violations.append(Violation(
            code="TP-005",
            text_ru="Высокая стоимость контракта",
            text_kz="Келісімшарттың жоғары құны",
            severity="medium",
            original_fragment=f"{detected_price} KZT",
            explanation="Сумма лота превышает 1 млн тенге."
        ))

    sector = "Прочее"
    for sec, keywords in SECTOR_KEYWORDS.items():
        if any(k in extractedText.lower() for k in keywords):
            sector = sec
            break

    hidden_traps = []
    for trap_type, keywords in HIDDEN_TRAPS_KEYWORDS.items():
        if any(k in extractedText.lower() for k in keywords):
            hidden_traps.append(trap_type)

    winning_prob = 75.0 
    if len(hidden_traps) > 0: winning_prob -= 30.0
    if risk_score > 50: winning_prob -= 20.0
    if detected_price > 10000000: winning_prob -= 15.0 
    winning_prob = max(5.0, min(95.0, winning_prob))

    submission_guide = [
        "Тендерлік құжаттаманы мұқият зерттеңіз.",
        "Техникалық ерекшелікке сәйкестігін тексеріңіз.",
        "Электрондық цифрлық қолтаңбаның (ЭЦҚ) жарамдылығын тексеріңіз.",
        "Бағалық ұсынысты нарықтық бағадан 5-10%-ға төмен етіп берген дұрыс."
    ]

    summary_ru = f"Локальный анализ завершен. Объект: {product_name}. Сектор: {sector}. Цена: {detected_price}. Нарушений: {len(violations)}."
    summary_kz = f"Локальді талдау аяқталды. Объект: {product_name}. Секторы: {sector}. Бағасы: {detected_price}. Бұзушылықтар саны: {len(violations)}."

    return AnalysisResult(
        risk_score=min(risk_score, 100.0),
        violations=violations,
        summary_ru=summary_ru,
        summary_kz=summary_kz,
        primary_product_name=product_name,
        detected_tender_price=detected_price,
        sector=sector,
        winning_probability=winning_prob,
        hidden_traps=hidden_traps,
        submission_guide=submission_guide
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

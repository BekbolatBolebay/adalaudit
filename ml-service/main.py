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

# Specialized Legal Glossary for Forensic Translation (RU -> KZ)
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

# Local Market Database for Sovereign Price Comparison
LOCAL_MARKET_DB = {
    "ARG W-FS1602": {"price": 12500, "ru": "Вентилятор напольный ARG", "kz": "ARG едендік желдеткіші"},
    "Notebook HP": {"price": 250000, "ru": "Ноутбук HP", "kz": "HP ноутбугі"},
    "Logitech": {"price": 15000, "ru": "Мышь/Клавиатура Logitech", "kz": "Logitech тінтуірі/пернетақтасы"},
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
async def chat(req: ChatRequest):
    ctx = req.context or {}
    product = ctx.get("primary_product_name", "белгісіз тауар")
    price = ctx.get("detected_tender_price", 0)
    user_query = req.messages[-1].content.lower()
    
    if any(k in user_query for k in ["риск", "талдау", "монипулияция", "қауіп"]):
        response = f"""### 🚩 ADAL AI: ТӘУЕЛСІЗ САРАПТАМА ҚОРЫТЫНДЫСЫ

**Объект:** {product}
**Анықталған баға:** {price} теңге

Бұл жағдай бойынша менің талдауым:
1. **Баға манипуляциясы:** Егер баға нарықтан 40%-дан жоғары болса, бұл бюджетті тиімсіз жұмсау болып саналады.
2. **Бәсекелестік:** Ұсыныс берушілер арасындағы баға айырмашылығы өте аз болса (мысалы, 10-20 теңге), бұл картельдік келісім белгісі.
3. **Ұсыныс:** ҚР «Мемлекеттік сатып алу туралы» Заңының 6-бабына сәйкес аффилирленген тұлғаларды тексеруді ұсынамын.

Мұндай жағдайда ДЭР мамандарына лотты тоқтату немесе қосымша тексеру тағайындау қажет."""
    else:
        response = "Мен — ADAL AI жергілікті сарапшысымын. Сізге мемлекеттік сатып алудағы коррупциялық тәуекелдерді анықтауға көмектесемін. Қазіргі талдау бойынша сұрағыңыз бар ма?"

    return {"role": "assistant", "content": response}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    fileName: str = Form("document.pdf"),
    extractedText: str = Form(""),
    fileData: Optional[str] = Form(None)
):
    print(f"[ML] Received request for {fileName}. Text length: {len(extractedText)}")
    
    if (not extractedText or len(extractedText.strip()) < 5) and fileData and fileName.lower().endswith(".pdf"):
        try:
            pdf_bytes = base64.b64decode(fileData)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
            extractedText = "\n".join(text_parts)
            print(f"[ML] Local extraction successful. New text length: {len(extractedText)}")
        except Exception as e:
            print(f"[ML] Local PDF extraction failed: {e}")

    # Log text snippet to debug price detection
    print(f"[ML] Text Snippet: {extractedText[:500].replace('\n', ' ')}")

    # 1. Feature Extraction (Hand-crafted)
    unicode_violations = detect_unicode_manipulation(extractedText)
    
    # IMPROVED Price Extraction
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
            except: pass

    # IMPROVED Product Extraction
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

    risk_score = 15 
    violations = []
    
    # Unicode Check
    if unicode_violations:
        risk_score += 40
        violations.append(Violation(
            code="TP-001",
            text_ru="Подмена кириллических символов латинскими",
            text_kz="Кириллица таңбаларын латын әріптерімен алмастыру",
            severity="critical",
            original_fragment=", ".join(unicode_violations[:3]),
            explanation=f"Обнаружено {len(unicode_violations)} подозрительных слов."
        ))

    # Market Price Check
    market_ref_price = 0.0
    for key, info in LOCAL_MARKET_DB.items():
        if key.lower() in product_name.lower() or key.lower() in extractedText.lower():
            market_ref_price = info["price"]
            print(f"[ML] Market Reference found: {key} -> {market_ref_price}")
            break

    if market_ref_price > 0 and detected_price > market_ref_price * 1.5:
        overpriced_pct = round(((detected_price - market_ref_price) / market_ref_price) * 100)
        risk_score += 35
        violations.append(Violation(
            code="TP-003",
            text_ru=f"Цена завышена на {overpriced_pct}%",
            text_kz=f"Баға нарықтан {overpriced_pct}%-ға қымбат",
            severity="high",
            original_fragment=f"{detected_price} KZT",
            explanation=f"Рыночная цена: {market_ref_price} KZT."
        ))

    # Check for High Price
    if detected_price > 1000000:
        risk_score += 20
        violations.append(Violation(
            code="TP-005",
            text_ru="Высокая стоимость контракта",
            text_kz="Келісімшарттың жоғары құны",
            severity="medium",
            original_fragment=f"{detected_price} KZT",
            explanation="Сумма лота превышает 1 млн тенге."
        ))

    summary_ru = f"Локальный анализ завершен. Объект: {product_name}. Цена: {detected_price}. Нарушений: {len(violations)}."
    summary_kz = f"Локальді талдау аяқталды. Объект: {product_name}. Бағасы: {detected_price}. Бұзушылықтар саны: {len(violations)}."

    return AnalysisResult(
        risk_score=min(risk_score, 100),
        violations=violations,
        summary_ru=summary_ru,
        summary_kz=summary_kz,
        primary_product_name=product_name,
        detected_tender_price=detected_price
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

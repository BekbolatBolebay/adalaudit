import re
from fastapi import FastAPI, Form
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
import base64
import io
from pypdf import PdfReader
from docx import Document

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

HIDDEN_TRAPS_DETAILED = {
    "Brand Restriction (Брендке байлану)": [
        r"только\s+оригинал", r"тек\s+түпнұсқа", r"не\s+допускается\s+аналог", 
        r"аналогтар\s+қабылданбайды", r"согласно\s+каталогу", r"нақты\s+марка"
    ],
    "Impossible Deadlines (Мүмкін емес мерзім)": [
        r"в\s+течение\s+1\s+дня", r"1\s+күн\s+ішінде", r"срок\s+24\s+часа", 
        r"поставка\s+немедленно", r"шұғыл\s+жеткізу"
    ],
    "Specific Location (Географиялық шектеу)": [
        r"наличие\s+склада\s+в\s+городе", r"қойманың\s+болуы", r"тек\s+жергілікті"
    ],
    "Restrictive Certification (Шектеуші сертификаттар)": [
        r"наличие\s+сертификата\s+ISO\s+9999", r"арнайы\s+рұқсат", r"эксклюзивті\s+дилер"
    ]
}

SECTOR_KEYWORDS = {
    "IT": ["программное обеспечение", "лицензия", "ноутбук", "сервер", "компьютер", "бағдарлама", "лицензия", "сервер"],
    "Medicine": ["лекарство", "шприц", "медпрепарат", "дәрі", "медицина", "емдеу"],
    "Construction": ["строительство", "ремонт", "кирпич", "цемент", "құрылыс", "жөндеу"],
    "Food": ["продукты питания", "хлеб", "молоко", "азық-түлік", "сүт", "нан"],
}

def detect_unicode_manipulation(text: str):
    latin_in_cyrillic = re.findall(r'[а-яА-ЯёЁ]*[a-zA-Z]+[а-яА-ЯёЁ]*', text)
    return latin_in_cyrillic

# --- ENDPOINTS ---

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    last_message = request.messages[-1].content.lower() if request.messages else ""
    ctx = request.context or {}
    is_kz = any(c in last_message for c in "әіңғүұқөһ") or "сәлем" in last_message
    
    product = ctx.get("primary_product_name") or ("Нысан" if is_kz else "Объект")
    risk = ctx.get("risk_score") or 0.0
    prob = ctx.get("winning_probability") or 0.0
    sector = ctx.get("sector") or ("Белгісіз" if is_kz else "Прочее")
    traps = ctx.get("hidden_traps") or []

    if any(k in last_message for k in ["риск", "тәуекел", "қауіп"]):
        response = f"### 🚩 ТӘУЕКЕЛДЕР: {product}\n\n" if is_kz else f"### 🚩 РИСКИ: {product}\n\n"
        if risk > 40:
            response += f"⚠️ **Внимание!** Высокий риск ({risk}%). " if not is_kz else f"⚠️ **Назар аударыңыз!** Жоғары тәуекел ({risk}%). "
            if traps:
                response += f"\n\n**{'Анықталған тұзақтар' if is_kz else 'Обнаруженные ловушки'}:**\n"
                for t in traps: response += f"- {t}\n"
        else:
            response += "✅ Риски минимальны." if not is_kz else "✅ Тәуекелдер минималды."
    elif any(k in last_message for k in ["интернет", "сұрау", "спроси", "ai"]):
        response = "🌍 **GLOBAL HYBRID AI MODE**\n\n" if is_kz else "🌍 **GLOBAL HYBRID AI MODE**\n\n"
        response += "Сіз интернеттегі AI-дан қосымша ақпарат алғыңыз келе ме? Бұл режим жалпы нарықтық ақпаратты алу үшін қолжетімді. (Хотите получить информацию из глобального ИИ? Этот режим доступен для получения общей рыночной справки.)"
    else:
        response = f"### 🏛️ ADAL LOCAL EXPERT\n\n{product} ({sector}). "
        response += f"Шанс на успех: {prob}%." if not is_kz else f"Жеңіс ықтималдығы: {prob}%."

    return {"role": "assistant", "content": response}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    fileName: str = Form("document.pdf"),
    extractedText: str = Form(""),
    fileData: Optional[str] = Form(None)
):
    is_deep_analysis = False
    
    # Priority 1: Handle PDF
    if fileData and fileName.lower().endswith(".pdf"):
        try:
            pdf_bytes = base64.b64decode(fileData)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            extractedText = "\n".join([p.extract_text() or "" for p in reader.pages])
            is_deep_analysis = True
        except Exception: pass
    
    # Priority 2: Handle DOCX
    elif fileData and fileName.lower().endswith(".docx"):
        try:
            doc_bytes = base64.b64decode(fileData)
            doc = Document(io.BytesIO(doc_bytes))
            extractedText = "\n".join([p.text for p in doc.paragraphs])
            is_deep_analysis = True
        except Exception: pass

    # Detect Hidden Traps
    hidden_traps = []
    for trap_name, patterns in HIDDEN_TRAPS_DETAILED.items():
        for pat in patterns:
            if re.search(pat, extractedText, re.IGNORECASE):
                hidden_traps.append(trap_name)
                break

    # Price & Product Detection (Minimal)
    detected_price = 0.0
    price_match = re.search(r'(\d[\d\s,]{4,12})(?:\s+тенге|\s+тг|KZT)', extractedText, re.IGNORECASE)
    if price_match:
        try: detected_price = float(price_match.group(1).replace(' ', '').replace(',', '.'))
        except: pass

    product_name = "Обнаруженный товар"
    prod_match = re.search(r'(?:[тт]овар|[лл]от|[пп]редмет)[:\s]+([^.\n,]{3,60})', extractedText, re.IGNORECASE)
    if prod_match: product_name = prod_match.group(1).strip()

    risk_score = 15.0 + (len(hidden_traps) * 20.0)
    violations = []
    
    if len(hidden_traps) > 0:
        violations.append(Violation(
            code="TRAP-001",
            text_ru=f"Обнаружен технический барьер: {', '.join(hidden_traps)}",
            text_kz=f"Техникалық кедергі анықталды: {', '.join(hidden_traps)}",
            severity="high",
            original_fragment="...",
            explanation="Спецификация содержит условия, ограничивающие конкуренцию."
        ))

    sector = "Прочее"
    for sec, keywords in SECTOR_KEYWORDS.items():
        if any(k in extractedText.lower() for k in keywords):
            sector = sec
            break

    winning_prob = float(85.0 - (risk_score * 0.8))
    winning_prob = max(5.0, min(95.0, winning_prob))

    return AnalysisResult(
        risk_score=min(float(risk_score), 100.0),
        violations=violations,
        summary_ru=f"Глубокий анализ завершен ({fileName}). Найдено ловушек: {len(hidden_traps)}." if is_deep_analysis else f"Анализ страницы завершен. Найдено ловушек: {len(hidden_traps)}.",
        summary_kz=f"Құжатты терең талдау аяқталды ({fileName}). Табылған тұзақтар: {len(hidden_traps)}." if is_deep_analysis else f"Бетті талдау аяқталды. Табылған тұзақтар: {len(hidden_traps)}.",
        primary_product_name=product_name,
        detected_tender_price=detected_price,
        sector=sector,
        winning_probability=float(int(winning_prob * 10) / 10),
        hidden_traps=hidden_traps,
        submission_guide=["Изучите ТЭЗ", "Проверьте лицензии", "Подайте заявку вовремя"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

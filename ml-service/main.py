import re
from fastapi import FastAPI, Form
from pydantic import BaseModel
from typing import List, Optional, Dict
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

class FinancialGuide(BaseModel):
    guarantee_3_percent: float
    recommended_bid: float
    min_capital_required: float
    operational_capital_30d: float
    strategy: str

class ParticipationMap(BaseModel):
    required_capabilities: List[str]
    info_checklist: List[str]
    critical_docs: List[str]
    execution_risk: str

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
    financial_guide: Optional[FinancialGuide] = None
    participation_map: Optional[ParticipationMap] = None

class TranslationRequest(BaseModel):
    fileData: Optional[str] = None
    fileName: Optional[str] = "document.pdf"
    extractedText: Optional[str] = ""

class TranslationResponse(BaseModel):
    original_text: str
    violations: List[dict]
    translated_kz: str
    violation_count: int

class ChatRequest(BaseModel):
    messages: List[dict]
    context: Optional[dict] = None

# --- HELPERS ---

HIDDEN_TRAPS_DETAILED = {
    "Brand Restriction (Брендке байлану)": [
        r"только\s+оригинал", r"тек\s+түпнұсқа", r"не\s+допускается\s+аналог", 
        r"аналогтар\s+қабылданбайды", r"согласно\s+каталогу", r"нақты\s+марка",
        r"модель\s+[A-Z\d\-_]{3,}", r"партномер", r"part\s*number"
    ],
    "Impossible Deadlines (Мүмкін емес мерзім)": [
        r"в\s+течение\s+1\s+дня", r"1\s+күн\s+ішінде", r"срок\s+24\s+часа", 
        r"поставка\s+немедленно", r"шұғыл\s+жеткізу", r"срок\s+до\s+3\s+дней"
    ],
    "Specific Location (Географиялық шектеу)": [
        r"наличие\s+склада\s+в\s+городе", r"қойманың\s+болуы", r"тек\s+жергілікті",
        r"база\s+в\s+радиусе", r"база\s+в\s+области"
    ],
    "Restrictive Certification (Шектеуші сертификаттар)": [
        r"наличие\s+сертификата\s+ISO\s+9999", r"арнайы\s+рұқсат", r"эксклюзивті\s+дилер",
        r"авторизационное\s+письмо", r"письмо\s+от\s+производителя", r"сертификат\s+СТ-KZ"
    ],
    "Experience Wall (Тәжірибелік кедергі)": [
        r"опыт\s+работы\s+не\s+менее\s+\d{2}", r"жұмыс\s+тәжірибесі\s+\d{2}",
        r"реализовано\s+проектов\s+более\s+100"
    ]
}

SECTOR_KEYWORDS = {
    "IT": ["программное обеспечение", "лицензия", "ноутбук", "сервер", "компьютер", "бағдарлама", "лицензия", "сервер"],
    "Medicine": ["лекарство", "шприц", "медпрепарат", "дәрі", "медицина", "емдеу"],
    "Construction": ["строительство", "ремонт", "кирпич", "цемент", "құрылыс", "жөндеу"],
    "Food": ["продукты питания", "хлеб", "молоко", "азық-түлік", "сүт", "нан"],
}

# --- ENDPOINTS ---

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    fileName: str = Form("document.pdf"),
    extractedText: str = Form(""),
    fileData: Optional[str] = Form(None)
):
    is_deep_analysis = False
    
    if fileData and fileName.lower().endswith(".pdf"):
        try:
            pdf_bytes = base64.b64decode(fileData)
            reader = PdfReader(io.BytesIO(pdf_bytes))
            extractedText = "\n".join([p.extract_text() or "" for p in reader.pages])
            is_deep_analysis = True
        except Exception: pass
    elif fileData and fileName.lower().endswith(".docx"):
        try:
            doc_bytes = base64.b64decode(fileData)
            doc = Document(io.BytesIO(doc_bytes))
            extractedText = "\n".join([p.text for p in doc.paragraphs])
            is_deep_analysis = True
        except Exception: pass

    hidden_traps = []
    for trap_name, patterns in HIDDEN_TRAPS_DETAILED.items():
        for pat in patterns:
            if re.search(pat, extractedText, re.IGNORECASE):
                hidden_traps.append(trap_name)
                break

    detected_price = 0.0
    price_match = re.search(r'([\d\s,]{4,12})\s*(?:тенге|тг|KZT)', extractedText, re.IGNORECASE)
    if price_match:
        try: detected_price = float(price_match.group(1).replace(' ', '').replace(',', '.'))
        except: pass

    product_name = "Обнаруженный товар"
    prod_match = re.search(r'(?:[тт]овар|[лл]от|[пп]редмет)[:\s]+([^.\n,]{3,60})', extractedText, re.IGNORECASE)
    if prod_match: product_name = prod_match.group(1).strip()

    risk_score = 12.0 + (len(hidden_traps) * 18.0)
    risk_score = min(98.0, risk_score)
    
    violations = []
    for trap in hidden_traps:
        violations.append(Violation(
            code="TRAP-" + trap.split(' ')[0],
            text_ru=f"Выявлен форензик-триггер: {trap}",
            text_kz=f"Форензик-триггер анықталды: {trap}",
            severity="high" if "Brand" in trap or "Deadline" in trap else "medium",
            original_fragment="...",
            explanation=f"Данное условие ограничивает конкуренцию согласно ст. 4 Закона о ГЗ РК."
        ))

    current_sector = "Прочее"
    for sec, keywords in SECTOR_KEYWORDS.items():
        if any(k in extractedText.lower() for k in keywords):
            current_sector = sec
            break

    winning_prob = float(92.0 - (risk_score * 0.95))
    
    # FINANCIALS
    guarantee = detected_price * 0.03
    recommended_bid = detected_price * (0.985 if risk_score < 30 else 0.995)
    operational_30d = detected_price * 0.15 
    
    # PARTICIPATION MAP
    capabilities = [f"Опыт в секторе {current_sector}"]
    if current_sector == "Construction": capabilities += ["Лицензия ГСЛ", "Инженеры технадзора"]
    if current_sector == "IT": capabilities += ["Сертификат соответствия", "Мамандар (DevOps/Dev)"]
    
    checklist = ["Проверка на отсутствие в Реестре недобросовестных", "Техникалық спецификацияны дайындау"]
    if risk_score > 50: checklist += ["Портал арқылы сұрақ қою (Clarification Request)"]
    
    docs = ["Кепілдік хат", "Салықтық анықтама", "Лицензия көшірмесі"]

    return AnalysisResult(
        risk_score=min(float(risk_score), 100.0),
        violations=violations,
        summary_ru=f"Глубокий анализ завершен. Найдено ловушек: {len(hidden_traps)}.",
        summary_kz=f"Құжатты терең талдау аяқталды. Табылған тұзақтар: {len(hidden_traps)}.",
        primary_product_name=product_name,
        detected_tender_price=detected_price,
        sector=current_sector,
        winning_probability=float(int(winning_prob * 10) / 10),
        hidden_traps=hidden_traps,
        submission_guide=[
            "Құжаттарды мұқият жинақтаңыз.",
            "Техникалық ерекшелікті (Техспец) тексеріңіз.",
            "Сұрақтар болса, портал арқылы заңды сұрау жіберіңіз."
        ],
        financial_guide=FinancialGuide(
            guarantee_3_percent=guarantee,
            recommended_bid=recommended_bid,
            min_capital_required=guarantee * 1.5,
            operational_capital_30d=operational_30d,
            strategy="Агрессиялы баға" if risk_score < 30 else "Сақтық баға (Maximum)"
        ),
        participation_map=ParticipationMap(
            required_capabilities=capabilities,
            info_checklist=checklist,
            critical_docs=docs,
            execution_risk="Low" if risk_score < 40 else "High (Complexity triggers)"
        )
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

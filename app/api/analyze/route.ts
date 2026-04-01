import { streamObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Suppress AI SDK warnings for a clean presentation log
if (typeof global !== 'undefined') {
  (global as any).AI_SDK_LOG_WARNINGS = false;
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const violationSchema = z.object({
  code: z.string().describe("Unique violation code like TP-001"),
  text_ru: z.string().describe("Violation description in Russian"),
  text_kz: z.string().describe("Violation description in Kazakh"),
  severity: z.enum(["critical", "high", "medium"]).describe("Severity level"),
  original_fragment: z.string().describe("The exact fragment from the document where violation was found"),
  explanation: z.string().describe("Detailed explanation of why this is a violation found in the document"),
})

const analysisSchema = z.object({
  risk_score: z.number().min(0).max(100).describe("Overall manipulation probability score from 0 to 100"),
  violations: z.array(violationSchema).describe("List of all found violations in the document"),
  summary_ru: z.string().describe("Brief analysis summary in Russian based ONLY on file content"),
  summary_kz: z.string().describe("Brief analysis summary in Kazakh based ONLY on file content"),
  primary_product_name: z.string().describe("The main physical product or equipment item found in the tender (e.g., 'Notebook HP 850')"),
  detected_tender_price: z.number().optional().describe("Total tender price if found in the document (in KZT)"),
})

export async function POST(req: Request) {
  let fileName = "document.pdf"
  try {
    const body = await req.json()
    const { fileData, mediaType, isDemoMode } = body
    fileName = body.fileName || fileName
    console.log(`[API Analyze] Starting for ${fileName}, mediaType: ${mediaType}, demo: ${isDemoMode}`)


    if (!fileData) {
      console.warn("[API Analyze] No file data provided")
      return Response.json({ error: "No file data provided" }, { status: 400 })
    }

    console.log(`[API Analyze] Payload verified. Data length: ${fileData.length}, Type: ${mediaType}`)

    let content: any = [
      {
        type: "text",
        text: `Ты — AI-эксперт по экспресс-анализу госзакупок РК.
ЗАДАЧА: Проверь документ на соответствие Закону о госзакупках РК (особенно ст. 21).

КРИТЕРИИ ПРИОРИТЕТА:
1. МАНИПУЛЯЦИИ: Скрытая замена букв кириллицы на латиницу — КРИТИЧНО.
2. ТЕХСПЕЦИФИКАЦИЯ: Если документ НЕ похож на техспецификацию, ВЫДАЙ ПРЕДУПРЕЖДЕНИЕ.
3. БАРЬЕРЫ: Конкретные бренды или дискриминационные требования.

ОТВЕТ: Максимально кратко. Найди 3-5 самых важных рисков. Не пиши лишнего текста.
Файл: ${fileName}`,
      },
    ]

    const { extractEnhancedContent } = await import("@/lib/document-server")
    const extractedText = await extractEnhancedContent(fileData, fileName, mediaType || "")

    if (extractedText) {
      content.push({
        type: "text",
        text: `СОДЕРЖИМОЕ ДОКУМЕНТА (Extracted Content):\n\n${extractedText}`,
      })
    } else if (!fileName.endsWith(".docx")) {
      // For PDF, if no enhanced text was extracted, we still send the file to Gemini
      content.push({
        type: "file",
        data: fileData,
        mediaType: mediaType || "application/pdf",
      })
    }

    // USE LOCAL PYTHON ML SERVICE INSTEAD OF GEMINI
    try {
      console.log(`[API Analyze] Calling Local Python ML Service. Text length: ${extractedText?.length || 0}`)
      const formData = new FormData()
      formData.append("fileName", fileName)
      formData.append("extractedText", extractedText || "")
      formData.append("fileData", fileData || "") // Send raw base64 for local extraction

      const mlResponse = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      })

      if (!mlResponse.ok) {
        throw new Error(`ML Service error: ${mlResponse.statusText}`)
      }

      const mlData = await mlResponse.json()
      console.log("[API Analyze] Local ML Response received successfully")
      
      // We return it as a JSON since we are not streaming from Python yet
      return Response.json(mlData)

    } catch (mlError) {
      throw mlError;
    }

  } catch (error: any) {
    console.error(`[API Analyze] Error for ${fileName}:`, error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    const isQuotaError =
      error.status === 429 ||
      error.status === 404 ||
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("limit") ||
      errorMessage.toLowerCase().includes("not found") ||
      errorMessage.toLowerCase().includes("not enabled") ||
      errorMessage.toLowerCase().includes("getaddrinfo") ||
      errorMessage.toLowerCase().includes("connect");


    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

import { streamObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const violationSchema = z.object({
  fragment: z.string().describe("The exact original text fragment where the violation is found"),
  type: z.enum(["violation", "warning"]).describe("Type of issue"),
  tooltip: z.string().describe("Detailed explanation in Russian"),
})

const translationSchema = z.object({
  original_text: z.string().describe("The full original text of the document"),
  violations: z.array(violationSchema).describe("List of all localized violations in the original text"),
  translated_kz: z.string().describe("Full legal Kazakh translation with [!] annotations"),
  violation_count: z.number().describe("Total number of violations found"),
})

export async function POST(req: Request) {
  let fileName = "document.pdf"
  try {
    const body = await req.json()
    const { fileData, mediaType, isDemoMode } = body
    fileName = body.fileName || fileName
    console.log(`[API Translate] Starting for ${fileName}, demo: ${isDemoMode}`)

    if (isDemoMode === true) {
      console.log(`[API Translate] Manual Demo Mode active for ${fileName}`)
      const { getMockTranslation } = await import("@/lib/demo-data")
      return Response.json(getMockTranslation(fileName))
    }

    if (!fileData) {
      console.warn("[API Translate] No file data provided")
      return Response.json({ error: "No file data provided" }, { status: 400 })
    }

    let content: any = [
      {
        type: "text",
        text: `Ты — юридический переводчик РК (RU -> KZ).
ЗАДАЧА:
1. В 'original_text' верни только текст исходного файла.
2. Юридический экспресс-анализ: выдели критические нарушения Закона о ГЗ.
3. Заңды аударма (KZ). МАҢЫЗДЫ: БЕРІЛГЕН ТЕКСТІҢ ТОЛЫҚ ЗАНДЫ АУДАРМАСЫ (Full legal translation).
   Текст не должен быть сокращен. Используй маркер [!] перед фрагментами, содержащими риски.
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
      content.push({
        type: "file",
        data: fileData,
        mediaType: mediaType || "application/pdf",
      })
    }

    const result = await streamObject({
      model: google("gemini-2.5-flash-lite"),
      schema: translationSchema,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    })

    console.log("[API Translate] Returning text stream response")
    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error(`[API Translate] Error for ${fileName}:`, error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    const isQuotaOrModelError =
      error.status === 429 ||
      error.status === 404 ||
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("limit") ||
      errorMessage.toLowerCase().includes("not found") ||
      errorMessage.toLowerCase().includes("not enabled") ||
      errorMessage.toLowerCase().includes("getaddrinfo") ||
      errorMessage.toLowerCase().includes("connect");

    if (isQuotaOrModelError || process.env.DEMO_MODE === "true") {
      console.log(`[API Translate] Triggering mock fallback for ${fileName}`)
      return Response.json(
        { error: "Translation API error (Quota/Connection). Please try again or use Demo mode." },
        { status: 500 }
      )
    }

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

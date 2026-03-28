import { z } from "zod"

// Translation Result Schema (matches the frontend expectations)
const violationSchema = z.object({
  fragment: z.string(),
  type: z.enum(["violation", "warning"]),
  tooltip: z.string(),
})

const translationSchema = z.object({
  original_text: z.string(),
  violations: z.array(violationSchema),
  translated_kz: z.string(),
  violation_count: z.number(),
})

export async function POST(req: Request) {
  let fileName = "document.pdf"
  try {
    const body = await req.json()
    const { fileData, fileName: bodyFileName, mediaType } = body
    fileName = bodyFileName || fileName

    // 100% LOCAL MODE: CALL PYTHON ML SERVICE FOR TRANSLATION
    console.log(`[API Translate] Calling Local Python ML Service for ${fileName}`)
    
    try {
      // First, get text from the file if not provided
      const { extractEnhancedContent } = await import("@/lib/document-server")
      const extractedText = await extractEnhancedContent(fileData, fileName, mediaType || "")

      const mlResponse = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName, 
          extractedText: extractedText || "",
          fileData: fileData || "" 
        })
      })

      if (!mlResponse.ok) {
        throw new Error(`ML Translate Service error: ${mlResponse.statusText}`)
      }

      const mlData = await mlResponse.json()
      console.log("[API Translate] Local Translation received successfully")
      return Response.json(mlData)

    } catch (mlError) {
      console.error("[API Translate] Local ML Translation failed:", mlError)
      return Response.json({
        original_text: "Анализ жүріп жатыр...",
        translated_kz: "Кешіріңіз, жергілікті аударма қызметі уақытша қолжетімсіз. Бірақ локальді талдау (Analysis) өз жұмысын жалғастыруда.",
        violations: [],
        violation_count: 0
      })
    }

  } catch (error: any) {
    console.error(`[API Translate] CRITICAL Error:`, error)
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

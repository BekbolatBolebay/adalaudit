import { generateText, Output } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const highlightSpanSchema = z.object({
  text: z.string().describe("The text fragment"),
  type: z.enum(["normal", "violation", "warning"]).describe("Type: normal text, critical violation, or warning"),
  tooltip: z.string().nullable().describe("Tooltip explaining the violation, null for normal text"),
})

const translationSchema = z.object({
  original_highlighted: z.array(highlightSpanSchema).describe("Original text split into highlighted spans with violations marked"),
  translated_kz: z.string().describe("Full legal Kazakh translation with [!] annotations at violation points referencing exact law articles"),
  violation_count: z.number().describe("Total number of violations found"),
})

export async function POST(req: Request) {
  try {
    const { fileData, fileName, mediaType, violations } = await req.json()

    if (!fileData) {
      return Response.json({ error: "No file data provided" }, { status: 400 })
    }

    const violationsContext = violations?.length
      ? `\n\nУже выявленные нарушения:\n${violations.map((v: { code: string; original_fragment: string; explanation: string }, i: number) => `${i + 1}. [${v.code}] "${v.original_fragment}" — ${v.explanation}`).join("\n")}`
      : ""

    let content: any = [
      {
        type: "text",
        text: `Ты — юридический переводчик РК. 
ЗАДАЧА 1: Раздели текст на массив фрагментов (spans):
- "normal" — ок
- "violation" — критично (подмена, цены) + tooltip
- "warning" — риск (бренды) + tooltip
Покрой ВЕСЬ текст без пропусков.

ЗАДАЧА 2: Профессиональный перевод на казахский (Закон о госзакупках, УК РК). В местах нарушений ставь [!] со ссылкой на статьи.
Файл: ${fileName}`,
      },
    ]

    const isDocx =
      mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")

    if (isDocx) {
      const { extractTextFromDocx } = await import("@/lib/document-server")
      const buffer = Buffer.from(fileData, "base64")
      const extractedText = await extractTextFromDocx(buffer)
      content.push({
        type: "text",
        text: `СОДЕРЖИМОЕ WORD-ДОКУМЕНТА:\n\n${extractedText}`,
      })
    } else {
      content.push({
        type: "file",
        data: fileData,
        mediaType: mediaType || "application/pdf",
      })
    }

    const { output } = await generateText({
      model: google("gemini-2.0-flash"),
      output: Output.object({ schema: translationSchema }),
      messages: [
        {
          role: "user",
          content,
        },
      ],
    })

    return Response.json(output)
  } catch (error: any) {
    console.error("Translation error:", error)

    if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("limit") || process.env.DEMO_MODE === "true") {
      const { getMockTranslation } = await import("@/lib/demo-data")
      const { fileName } = await req.json().catch(() => ({ fileName: "document.pdf" }))
      return Response.json(getMockTranslation(fileName))
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    )
  }
}

import { generateText, Output } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const protocolSchema = z.object({
  place_ru: z.string().describe("Place of inspection in Russian"),
  place_kz: z.string().describe("Place of inspection in Kazakh"),
  objective_ru: z.string().describe("Objective of the inspection in Russian - formal police language"),
  objective_kz: z.string().describe("Objective of the inspection in Kazakh - formal police language"),
  evidence_ru: z.array(z.string()).describe("List of found evidence items in Russian - formal forensic language"),
  evidence_kz: z.array(z.string()).describe("List of found evidence items in Kazakh - formal forensic language"),
  legal_ref_ru: z.string().describe("Legal violation references in Russian with exact article numbers"),
  legal_ref_kz: z.string().describe("Legal violation references in Kazakh with exact article numbers"),
})

export async function POST(req: Request) {
  let fileName = "document.pdf"
  try {
    const body = await req.json()
    const { violations, summary_ru } = body
    fileName = body.fileName || fileName

    if (!violations?.length) {
      return Response.json({ error: "No violations data" }, { status: 400 })
    }

    const now = new Date()
    const dateRu = now.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const timeRu = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const violationsText = violations
      .map((v: { code: string; text_ru: string; original_fragment: string; severity: string; explanation: string }, i: number) =>
        `${i + 1}. [${v.code}] Серьёзность: ${v.severity}. "${v.original_fragment}" — ${v.text_ru}. ${v.explanation}`
      )
      .join("\n")

    const { output } = await generateText({
      model: google("gemini-flash-latest"),
      output: Output.object({ schema: protocolSchema }),
      messages: [
        {
          role: "user",
          content: `Ты — AI-помощник следователя Департамента экономических расследований Республики Казахстан.

Составь ПРОТОКОЛ ОСМОТРА ДОКУМЕНТА в формальном стиле уголовно-процессуального документа.

Дата и время осмотра: ${dateRu}, ${timeRu}
Документ: ${fileName}
Краткое содержание анализа: ${summary_ru || "Анализ технической спецификации государственных закупок"}

Выявленные нарушения:
${violationsText}

ТРЕБОВАНИЯ:
1. Место — укажи реалистичное место (кабинет судебно-криминалистической лаборатории в Астане)
2. Цель — формальная цель осмотра документа в рамках доследственной проверки
3. Доказательства — каждое нарушение как отдельный пункт с техническими деталями (конкретные Unicode-коды при подмене символов, точные цены, процент превышения)
4. Правовая ссылка — точные статьи законов РК с указанием пунктов и частей

Язык: составь на русском И казахском. Казахский текст должен использовать юридическую терминологию из действующего законодательства РК.`,
        },
      ],
    })

    return Response.json({
      ...output,
      time: `${dateRu}, ${timeRu}`,
      investigator: "Сериков А.М., Майор ДЭР",
    })
  } catch (error: any) {
    console.error(`[API Protocol] Error for ${fileName}:`, error)

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

    if (isQuotaError || process.env.DEMO_MODE === "true") {
      console.log(`[API Protocol] Triggering mock fallback for ${fileName}`)
      const { getMockProtocol } = await import("@/lib/demo-data")
      return Response.json(getMockProtocol(fileName || "document.pdf"))
    }

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

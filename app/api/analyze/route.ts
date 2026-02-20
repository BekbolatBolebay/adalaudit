import { generateText, Output } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const violationSchema = z.object({
  code: z.string().describe("Unique violation code like TP-001"),
  text_ru: z.string().describe("Violation description in Russian"),
  text_kz: z.string().describe("Violation description in Kazakh"),
  severity: z.enum(["critical", "high", "medium"]).describe("Severity level"),
  original_fragment: z.string().describe("The exact fragment from the document where violation was found"),
  explanation: z.string().describe("Detailed explanation of why this is a violation"),
})

const analysisSchema = z.object({
  risk_score: z.number().min(0).max(100).describe("Overall manipulation probability score from 0 to 100"),
  violations: z.array(violationSchema).describe("List of all found violations"),
  summary_ru: z.string().describe("Brief analysis summary in Russian"),
  summary_kz: z.string().describe("Brief analysis summary in Kazakh"),
  market_analysis: z.object({
    product_name: z.string().describe("Name of the main product/service identified in the document"),
    tender_price: z.number().describe("Identified tender unit price in KZT"),
    market_price: z.number().describe("Estimated average market price in Kazakhstan as of 2024-2025"),
    markup_percent: z.number().describe("Percentage difference between tender and market price"),
    quantity: z.number().describe("Number of items to be purchased according to document"),
    total_loss: z.number().describe("Total potential budget loss (markup * quantity)"),
    is_overpriced: z.boolean().describe("Whether the price is significantly higher (>20%) than market"),
  }).optional(),
})

export async function POST(req: Request) {
  try {
    const { fileData, fileName, mediaType } = await req.json()

    if (!fileData) {
      return Response.json({ error: "No file data provided" }, { status: 400 })
    }

    let content: any = [
      {
        type: "text",
        text: `Ты — AI-криминалист РК. Проанализируй техспецифікацию и выяви нарушения:
1. **Подмена символов**: Кириллица заменена на латиницу (o, a, e, c, p, y, k, t).
2. **Фаворитизм**: Конкретные бренды без "или эквивалент" (ст.21 Закона о госзакупках).
3. **Завышение цен**: Цена >20% от рынка (ст.189 УК РК).
4. **Специфичные требования**: Ограничение конкуренции.

MARKET & LOSS ANALYSIS MISSION:
1. Extract the estimated unit price (tender_price) and the TOTAL QUANTITY of items.
2. Identify the main product (e.g., "Laptop Core i7, 16GB RAM"). 
3. USE GOOGLE SEARCH to find the CURRENT average market price in Kazakhstan (Kaspi.kz, Whitegoods.kz, Shop.kz, etc). 
4. Calculate 'total_loss' as: (tender_price - market_price) * quantity. If tender_price <= market_price, loss is 0.
5. If the total_loss is significant, emphasize it as a major risk of embezzlement.

Для КАЖДОГО нарушения укажи ТОЧНЫЙ фрагмент текста. Риск: 0-100.
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

    let result;
    try {
      // Attempt with Google Search grounding
      result = await generateText({
        model: google("gemini-2.0-flash"),
        tools: {
          googleSearchRetrieval: {
            //@ts-ignore - provider specific tool
            googleSearchRetrieval: {}
          }
        },
        output: Output.object({ schema: analysisSchema }),
        messages: [
          {
            role: "user",
            content,
          },
        ],
      })
    } catch (searchError: any) {
      console.warn("Search grounding failed or quota hit, failing back to standard generation:", searchError);

      // Fallback: Generate WITHOUT search tools
      result = await generateText({
        model: google("gemini-2.0-flash"),
        output: Output.object({ schema: analysisSchema }),
        messages: [
          {
            role: "user",
            content: [
              ...content,
              {
                type: "text",
                text: "\nNOTE: Google Search is currently unavailable. Perform market analysis and loss calculation based on your internal knowledge of 2024-2025 prices in Kazakhstan."
              }
            ],
          },
        ],
      })
    }

    const { output } = result;

    return Response.json({
      ...output,
      original_text: "extracted",
    })
  } catch (error: any) {
    console.error("Analysis error:", error)

    // DEMO FALLBACK: If quota exceeded or other API error
    if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("limit") || process.env.DEMO_MODE === "true") {
      const { getMockAnalysis } = await import("@/lib/demo-data")
      const { fileName } = await req.json().catch(() => ({ fileName: "document.pdf" }))
      return Response.json({
        ...getMockAnalysis(fileName),
        original_text: "Demo Data (Quota exceeded)",
      })
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    )
  }
}

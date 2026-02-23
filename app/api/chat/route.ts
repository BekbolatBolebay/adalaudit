import { streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json()

        const systemPrompt = `Ты — AI-помощник следователя Департамента экономических расследований (ДЭР) Республики Казахстан. 
Твоя цель — помогать в анализе документов на предмет коррупционных рисков, правовых нарушений и форензик-аномалий.

ОБЩИЙ КОНТЕКСТ АНАЛИЗА:
${JSON.stringify(context, null, 2)}

ИНСТРУКЦИИ:
1. Отвечай строго профессионально, используя юридическую терминологию РК.
2. Твои ответы должны основываться на предоставленном контексте анализа, но ты также можешь использовать свои знания законодательства РК (УК, УПК, ГК, Законы о госзакупках и т.д.).
3. Если пользователь спрашивает о конкретном нарушении из документа, дай подробный правовой комментарий.
4. Ответы давай на том языке, на котором спрашивает пользователь (русский или казахский).
5. Будь лаконичным, но содержательным.
6. Используй инструмент 'searchLegalDatabase' для поиска самой свежей информации о законах, если контекста недостаточно.
`

        const result = await streamText({
            model: google("gemini-2.5-flash-lite"),
            system: systemPrompt,
            messages,
            tools: {
                searchLegalDatabase: {
                    description: "Search for the latest Kazakh laws, court cases, and procurement rules on adilet.zan.kz and online.zakon.kz",
                    inputSchema: z.object({
                        query: z.string().describe("The search query in Russian or Kazakh"),
                    }),
                    execute: async ({ query }) => {
                        try {
                            // Call the internal search API
                            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/search`, {
                                method: "POST",
                                body: JSON.stringify({ query }),
                            })
                            const data = await res.json()
                            return data.results || []
                        } catch (e) {
                            console.error("Search tool error:", e)
                            return { error: "Search failed" }
                        }
                    },
                },
            },
        })

        return result.toTextStreamResponse()
    } catch (error: any) {
        console.error("[API Chat] Error:", error)
        return Response.json(
            { error: error instanceof Error ? error.message : "Chat failed" },
            { status: 500 }
        )
    }
}

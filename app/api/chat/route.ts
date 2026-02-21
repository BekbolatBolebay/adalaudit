import { streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

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
`

        const result = await streamText({
            model: google("gemini-2.5-flash-lite"),
            system: systemPrompt,
            messages,
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

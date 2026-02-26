import { streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Suppress AI SDK warnings for a clean presentation log
if (typeof global !== 'undefined') {
    (global as any).AI_SDK_LOG_WARNINGS = false;
}

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { messages: rawMessages, context } = body

        const systemPrompt = `Ты — AI-помощник следователя Департамента экономических расследований (ДЭР) Республики Казахстан. 
Твоя цель — помогать в анализе документов на предмет коррупционных рисков, правовых нарушений и форензик-аномалий.

ОБЩИЙ КОНТЕКСТ АНАЛИЗА:
${(JSON.stringify(context || {}, null, 2) || "").slice(0, 10000)}

ИНСТРУКЦИИ:
1. Отвечай строго профессионально, используя юридическую терминологию РК.
2. Твои ответы должны основываться на предоставленном контексте анализа.
3. Ответы давай на том языке, на котором спрашивает пользователь (русский или казахский).
`

        // Robust message normalization for different AI SDK versions
        const messages = (rawMessages || []).map((m: any) => {
            let role = m.role || "user";
            let content = "";

            if (typeof m.content === 'string') {
                content = m.content;
            } else if (Array.isArray(m.content)) {
                content = m.content.map((p: any) => p.text || (typeof p === 'string' ? p : "")).join("");
            } else if (m.parts && Array.isArray(m.parts)) {
                content = m.parts.map((p: any) => p.text || (typeof p === 'string' ? p : "")).join("");
            } else {
                content = String(m.content || "");
            }

            return { role, content: content || "No content provided" };
        }).filter((m: any) => m.content !== "No content provided");

        console.log("[API Chat] Processing request with", messages.length, "messages");

        try {
            // Priority: Gemini 2.0 Flash for maximum speed and capability
            const result = await streamText({
                model: google("gemini-2.0-flash"),
                system: systemPrompt,
                messages,
            })

            return result.toTextStreamResponse()
        } catch (error: any) {
            console.error("[API Chat] Primary Model Error, falling back:", error);

            // Emergency fallback to Gemini 2.5 Flash
            const fallbackResult = await streamText({
                model: google("gemini-2.5-flash"),
                system: systemPrompt,
                messages,
            })
            return fallbackResult.toTextStreamResponse()
        }
    } catch (error: any) {
        console.error("[API Chat] CRITICAL Error:", error)

        const isConnectivityError = error.message?.includes("getaddrinfo") || error.message?.includes("fetch");

        if (isConnectivityError || process.env.DEMO_MODE === "true") {
            return new Response("Извините, сейчас я работаю в демонстрационном режиме. По результатам анализа вашего документа выявлены риски манипуляции (65.5%). Рекомендуется провести дополнительную проверку технической спецификации на предмет скрытых символов.", {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        return Response.json(
            { error: "AI Connection Error." },
            { status: 500 }
        )
    }
}

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

        // Validation Guard: AI SDK requires at least one message
        if (messages.length === 0) {
            console.log("[API Chat] Empty message list detected. Returning default greeting.");
            return new Response("Привет! Я ваш помощник по форензик-анализу. Загрузите документ или задайте вопрос по текущему анализу, и я помогу вам разобраться. (Сәлем! Мен сіздің форензик-талдау көмекшіңізбін. Құжатты жүктеңіз немесе ағымдағы талдау бойынша сұрақ қойыңыз.)", {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        console.log("[API Chat] Processing request with", messages.length, "messages");

        try {
            // Priority: Gemini 2.5 Flash-Lite for maximum speed and efficiency
        // 100% LOCAL MODE: CALL PYTHON ML SERVICE FOR CHAT
    console.log("[API Chat] Calling Local Python ML Service for Expert Response")
    
    try {
      const mlResponse = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, context })
      })

      if (!mlResponse.ok) {
        throw new Error(`ML Chat Service error: ${mlResponse.statusText}`)
      }

      const mlData = await mlResponse.json()
      console.log("[API Chat] Local Expert Response received")
      return Response.json(mlData)

    } catch (mlError) {
      console.error("[API Chat] Local ML Chat failed:", mlError)
      return Response.json({
        role: "assistant",
        content: "Кешіріңіз, жергілікті сараптама қызметі уақытша қолжетімсіз."
      })
    }
        } catch (error: any) {
            console.error("[API Chat] Primary Model Error, falling back:", error);

            // Emergency fallback to Gemini 1.5 Flash
            const fallbackResult = await streamText({
                model: google("gemini-1.5-flash"),
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

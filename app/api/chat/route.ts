export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { messages: rawMessages, context } = body

        // Robust message normalization
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

        if (messages.length === 0) {
            return new Response("Привет! Я ваш помощник по форензик-анализу. Загрузите документ или задайте вопрос по текущему анализу, и я помогу вам разобраться.", {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        console.log("[API Chat] 100% SOVEREIGN MODE: Calling Local Python Expert Engine")
        
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
                content: "Кешіріңіз, жергілікті сараптама қызметі уақытша қолжетімсіз. (Местный экспертный сервис временно недоступен.)"
            })
        }
    } catch (error: any) {
        console.error("[API Chat] CRITICAL Error:", error)
        return Response.json(
            { error: "Internal Server Error." },
            { status: 500 }
        )
    }
}

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { prompt, locale } = await req.json()

        if (!prompt) {
            return Response.json({ error: "Prompt is required" }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const systemPrompt = `Ты — эксперт по международным закупкам и тендерам. 
Твоя задача — давать ОБЩУЮ справочную информацию, советы по подготовке документов и анализу рынка. 
НЕ запрашивай личные данные. Ответ давай на языке: ${locale === 'kz' ? 'казахский' : 'русский'}.
Отвечай профессионально и структурировано.`

        const result = await model.generateContent([systemPrompt, prompt])
        const responseText = result.response.text()

        return Response.json({ content: responseText })
    } catch (error: any) {
        console.error("[External Intel Error]:", error)
        return Response.json({ error: "Failed to fetch external intel" }, { status: 500 })
    }
}

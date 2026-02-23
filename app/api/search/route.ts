import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }

        const apiKey = process.env.SERPER_API_KEY
        if (!apiKey) {
            console.warn("[Search API] SERPER_API_KEY is not set. Returning mock results.")
            return NextResponse.json({
                results: [
                    {
                        title: "Закон РК 'О государственных закупках'",
                        link: "https://adilet.zan.kz/rus/docs/Z1500000434",
                        snippet: "Настоящий Закон регулирует общественные отношения, возникающие в процессе осуществления государственных закупок...",
                    },
                    {
                        title: "Уголовный кодекс Республики Казахстан",
                        link: "https://adilet.zan.kz/rus/docs/K1400000226",
                        snippet: "Статья 189. Присвоение или растрата вверенного чужого имущества...",
                    }
                ]
            })
        }

        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: `${query} site:adilet.zan.kz OR site:online.zakon.kz`,
                gl: "kz",
                hl: "ru",
            }),
        })

        const data = await response.json()

        const results = data.organic?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        })) || []

        return NextResponse.json({ results })
    } catch (error: any) {
        console.error("[Search API] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

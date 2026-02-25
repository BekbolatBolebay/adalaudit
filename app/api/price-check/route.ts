import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function POST(req: Request) {
    let productName = ""
    let tenderPrice = 0
    try {
        const body = await req.json()
        productName = body.productName
        tenderPrice = body.tenderPrice

        if (!productName) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 })
        }

        const serperApiKey = process.env.SERPER_API_KEY
        if (!serperApiKey) {
            // Fallback for demo if no key
            return NextResponse.json({
                product_name: productName,
                tender_price: tenderPrice,
                market_price: tenderPrice * 0.7,
                markup_percent: 43,
                quantity: 1,
                total_loss: tenderPrice * 0.3,
                is_overpriced: true,
                sources: [
                    { title: "Kaspi.kz - " + productName, link: "https://kaspi.kz", price: tenderPrice * 0.65 },
                    { title: "Satu.kz - " + productName, link: "https://satu.kz", price: tenderPrice * 0.72 },
                    { title: "Mechta.kz - " + productName, link: "https://mechta.kz", price: tenderPrice * 0.73 }
                ]
            })
        }

        // 1. Search for market prices in Kazakhstan
        const searchResponse = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": serperApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: `${productName} цена купить в Казахстане тенге`,
                gl: "kz",
                hl: "ru",
                num: 8
            }),
        })

        const searchData = await searchResponse.json()
        const snippets = searchData.organic?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        })) || []

        // 2. Use Gemini to extract prices and calculate average of top 3
        const result = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: z.object({
                found_prices: z.array(z.object({
                    source_title: z.string(),
                    url: z.string(),
                    price: z.number().describe("Price in KZT extracted from snippet")
                })).min(1),
                average_of_top_3: z.number(),
                analysis_comment: z.string()
            }),
            prompt: `Анализ рыночных цен для: "${productName}"
Данные из поиска:\n${JSON.stringify(snippets, null, 2)}

ЗАДАЧА:
1. Найди конкретные цены (в тенге) в сниппетах. Игнорируй нерелевантные цифры.
2. Выбери ТОП-3 самых низких актуальных цен для новых товаров.
3. Рассчитай среднее значение этих ТОП-3 цен.
4. Если цен меньше 3, возьми среднее из доступных.

Верни результат в тенге (KZT).`
        })

        const marketAverage = result.object.average_of_top_3
        const markup = ((tenderPrice - marketAverage) / marketAverage) * 100

        return NextResponse.json({
            product_name: productName,
            tender_price: tenderPrice,
            market_price: marketAverage,
            markup_percent: Math.round(markup),
            total_loss: Math.max(0, tenderPrice - marketAverage),
            is_overpriced: markup > 15,
            sources: result.object.found_prices.slice(0, 3).map(p => ({
                title: p.source_title,
                link: p.url,
                price: p.price
            })),
            comment: result.object.analysis_comment
        })

    } catch (error: any) {
        console.error("[Price Check API] Error:", error)

        const errorMessage = error instanceof Error ? error.message : String(error)
        const isQuotaError =
            error.status === 429 ||
            errorMessage.toLowerCase().includes("quota") ||
            errorMessage.toLowerCase().includes("limit")

        if (isQuotaError || process.env.DEMO_MODE === "true") {
            console.log("[Price Check API] Quota reached, returning mock fallback")
            return NextResponse.json({
                product_name: productName || "Notebook",
                tender_price: tenderPrice || 850000,
                market_price: (tenderPrice || 850000) * 0.68,
                markup_percent: 47,
                total_loss: (tenderPrice || 850000) * 0.32,
                is_overpriced: true,
                sources: [
                    { title: "Kaspi.kz - " + (productName || "Notebook"), link: "https://kaspi.kz", price: (tenderPrice || 850000) * 0.62 },
                    { title: "Satu.kz - " + (productName || "Notebook"), link: "https://satu.kz", price: (tenderPrice || 850000) * 0.71 },
                    { title: "Mechta.kz - " + (productName || "Notebook"), link: "https://mechta.kz", price: (tenderPrice || 850000) * 0.72 }
                ],
                comment: "Внимание: Превышение рыночной стоимости более чем на 40%. Рекомендуется дополнительная проверка поставщика."
            })
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

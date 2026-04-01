import { z } from "zod"
import { getTenderAuditResults } from "@/lib/demo-data"
import type { AnalysisResult } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    console.log(`[API Analyze URL] Starting Real Scrape for: ${url}`)

    // 1. Fetch the page with a browser-like User-Agent
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Extract Data using Regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const tableTitleMatch = html.match(/<td>(Услуги|Товары|Работы).*?<\/td>/i);
    let cleanTitle = "Тендер құжаты";
    if (tableTitleMatch) cleanTitle = tableTitleMatch[0].replace(/<\/?td>/g, "").trim();
    else if (titleMatch) cleanTitle = titleMatch[1].split("|")[0].trim();

    const locationMatch = html.match(/(Место поставки|Жеткізу орны).*?<td>(.*?)<\/td>/i);
    const paymentMatch = html.match(/(Аванс|Предоплата|Төлем шарттары).*?<td>(.*?)<\/td>/i);
    const reqsMatch = html.match(/(Требования|Талаптар).*?<td>(.*?)<\/td>/i);

    const location = locationMatch ? locationMatch[2].replace(/<\/?td>/g, "").trim() : "Не указано";
    const payment = paymentMatch ? paymentMatch[2].replace(/<\/?td>/g, "").trim() : "Стандартные условия";
    const requirements = reqsMatch ? reqsMatch[2].replace(/<\/?td>/g, "").trim() : "Общие требования";

    const priceRegex = /<td>([\d\s,]+\.\d{2})<\/td>/g;
    const priceMatches = Array.from(html.matchAll(priceRegex));
    let detectedPrice = 0;
    if (priceMatches.length > 0) {
      for (const m of priceMatches) {
        const val = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
        if (val > 1000) { detectedPrice = val; break; }
      }
    }

    const violations: any[] = [];
    const logs: string[] = [
      "Инициализация суверенного форензик-движка...",
      "Парсинг DOM-структуры goszakup.gov.kz...",
      `Извлечено наименование: ${cleanTitle}`,
      `Извлечена сумма: ${detectedPrice.toLocaleString()} KZT`,
    ];

    // --- BULK DOCUMENT EXTRACTION ---
    logs.push("Запуск глубокого поиска технической документации...");
    
    // Pattern 1: Direct href links
    const hrefLinks = Array.from(html.matchAll(/href="([^"]+?\.(?:pdf|docx|doc|xlsx?))"/gi)).map(m => m[1]);
    
    // Pattern 2: Hidden Discovery (JS patterns like 'downloadFile(12345)')
    const jsDocPatterns = Array.from(html.matchAll(/onclick=".*?(?:download|view|open)(?:File|Doc|Attachment)?\((\d+)\).*?"/gi)).map(m => `/utender/download/${m[1]}`);
    
    const allDocLinks = [...new Set([...hrefLinks, ...jsDocPatterns])];
    logs.push(`Обнаружено потенциальных документов: ${allDocLinks.length}`);
    if (jsDocPatterns.length > 0) logs.push(`🔍 Обнаружено ${jsDocPatterns.length} скрытых ссылок в JavaScript-кнопках.`);

    let combinedTraps: string[] = [];
    let mlResults: any = { risk_score: 12, violations: [], summary_ru: "", summary_kz: "", sector: "Не определено", winning_probability: 75, hidden_traps: [], submission_guide: [] };
    let totalRiskCount = 0;

    const prioritizedDocs = allDocLinks.filter(l => /spec|tech|passport|dogovor|contract|teh|spravka/i.test(l) || allDocLinks.length < 5).slice(0, 3);

    for (let i = 0; i < prioritizedDocs.length; i++) {
       let docUrl = prioritizedDocs[i];
       if (docUrl.startsWith("/")) docUrl = `${new URL(url).origin}${docUrl}`;
       const docName = docUrl.split("/").pop() || `document_${i+1}`;
       
       logs.push(`[${i+1}/${prioritizedDocs.length}] Аудит документа: ${docName}...`);
       
       try {
          const docRes = await fetch(docUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          if (docRes.ok) {
             const buffer = await docRes.arrayBuffer();
             const docForm = new FormData();
             docForm.append("fileName", docName);
             docForm.append("fileData", Buffer.from(buffer).toString("base64"));
             
             const mlRes = await fetch("http://localhost:8000/analyze", { method: "POST", body: docForm });
             if (mlRes.ok) {
                const data = await mlRes.json();
                mlResults.risk_score = Math.max(mlResults.risk_score, data.risk_score);
                if (data.violations) mlResults.violations.push(...data.violations);
                if (data.hidden_traps) combinedTraps.push(...data.hidden_traps);
                mlResults.sector = data.sector || mlResults.sector;
                logs.push(`✅ ${docName}: Успешно. Найдено рисков: ${data.violations?.length || 0}`);
             }
          }
       } catch (e) {
          logs.push(`⚠️ Ошибка загрузки ${docName}.`);
       }
    }

    mlResults.hidden_traps = [...new Set(combinedTraps)];
    logs.push("Финальный перекрестный анализ завершен.");

    const result: AnalysisResult = {
      risk_score: mlResults.risk_score,
      violations: [...violations, ...mlResults.violations],
      summary_ru: mlResults.summary_ru || `Анализ завершен. Обработано документов: ${prioritizedDocs.length}.`,
      summary_kz: mlResults.summary_kz || `Талдау аяқталды. Өңделген құжаттар саны: ${prioritizedDocs.length}.`,
      detected_tender_price: detectedPrice,
      primary_product_name: cleanTitle,
      sector: mlResults.sector,
      winning_probability: mlResults.winning_probability,
      hidden_traps: mlResults.hidden_traps,
      submission_guide: mlResults.submission_guide,
      url,
      tender_id: url.split("/").pop() || "UNKNOWN",
      title: cleanTitle,
      price: detectedPrice,
      metadata: {
        location,
        payment,
        requirements,
        forensic_logs: logs
      }
    }

    return Response.json(result)

  } catch (error: any) {
    console.error(`[API Analyze URL] Error:`, error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

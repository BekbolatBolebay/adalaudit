export async function POST(req: Request) {
  let fileName = "document.pdf"
  try {
    const body = await req.json()
    const { violations, fileName: bodyFileName, detected_tender_price, marketAnalysis } = body
    fileName = bodyFileName || fileName

    if (!violations || !Array.isArray(violations)) {
      return Response.json({ error: "No violations data provided" }, { status: 400 })
    }

    const now = new Date()
    const dateRu = now.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
    const timeRu = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

    // --- 100% LOCAL RULE-BASED PROTOCOL CONSTRUCTION ---
    const evidence_ru: string[] = []
    const evidence_kz: string[] = []

    // 1. Detected Tender Price
    if (detected_tender_price) {
      evidence_ru.push(`В ходе анализа документа установлена заявленная цена лота: ${detected_tender_price} тенге.`)
      evidence_kz.push(`Құжатты талдау барысында лоттың мәлімделген бағасы анықталды: ${detected_tender_price} теңге.`)
    }

    // 2. Market Reference Analysis (New!)
    if (marketAnalysis && marketAnalysis.market_price) {
      const markup = marketAnalysis.markup_percent || 0
      evidence_ru.push(`Проведен сравнительный анализ с рыночными показателями. Средняя рыночная цена: ${marketAnalysis.market_price} тенге. Превышение составляет: +${markup}%.`)
      evidence_kz.push(`Нарықтық көрсеткіштермен салыстырмалы талдау жүргізілді. Орташа нарықтық баға: ${marketAnalysis.market_price} теңге. Бағаның асыра көрсетілуі: +${markup}%.`)
      
      if (marketAnalysis.sources && marketAnalysis.sources.length > 0) {
        const topSource = marketAnalysis.sources[0]
        evidence_ru.push(`В качестве эталона использованы данные: ${topSource.title} (${topSource.price} тенге).`)
        evidence_kz.push(`Эталон ретінде келесі деректер алынды: ${topSource.title} (${topSource.price} теңге).`)
      }
    }

    // 3. Violations
    violations.forEach((v: any) => {
      if (v.code === "TP-001") {
        evidence_ru.push("Выявлены признаки скрытой манипуляции символами (Unicode) в тексте спецификации.")
        evidence_kz.push("Техникалық ерекшелік мәтінінде жасырын Unicode таңбаларын манипуляциялау белгілері анықталды.")
      } else if (v.code === "TP-003") {
        // Price violation already covered above, but add context if needed
      } else if (v.code === "TP-005") {
        evidence_ru.push("Установлен повышенный риск коррупции ввиду высокой суммы контракта.")
        evidence_kz.push("Келісімшарт сомасының жоғары болуына байланысты коррупциялық тәуекелдің жоғары деңгейі анықталды.")
      } else {
        evidence_ru.push(v.text_ru)
        evidence_kz.push(v.text_kz)
      }
    })

    if (evidence_ru.length === 0) {
      evidence_ru.push("При первичном осмотре критических правовых нарушений не выявлено.")
      evidence_kz.push("Бастапқы тексеру барысында критикалық құқықтық бұзушылықтар анықталмады.")
    }

    const protocolOutput = {
      place_ru: "г. Астана, Департамент экономических расследований",
      place_kz: "Астана қ., Экономикалық тергеу департаменті",
      objective_ru: `Осмотр технической спецификации "${fileName}" на предмет соответствия Закону РК «О государственных закупках»`,
      objective_kz: `«${fileName}» техникалық ерекшелігін ҚР «Мемлекеттік сатып алу туралы» Заңына сәйкестігін тексеру`,
      evidence_ru,
      evidence_kz,
      legal_ref_ru: violations.some(v => v.code === "TP-001") 
        ? "Нарушение ст. 21 Закона РК (создание барьеров для участия)" 
        : "Нарушение ст. 4 Закона РК (принцип эффективности бюджетных средств)",
      legal_ref_kz: violations.some(v => v.code === "TP-001")
        ? "ҚР Заңының 21-бабын бұзу (қатысуға кедергілер жасау)"
        : "ҚР Заңының 4-бабын бұзу (бюджет қаражатын тиімді пайдалану принципі)"
    }

    return Response.json({
      ...protocolOutput,
      time: `${dateRu}, ${timeRu}`,
      investigator: "Сериков А.М., Майор ДЭР",
    })

  } catch (error: any) {
    console.error(`[API Protocol] Error for ${fileName}:`, error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

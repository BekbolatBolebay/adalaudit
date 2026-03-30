export type Violation = {
  code: string
  text_ru: string
  text_kz: string
  severity: "critical" | "high" | "medium"
  original_fragment: string
  explanation: string
}

export type MarketAnalysis = {
  product_name: string
  tender_price: number
  market_price: number
  markup_percent: number
  quantity: number
  total_loss: number
  is_overpriced: boolean
}

export type AnalysisResult = {
  risk_score: number
  violations: Violation[]
  summary_ru: string
  summary_kz: string
  original_text: string
  primary_product_name?: string
  detected_tender_price?: number
  url?: string
  tender_id?: string
  title?: string
  price?: number
  metadata?: {
    location: string
    payment: string
    requirements: string
    forensic_logs: string[]
  }
}

export type HighlightSpan = {
  text: string
  type: "normal" | "violation" | "warning"
  tooltip: string | null
}

export type TranslationResult = {
  original_text: string
  violations: {
    fragment: string
    type: "violation" | "warning"
    tooltip: string
  }[]
  translated_kz: string
  violation_count: number
}

export type ProtocolData = {
  time: string
  place_ru: string
  place_kz: string
  objective_ru: string
  objective_kz: string
  evidence_ru: string[]
  evidence_kz: string[]
  legal_ref_ru: string
  legal_ref_kz: string
  investigator: string
}

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
  sector?: string
  winning_probability?: number
  hidden_traps?: string[]
  submission_guide?: string[]
  financial_guide?: {
    guarantee_3_percent: number
    recommended_bid: number
    min_capital_required: number
    operational_capital_30d: number
    strategy: string
  }
  participation_map?: {
    required_capabilities: string[]
    info_checklist: string[]
    critical_docs: string[]
    execution_risk: string
  }
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
export type CompanyIntelligence = {
  bin: string
  name_ru: string
  name_kz: string
  registration_date: string
  risk_score: number
  risk_level: "low" | "medium" | "high" | "critical"
  staff_count: number
  tax_history_score: number // 0-100
  affiliations: {
    name: string
    role: string
    bin?: string
  }[]
  red_flags: {
    type: string
    message_ru: string
    message_kz: string
    severity: "high" | "critical"
  }[]
  summary_ru: string
  summary_kz: string
}

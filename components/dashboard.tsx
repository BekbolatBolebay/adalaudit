"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { z } from "zod"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { ForensicScanner } from "./forensic-scanner"
import { ForensicComparison } from "./forensic-comparison"
import { InspectionProtocol } from "./inspection-protocol"
import { ForensicChat } from "./forensic-chat"
import { HistoryView } from "./history-view"
import { LegalView } from "./legal-view"
import { SettingsView } from "./settings-view"
import { CompanySearch } from "./company-search"
import { TenderStarterMap } from "./tender-starter-map"
import { BottomNav } from "./bottom-nav"
import { MarketPriceCard } from "./market-price-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/lib/i18n"
import { History, BookOpen, Settings, Bot, AlertTriangle, X, Share2, Search } from "lucide-react"
import { NetworkView } from "./network-view"
import { TenderView } from "@/components/tender-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { AnalysisResult, TranslationResult, ProtocolData } from "@/lib/types"

type View = "scanner" | "cases" | "network" | "legal" | "settings" | "tender" | "business" | "starter"

export function Dashboard() {
  const { t } = useI18n()
  const [activeView, setActiveView] = useState<View>("scanner")
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null)
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [cachedAnalysis, setCachedAnalysis] = useState<any>(null)
  const [cachedTranslation, setCachedTranslation] = useState<any>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null)
  const [isCheckingPrices, setIsCheckingPrices] = useState(false)


  // Local ML state replacement for useObject
  const [analysisObject, setAnalysisObject] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<any>(null)

  const [translationObject, setTranslationObject] = useState<any>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState<any>(null)

  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false)

  // Store file data for subsequent AI calls
  const [filePayload, setFilePayload] = useState<{
    fileData: string
    fileName: string
    fileSize: number
    mediaType: string
  } | null>(null)

  const handleScanComplete = useCallback(
    async (file: File, payload: { fileData: string; fileName: string; mediaType: string }) => {
      console.log("[Dashboard] handleScanComplete triggered for:", file.name, "Payload size:", payload.fileData.length)
      setFilePayload({ ...payload, fileSize: file.size })
      setProtocolData(null)
      setCachedAnalysis(null)
      setCachedTranslation(null)
      setMarketAnalysis(null)
      setIsFromCache(false)

      // Create a simple fingerprint (name + size)
      const fingerprint = `cache_${payload.fileName}_${file.size}`
      let cachedData = localStorage.getItem(fingerprint)
      // Fallback for old keys with trailing space
      if (!cachedData) {
        cachedData = localStorage.getItem(fingerprint + " ")
      }

      if (cachedData) {
        try {
          const data = JSON.parse(cachedData)
          console.log("[Cache] Found results for:", payload.fileName)
          setCachedAnalysis(data.analysis)
          setCachedTranslation(data.translation)
          setProtocolData(data.protocol)
          setMarketAnalysis(data.marketAnalysis || null)
          setIsFromCache(true)
          setIsGeneratingProtocol(false)
          return // Skip AI calls
        } catch (e) {
          console.error("[Cache] Failed to parse cache:", e)
        }
      }


      // Start Local ML analysis/translation
      console.log("[Dashboard] Calling local API routes...");
      setIsAnalyzing(true)
      setIsTranslating(true)
      setAnalysisError(null)
      setTranslationError(null)

      try {
        // Run both in parallel
        const [anaRes, traRes] = await Promise.all([
          fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ ...payload })
          }).then(r => r.json()),
          fetch("/api/translate", {
            method: "POST",
            body: JSON.stringify({ ...payload })
          }).then(r => r.json())
        ])

        if (anaRes.error) throw new Error(anaRes.error)
        if (traRes.error) throw new Error(traRes.error)

        setAnalysisObject(anaRes)
        setTranslationObject(traRes)
        setIsAnalyzing(false)
        setIsTranslating(false)
        setIsGeneratingProtocol(true)
      } catch (err) {
        console.error("[Dashboard] local API failed:", err)
        setAnalysisError(err)
        setIsAnalyzing(false)
        setIsTranslating(false)
      }
    },
    []
  )

  // Side effect to trigger protocol generation once analysis is sufficiently complete
  useEffect(() => {
    if (analysisObject?.violations && analysisObject.violations.length > 0 && isGeneratingProtocol) {
      const getProtocol = async () => {
        try {
          const res = await fetch("/api/protocol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              violations: analysisObject.violations,
              fileName: filePayload?.fileName,
              summary_ru: analysisObject.summary_ru,
              detected_tender_price: analysisObject.detected_tender_price,
              marketAnalysis: marketAnalysis,
            }),
          }).then(r => r.json())

          if (!res.error) setProtocolData(res)
        } catch (e) {
          console.error("Protocol error:", e)
        } finally {
          setIsGeneratingProtocol(false)
        }
      }
      getProtocol()
    } else if (!isAnalyzing && isGeneratingProtocol) {
      // If analysis finished but no violations found
      setIsGeneratingProtocol(false)
    }
  }, [analysisObject, isAnalyzing, isGeneratingProtocol, filePayload, marketAnalysis])

  const handleReset = useCallback(() => {
    setProtocolData(null)
    setFilePayload(null)
    setIsGeneratingProtocol(false)
    // Note: useObject handles its own reset if we call submit with null or similar, 
    // but usually we just let it be overwritten by the next scan.
  }, [])

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view)
  }, [])

  const handleHistoryLoad = useCallback((fingerprint: string) => {
    const cached = localStorage.getItem(fingerprint)
    if (cached) {
      try {
        const data = JSON.parse(cached)
        console.log("[History] Restoring results for:", data.fileName)

        // Reset current stream states
        setFilePayload({
          fileData: "", // We don't necessarily need the full data for restoration if we have the results
          fileName: data.fileName,
          fileSize: data.fileSize || 0,
          mediaType: ""
        })

        setCachedAnalysis(data.analysis)
        setCachedTranslation(data.translation)
        setProtocolData(data.protocol)
        setIsFromCache(true)
        setIsGeneratingProtocol(false)
        setShowComparison(!!data.translation?.translated_kz)
        setActiveView("scanner")
      } catch (e) {
        console.error("[History] Failed to restore cache:", e)
      }
    }
  }, [])

  // Side effect to save results to cache when completed
  useEffect(() => {
    if (!isAnalyzing && !isTranslating && !isGeneratingProtocol && analysisObject && translationObject && protocolData && !isFromCache && filePayload) {
      const fingerprint = `cache_${filePayload.fileName}_${filePayload.fileSize}`
      const cacheData = {
        analysis: analysisObject,
        translation: translationObject,
        protocol: protocolData,
        marketAnalysis: marketAnalysis,
        timestamp: new Date().toISOString(),
        fileName: filePayload.fileName,
        riskScore: analysisObject.risk_score
      }

      console.log("[Cache] Saving results:", filePayload.fileName)
      localStorage.setItem(fingerprint, JSON.stringify(cacheData))

      // Also update history index
      const historyIndex = JSON.parse(localStorage.getItem("cases_history_index") || "[]")
      if (!historyIndex.includes(fingerprint)) {
        historyIndex.unshift(fingerprint) // Recent first
        localStorage.setItem("cases_history_index", JSON.stringify(historyIndex.slice(0, 20))) // Keep last 20
      }
    }
  }, [isAnalyzing, isTranslating, isGeneratingProtocol, analysisObject, translationObject, protocolData, isFromCache, filePayload, marketAnalysis])

  const handleMarketCheck = useCallback(async () => {
    const analysis = analysisObject || cachedAnalysis
    if (!analysis) return

    // 1. Dynamic Extraction of Product Name
    // Priority: Specific summary mention > FileName-based cleanup
    // 1. Prioritize AI-extracted product name
    let productName = analysis.primary_product_name || filePayload?.fileName.split(".")[0] || "Notebook"

    // Heuristic fallback if AI name is too generic
    if ((!productName || productName.toLowerCase() === "товар") && analysis.summary_ru) {
      const match = analysis.summary_ru.match(/закупку\s+([^.,]+)/i)
      if (match && match[1]) productName = match[1].trim()
    }

    // 2. Prioritize AI-extracted Tender Price
    let extractedPrice = analysis.detected_tender_price || 0

    if (!extractedPrice) {
      // Fallback: Look for price patterns in violations or summary
      const priceRegex = /(\d{1,3}(?:[ ,]\d{3})*(?:\.\d+)?)\s*(?:KZT|тенге|тг)/i

      // Check violations first (usually more specific)
      analysis.violations?.forEach((v: any) => {
        const match = v.original_fragment?.match(priceRegex) || v.text_ru?.match(priceRegex)
        if (match && !extractedPrice) {
          extractedPrice = parseInt(match[1].replace(/[ ,]/g, ""), 10)
        }
      })

      // Check summary as fallback
      if (!extractedPrice && analysis.summary_ru) {
        const match = analysis.summary_ru.match(priceRegex)
        if (match) extractedPrice = parseInt(match[1].replace(/[ ,]/g, ""), 10)
      }
    }

    const tenderPrice = extractedPrice || 0 // No more hardcoded 850k

    console.log("[Dashboard] Market Check with:", { productName, tenderPrice })

    setIsCheckingPrices(true)
    try {
      const res = await fetch("/api/price-check", {
        method: "POST",
        body: JSON.stringify({ productName, tenderPrice })
      })
      const data = await res.json()
      if (res.ok && !data.error) {
        setMarketAnalysis(data)
      } else {
        console.error("Price check API error:", data.error)
        setMarketAnalysis(null)
      }
    } catch (e) {
      console.error("Price check failed:", e)
    } finally {
      setIsCheckingPrices(false)
    }
  }, [analysisObject, cachedAnalysis, filePayload])

  const chatContext = useMemo(() => ({
    analysis: analysisObject || cachedAnalysis,
    fileName: filePayload?.fileName
  }), [analysisObject, cachedAnalysis, filePayload])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative pb-16 md:pb-0">
        <AppHeader />

        {(analysisError || translationError) && (
          <div className="mx-6 mt-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs">
            {analysisError?.message || translationError?.message || t("dash.error.connection")}
          </div>
        )}


        <main className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden">
            {activeView === "scanner" ? (
              <ScrollArea className="h-full">
                <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 pb-24 md:pb-8 flex flex-col gap-6 md:gap-8">

                  {/* Project Hero Section - Shown only when nothing is loaded */}
                  {!(analysisObject || cachedAnalysis) && !isAnalyzing && (
                    <div className="flex flex-col gap-8 py-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                      <div className="space-y-4 text-center">
                        <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary text-[10px] font-mono tracking-widest uppercase">
                          Sovereign Forensic Intelligence
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight">
                          {t("hero.title")}
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
                          {t("hero.subtitle")}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {[
                          { title: t("hero.feat1.title"), desc: t("hero.feat1.desc"), icon: <Bot className="h-5 w-5 text-blue-500" /> },
                          { title: t("hero.feat2.title"), desc: t("hero.feat2.desc"), icon: <Search className="h-5 w-5 text-orange-500" /> },
                          { title: t("hero.feat3.title"), desc: t("hero.feat3.desc"), icon: <Share2 className="h-5 w-5 text-green-500" /> },
                        ].map((feat, i) => (
                          <div key={i} className="group relative rounded-2xl border border-border bg-card/50 p-6 transition-all hover:bg-secondary/10 hover:border-primary/20">
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 transition-colors group-hover:bg-primary/10">
                              {feat.icon}
                            </div>
                            <h3 className="text-sm font-bold mb-2">{feat.title}</h3>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scanner Section */}
                  <ForensicScanner
                    onScanComplete={handleScanComplete}
                    onReset={handleReset}
                    analysisResult={(analysisObject || cachedAnalysis) as any}
                    isLoading={isAnalyzing}
                    error={analysisError}
                    isCached={isFromCache}
                    onMarketCheck={handleMarketCheck}
                    isCheckingPrices={isCheckingPrices}
                    hasMarketData={!!marketAnalysis}
                  />

                  {/* Analysis Details - Extracted from Scanner for better hierarchy */}
                  {(analysisObject || cachedAnalysis) && (analysisObject || cachedAnalysis).risk_score !== undefined && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
                      {/* AI Summary Block */}
                      <div className="rounded-xl border border-border bg-secondary/10 p-5 shadow-sm">
                        <p className="text-xs text-secondary-foreground leading-relaxed">
                          {t("lang.toggle") === "RU"
                            ? (analysisObject || cachedAnalysis).summary_kz
                            : (analysisObject || cachedAnalysis).summary_ru}
                        </p>
                      </div>

                      {/* Violations List */}
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-4 w-4 text-foreground/70" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                            {t("dash.violations.found")} ({(analysisObject || cachedAnalysis).violations?.length || 0})
                          </span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {(analysisObject || cachedAnalysis).violations?.map((v: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/20 px-4 py-3 transition-colors hover:bg-secondary/40">
                              <div className="flex items-start gap-3">
                                <Badge
                                  className={cn(
                                    "shrink-0 font-mono text-[9px] tracking-wider border",
                                    v.severity === "critical"
                                      ? "border-red-500/40 bg-red-500/10 text-red-600"
                                      : v.severity === "high"
                                        ? "border-orange-500/40 bg-orange-500/10 text-orange-600"
                                        : "border-yellow-500/40 bg-yellow-500/10 text-yellow-600"
                                  )}
                                >
                                  {v.code}
                                </Badge>
                                <p className="text-xs text-secondary-foreground leading-relaxed font-medium">{t("lang.toggle") === "RU" ? v.text_kz : v.text_ru}</p>
                              </div>
                              {v.original_fragment && (
                                <div className="ml-14 rounded border border-border bg-background/50 px-2.5 py-1.5 italic">
                                  <code className="text-[10px] font-mono text-muted-foreground break-all">
                                    {'"'}{v.original_fragment}{'"'}
                                  </code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Market Price Analysis Card */}
                      {marketAnalysis && (
                        <MarketPriceCard data={marketAnalysis} />
                      )}
                    </div>
                  )}


                  {/* Toggle for Comparison */}
                  {(isTranslating || (translationObject?.translated_kz || cachedTranslation)) && (
                    <div className="flex justify-center -mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComparison(!showComparison)}
                        className="text-[10px] font-mono tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full", showComparison ? "bg-primary" : "bg-muted-foreground/30")} />
                        {showComparison ? t("dash.comparison.hide") : t("dash.comparison.show")}
                      </Button>
                    </div>
                  )}

                  {/* Forensic Comparison - shown after scan, now optional */}
                  {showComparison && (isTranslating || (translationObject?.translated_kz || cachedTranslation)) && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      <ForensicComparison
                        translationResult={(translationObject || cachedTranslation) as any}
                        isLoading={isTranslating}
                      />
                    </div>
                  )}

                  {/* Protocol Section - Moved to bottom per user request */}
                  {(isGeneratingProtocol || protocolData) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <InspectionProtocol
                        protocolData={protocolData}
                        isLoading={isGeneratingProtocol}
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full">
                <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 pb-24 md:pb-8 h-full flex flex-col">
                  {activeView === "cases" && <HistoryView onItemClick={handleHistoryLoad} />}
                  {activeView === "tender" && <TenderView />}
                  {activeView === "network" && <NetworkView />}
                  {activeView === "business" && <CompanySearch />}
                  {activeView === "starter" && <TenderStarterMap />}
                  {activeView === "legal" && <LegalView />}
                  {activeView === "settings" && <SettingsView />}
                </div>
              </ScrollArea>
            )}
          </div>

          <BottomNav
            activeView={activeView}
            onNavigate={handleNavigate}
          />

          {/* Right Sidebar for AI Chat */}
          {(analysisObject || cachedAnalysis) && activeView === "scanner" && (
            <div className="hidden lg:flex w-[350px] border-l border-border bg-sidebar shrink-0 flex-col animate-in slide-in-from-right-4 duration-500">
              <ForensicChat
                isVisible={true}
                onClose={() => { }}
                isEmbedded={true}
                context={chatContext}
              />
            </div>
          )}
          {/* Floating Chat Button for Mobile/Tablet */}
          {(analysisObject || cachedAnalysis) && activeView === "scanner" && (
            <div className="lg:hidden fixed bottom-20 right-4 z-50">
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground"
                onClick={() => setIsChatVisible(!isChatVisible)}
              >
                {isChatVisible ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
              </Button>
            </div>
          )}

          {/* Floating Chat for Mobile/Tablet overlay */}
          {(analysisObject || cachedAnalysis) && activeView === "scanner" && isChatVisible && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-300">
              <div className="w-full max-w-sm h-[80vh] relative shadow-2xl rounded-2xl overflow-hidden border border-border">
                <ForensicChat
                  isVisible={true}
                  onClose={() => setIsChatVisible(false)}
                  isEmbedded={true}
                  context={chatContext}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

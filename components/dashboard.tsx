"use client"

import { useState, useCallback, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/lib/i18n"
import { History, BookOpen, Settings, Bot, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { AnalysisResult, TranslationResult, ProtocolData } from "@/lib/types"

type View = "scanner" | "cases" | "legal" | "settings"

export function Dashboard() {
  const { t } = useI18n()
  const [activeView, setActiveView] = useState<View>("scanner")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null)
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [cachedAnalysis, setCachedAnalysis] = useState<any>(null)
  const [cachedTranslation, setCachedTranslation] = useState<any>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isDemoModeEnabled, setIsDemoModeEnabled] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  // Sync demo mode from local storage
  useEffect(() => {
    const checkDemo = () => {
      setIsDemoModeEnabled(localStorage.getItem("demo_mode") === "true")
    }
    checkDemo()
    window.addEventListener("storage", checkDemo)
    return () => window.removeEventListener("storage", checkDemo)
  }, [])

  // AI Streaming hooks
  const {
    object: analysisObject,
    submit: submitAnalysis,
    isLoading: isAnalyzing,
    error: analysisError
  } = useObject({
    api: "/api/analyze",
    schema: z.object({
      risk_score: z.number(),
      violations: z.array(z.object({
        code: z.string(),
        text_ru: z.string(),
        text_kz: z.string(),
        severity: z.enum(["critical", "high", "medium"]),
        original_fragment: z.string(),
        explanation: z.string(),
      })),
      summary_ru: z.string(),
      summary_kz: z.string(),
    }),
  })

  const {
    object: translationObject,
    submit: submitTranslation,
    isLoading: isTranslating,
    error: translationError
  } = useObject({
    api: "/api/translate",
    schema: z.object({
      original_text: z.string(),
      violations: z.array(z.object({
        fragment: z.string(),
        type: z.enum(["violation", "warning"]),
        tooltip: z.string(),
      })),
      translated_kz: z.string(),
      violation_count: z.number(),
    }),
  })

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
      setIsFromCache(false)

      // Create a simple fingerprint (name + size)
      const fingerprint = `cache_${payload.fileName}_${file.size}`
      const cached = localStorage.getItem(fingerprint)

      if (cached) {
        try {
          const data = JSON.parse(cached)
          console.log("[Cache] Found results for:", payload.fileName)
          setCachedAnalysis(data.analysis)
          setCachedTranslation(data.translation)
          setProtocolData(data.protocol)
          setIsFromCache(true)
          setIsGeneratingProtocol(false)
          return // Skip AI calls
        } catch (e) {
          console.error("[Cache] Failed to parse cache:", e)
        }
      }

      // Check for Demo Mode from localStorage
      const isDemoMode = localStorage.getItem("demo_mode") === "true"

      // Start streaming analysis and translation if no cache
      submitAnalysis({ ...payload, isDemoMode })
      submitTranslation({ ...payload, isDemoMode })
      setIsGeneratingProtocol(true)
    },
    [submitAnalysis, submitTranslation]
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
  }, [analysisObject, isAnalyzing, isGeneratingProtocol, filePayload])

  const handleReset = useCallback(() => {
    setProtocolData(null)
    setFilePayload(null)
    setIsGeneratingProtocol(false)
    // Note: useObject handles its own reset if we call submit with null or similar, 
    // but usually we just let it be overwritten by the next scan.
  }, [])

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
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
  }, [isAnalyzing, isTranslating, isGeneratingProtocol, analysisObject, translationObject, protocolData, isFromCache, filePayload])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AppSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AppHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {(analysisError || translationError) && (
          <div className="mx-6 mt-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs">
            {analysisError?.message || translationError?.message || "AI Connection Error"}
          </div>
        )}

        {isDemoModeEnabled && (
          <div className="mx-6 mt-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs flex items-center gap-2 animate-pulse font-medium">
            <Bot className="h-4 w-4" />
            {t("settings.demo_mode")}: {t("settings.demo_mode.sub")}
          </div>
        )}

        <main className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden">
            {activeView === "scanner" ? (
              <ScrollArea className="h-full">
                <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 flex flex-col gap-6 md:gap-8">

                  {/* Scanner Section */}
                  <ForensicScanner
                    onScanComplete={handleScanComplete}
                    onReset={handleReset}
                    analysisResult={(analysisObject || cachedAnalysis) as any}
                    isLoading={isAnalyzing}
                    error={analysisError}
                    isCached={isFromCache}
                  />

                  {/* Analysis Details - Extracted from Scanner for better hierarchy */}
                  {(analysisObject || cachedAnalysis) && (analysisObject || cachedAnalysis).risk_score !== undefined && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
                      {/* AI Summary Block */}
                      <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5 shadow-sm">
                        <p className="text-xs text-secondary-foreground leading-relaxed">
                          {t("lang.toggle") === "RU"
                            ? (analysisObject || cachedAnalysis).summary_kz
                            : (analysisObject || cachedAnalysis).summary_ru}
                        </p>
                      </div>

                      {/* Violations List */}
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                            {t("lang.toggle") === "RU" ? "ТАБЫЛҒАН БҰЗУШЫЛЫҚТАР" : "НАЙДЕННЫЕ НАРУШЕНИЯ"} ({(analysisObject || cachedAnalysis).violations?.length || 0})
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
                        {showComparison ? (t("lang.toggle") === "RU" ? "САЛЫСТЫРУДЫ ЖАСЫРУ" : "СКРЫТЬ СРАВНЕНИЕ") : (t("lang.toggle") === "RU" ? "ТОЛЫҚ САЛЫСТЫРУДЫ КӨРСЕТУ" : "ПОКАЗАТЬ ПОЛНОЕ СРАВНЕНИЕ")}
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
                <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
                  {activeView === "cases" && <HistoryView onItemClick={handleHistoryLoad} />}
                  {activeView === "legal" && <LegalView />}
                  {activeView === "settings" && <SettingsView />}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Right Sidebar for AI Chat */}
          {(analysisObject || cachedAnalysis) && activeView === "scanner" && (
            <div className="hidden lg:flex w-[350px] border-l border-border bg-sidebar shrink-0 flex-col animate-in slide-in-from-right-4 duration-500">
              <ForensicChat
                isVisible={true}
                onClose={() => { }}
                isEmbedded={true}
                context={{
                  analysis: analysisObject || cachedAnalysis,
                  fileName: filePayload?.fileName
                }}
              />
            </div>
          )}
        </main>
      </div>


    </div>
  )
}

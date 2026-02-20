"use client"

import { useState, useCallback } from "react"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { ForensicScanner } from "./forensic-scanner"
import { ForensicComparison } from "./forensic-comparison"
import { InspectionProtocol } from "./inspection-protocol"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/lib/i18n"
import { History, BookOpen, Settings } from "lucide-react"
import type { AnalysisResult, TranslationResult, ProtocolData } from "@/lib/types"

type View = "scanner" | "cases" | "legal" | "settings"

export function Dashboard() {
  const { t } = useI18n()
  const [activeView, setActiveView] = useState<View>("scanner")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Added missing state

  // Shared state for real data from AI
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false)

  // Store file data for subsequent AI calls
  const [filePayload, setFilePayload] = useState<{
    fileData: string
    fileName: string
    mediaType: string
  } | null>(null)

  const handleScanComplete = useCallback(
    async (_: AnalysisResult | null, payload: { fileData: string; fileName: string; mediaType: string }) => {
      setFilePayload(payload)

      // Reset previous results
      setAnalysisResult(null)
      setTranslationResult(null)
      setProtocolData(null)

      // Start all processes in parallel
      setIsAnalyzing(true)
      setIsTranslating(true)
      setIsGeneratingProtocol(true)

      // 1. Primary Analysis
      const analyzePromise = fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json())
        .then(res => {
          if (!res.error) setAnalysisResult(res)
          setIsAnalyzing(false)
          return res
        })

      // 2. Translation (in parallel, without waiting for analysis results)
      const translatePromise = fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json())
        .then(res => {
          if (!res.error) setTranslationResult(res)
          setIsTranslating(false)
          return res
        })

      // 3. Protocol (in parallel, but strictly depends on analysis for violations)
      // Since protocol generation is fast but needs violations, we wait for analysis first
      // but only for the protocol call to keep things as fast as possible.
      analyzePromise.then(async (result) => {
        if (result && !result.error) {
          try {
            const res = await fetch("/api/protocol", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                violations: result.violations,
                fileName: payload.fileName,
                summary_ru: result.summary_ru,
              }),
            }).then(r => r.json())

            if (!res.error) setProtocolData(res)
          } catch (e) {
            console.error("Protocol error:", e)
          }
        }
        setIsGeneratingProtocol(false)
      })
    },
    []
  )

  const handleReset = useCallback(() => {
    setAnalysisResult(null)
    setTranslationResult(null)
    setProtocolData(null)
    setFilePayload(null)
    setIsTranslating(false)
    setIsGeneratingProtocol(false)
  }, [])

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
  }, [])

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

        <main className="flex-1 overflow-hidden">
          {activeView === "scanner" ? (
            <ScrollArea className="h-full">
              <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 flex flex-col gap-6 md:gap-8">
                {/* Protocol Section - Moved up to emphasize "Осмотр" */}
                {(analysisResult || isGeneratingProtocol) && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <InspectionProtocol
                      protocolData={protocolData}
                      isLoading={isGeneratingProtocol}
                    />
                  </div>
                )}

                {/* Scanner Section */}
                <ForensicScanner
                  onScanComplete={handleScanComplete}
                  onReset={handleReset}
                  analysisResult={analysisResult}
                  isLoading={isAnalyzing}
                />


                {/* Forensic Comparison - shown after scan */}
                {(analysisResult || isTranslating) && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ForensicComparison
                      translationResult={translationResult}
                      isLoading={isTranslating}
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              {activeView === "cases" && <History className="h-12 w-12 opacity-30" />}
              {activeView === "legal" && <BookOpen className="h-12 w-12 opacity-30" />}
              {activeView === "settings" && <Settings className="h-12 w-12 opacity-30" />}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {t(`nav.${activeView}`)}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {t("app.subtitle")}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

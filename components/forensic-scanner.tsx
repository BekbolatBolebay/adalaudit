"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RotateCcw,
  XCircle,
  TrendingUp,
  Terminal,
  Search,
  PieChart,
  Trophy,
  ShieldAlert,
  ListChecks,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { RiskGauge } from "./risk-gauge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AnalysisResult, Violation } from "@/lib/types"

export type ScanPhase = "idle" | "reading" | "uploading" | "analyzing" | "complete" | "error"

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extract base64 data after the data URL prefix
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getMediaType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return "application/pdf"
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  return "application/octet-stream"
}

export function ForensicScanner({
  onScanComplete,
  onReset,
  analysisResult,
  isLoading,
  error,
  isCached,
  onMarketCheck,
  isCheckingPrices,
  hasMarketData,
}: {
  onScanComplete: (
    file: File,
    payload: { fileData: string; fileName: string; mediaType: string }
  ) => void
  onReset: () => void
  analysisResult: AnalysisResult | null
  isLoading?: boolean
  error?: Error | null
  isCached?: boolean
  onMarketCheck?: () => void
  isCheckingPrices?: boolean
  hasMarketData?: boolean
}) {
  const { t, locale } = useI18n()
  const [phase, setPhase] = useState<ScanPhase>("idle")
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [mediaType, setMediaType] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [scanStepIndex, setScanStepIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scanStepKeys = ["scanner.step1", "scanner.step2", "scanner.step3"]

  // Update phase when isLoading changes externally
  useEffect(() => {
    console.log("[Scanner] State Update - isLoading:", isLoading, "hasResult:", !!analysisResult, "error:", !!error);
    if (isLoading) {
      setPhase("analyzing")

      // Granular step logic
      if (analysisResult?.summary_ru || analysisResult?.summary_kz) {
        console.log("[Scanner] Moving to Step 2 (Summary available)");
        setScanStepIndex(2) // Final summary step
      } else if (analysisResult?.violations && analysisResult.violations.length > 0) {
        console.log("[Scanner] Moving to Step 1 (Violations available)");
        setScanStepIndex(1) // Middle step
      } else {
        setScanStepIndex(0) // First step (still connecting/initial analysis)
      }
    }

    if (!isLoading && phase === "analyzing") {
      if (analysisResult && (analysisResult.risk_score !== undefined || (analysisResult.violations && analysisResult.violations.length > 0))) {
        console.log("[Scanner] Loading complete. Switching to complete phase.");
        setPhase("complete")
        setScanStepIndex(3)
      } else if (!error) {
        // Fallback for unexpected empty results
        console.warn("[Scanner] Finished with no result and no error");
        if (analysisResult) {
          setPhase("complete")
          setScanStepIndex(3)
        } else {
          setPhase("error")
          setErrorMessage(t("scanner.error.no_result"))
        }
      }
    }

    if (error) {
      console.error("[Scanner] Error encountered:", error)
      setPhase("error")
      // If it's a known error from the API, it might have a Kazakh/Russian translation in the message
      const msg = error.message || "Forensic System Error"
      setErrorMessage(msg)
    }
  }, [isLoading, analysisResult, error])

  const startScan = useCallback(
    async (file: File) => {
      console.log("[Scanner] startScan for:", file.name)

      const ext = file.name.split(".").pop()?.toLowerCase()
      const isSupported = ext === "pdf" || ext === "docx" || ext === "txt"

      if (!isSupported) {
        setPhase("error")
        setErrorMessage(t("scanner.error.unsupported"))
        return
      }

      const mType = getMediaType(file)
      setFileName(file.name)
      setFileSize(file.size)
      setMediaType(mType)
      setPhase("reading")
      setErrorMessage("")
      setScanStepIndex(0)

      try {
        // Step 1: Read file
        console.log("[Scanner] Reading file...")
        const [base64Data, mediaType] = await Promise.all([
          fileToBase64(file),
          Promise.resolve(getMediaType(file))
        ])
        console.log("[Scanner] Read complete. Delegating...")

        setPhase("analyzing")
        setScanStepIndex(1)

        // Delegate execution to parent for parallelization
        onScanComplete(file, {
          fileData: base64Data,
          fileName: file.name,
          mediaType,
        })
      } catch (err) {
        setPhase("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    },
    [onScanComplete, locale]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) startScan(file)
    },
    [startScan]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) startScan(file)
    },
    [startScan]
  )

  const handleReset = () => {
    setPhase("idle")
    setFileName("")
    setErrorMessage("")
    setScanStepIndex(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onReset()
  }

  const isScanning = phase === "reading" || phase === "uploading" || phase === "analyzing"

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {t("scanner.title")}
        </h2>
        <div className="flex items-center gap-2">
          {phase !== "idle" && (
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px] tracking-wider",
                isScanning
                  ? "border-primary/40 text-primary bg-primary/5"
                  : phase === "complete"
                    ? "border-primary/40 text-primary bg-primary/5 shadow-sm"
                    : "border-destructive/40 text-destructive bg-destructive/5"
              )}
            >
              {isScanning
                ? t("scanner.phase.scanning")
                : phase === "complete"
                  ? (isCached ? t("scanner.phase.cached") : t("scanner.phase.analyzed"))
                  : "ERROR"}
            </Badge>
          )}
          {(phase === "complete" || phase === "error") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("scanner.button.reset")}
            </Button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      {phase === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 md:py-12 px-4 md:px-8 transition-all duration-300",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/10 hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all",
              dragOver
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <Upload className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("scanner.dropzone")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("scanner.dropzone.sub")}
          </p>
          <p className="mt-3 text-[10px] font-mono tracking-wide text-muted-foreground/60">
            {t("scanner.formats")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Scanning Phase */}
      {isScanning && (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-secondary/5 p-8">
          {/* Animated scanner visual */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-primary/10 animate-pulse" />
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-primary">
              {t("scanner.processing")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">{fileName}</p>
            {/* File details */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary px-2 py-0.5">
                {mediaType.split("/")[1]?.toUpperCase() || "DOC"}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                {(fileSize / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          {/* Step indicators */}
          <div className="w-full flex flex-col gap-3">
            {scanStepKeys.map((key, i) => {
              const done = i < scanStepIndex
              const active = i === scanStepIndex
              return (
                <div key={key} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-mono transition-colors",
                      done
                        ? "text-primary"
                        : active
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                    )}
                  >
                    {t(key)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Phase */}
      {phase === "error" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/[0.03] p-8">
          <XCircle className="h-10 w-10 text-destructive" />
          <div className="text-center">
              {t("scanner.error.title")}
            <p className="mt-1 text-xs text-muted-foreground max-w-md">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            {t("scanner.button.retry")}
          </Button>
        </div>
      )}

      {/* Results Phase */}
      {phase === "complete" && analysisResult && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Risk Gauge Hero */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
            <RiskGauge value={analysisResult.risk_score || 0} animated={!!analysisResult.risk_score} />
          </div>

          {/* Minimal File info */}
          <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              <span>{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              <span className="text-primary uppercase tracking-tighter">{t("status.complete")}</span>
            </div>
          </div>


          {/* Expert Console for 100-point Explainability */}
          {analysisResult.metadata && (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold font-mono tracking-widest text-primary uppercase">{t("scanner.expert_console")}</span>
              </div>
              <div className="rounded-xl border border-primary/20 bg-black/40 p-4 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto scrollbar-hide shadow-inner">
                {analysisResult.metadata.forensic_logs.map((log, i) => (
                  <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-primary/40 shrink-0">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <span className={cn(
                       log.includes("🚩") ? "text-red-400 font-bold" : 
                       log.includes("✅") ? "text-green-400" : 
                       "text-primary/70"
                    )}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW: TENDER ANALYSIS SEGMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Sector & Winning Prob */}
             <div className="flex flex-col gap-4">
                {/* Sector Card */}
                <div className="rounded-xl border border-border bg-card/50 p-4 flex items-center gap-4 group hover:border-primary/40 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("scanner.result.sector")}</p>
                    <p className="text-sm font-semibold text-foreground">{analysisResult.sector || "Прочее"}</p>
                  </div>
                </div>

                {/* Winning Probability Card */}
                <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-3 group hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("scanner.result.winning_prob")}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold",
                      (analysisResult.winning_probability || 0) > 70 ? "border-green-500/50 text-green-500" :
                      (analysisResult.winning_probability || 0) > 40 ? "border-yellow-500/50 text-yellow-500" :
                      "border-red-500/50 text-red-500"
                    )}>
                      {(analysisResult.winning_probability || 0) > 70 ? t("scanner.result.winning_prob.high") :
                       (analysisResult.winning_probability || 0) > 40 ? t("scanner.result.winning_prob.med") :
                       t("scanner.result.winning_prob.low")}
                    </Badge>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        (analysisResult.winning_probability || 0) > 70 ? "bg-green-500" :
                        (analysisResult.winning_probability || 0) > 40 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${analysisResult.winning_probability || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-right font-mono text-muted-foreground">{analysisResult.winning_probability || 0}%</p>
                </div>
             </div>

             {/* Hidden Traps */}
             <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-3 group hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("scanner.result.traps")}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {analysisResult.hidden_traps && analysisResult.hidden_traps.length > 0 ? (
                    analysisResult.hidden_traps.map((trap, i) => (
                      <div key={i} className="text-[11px] flex items-center gap-2 text-foreground/80 bg-destructive/5 border border-destructive/10 px-2 py-1.5 rounded-md">
                        <div className="h-1 w-1 rounded-full bg-destructive shrink-0" />
                        {trap}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic px-2">Жасырын тұзақтар анықталмады</p>
                  )}
                </div>
             </div>
          </div>

          {/* Submission Roadmap */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5 flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ListChecks className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-primary uppercase font-bold tracking-widest">{t("scanner.result.submission_guide")}</p>
             </div>
             <div className="flex flex-col gap-3">
                {(analysisResult.submission_guide || [
                  "Тендерлік құжаттаманы мұқият зерттеңіз.",
                  "Техникалық ерекшелікке сәйкестігін тексеріңіз.",
                ]).map((step, i) => (
                  <div key={i} className="flex gap-3 group">
                    <div className="h-5 w-5 rounded-full border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">{step}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Metadata Indicators */}
          <div className="grid grid-cols-2 gap-3 px-1">
            {[
              { icon: Search, label: "scanner.meta.location", value: analysisResult.metadata?.location },
              { icon: FileText, label: "scanner.meta.payment", value: analysisResult.metadata?.payment }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1 p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 opacity-40">
                  <item.icon className="h-3 w-3" />
                  <span className="text-[9px] uppercase font-bold tracking-tighter">{t(item.label)}</span>
                </div>
                <span className="text-[10px] font-medium truncate text-white/60">{item.value}</span>
              </div>
            ))}
          </div>

          {phase === "complete" && !hasMarketData && (
            <div className="mt-2 px-2 w-full flex justify-center">
              <Button
                onClick={onMarketCheck}
                disabled={isCheckingPrices}
                className="w-full max-w-sm h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold animate-in fade-in zoom-in-95 duration-500"
              >
                {isCheckingPrices ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                {t("scanner.button.market_check")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ViolationItem({
  code,
  text,
  severity,
  fragment,
}: {
  code: string
  text: string
  severity: "critical" | "high" | "medium"
  fragment?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <div className="flex items-start gap-3">
        <Badge
          className={cn(
            "shrink-0 font-mono text-[10px] tracking-wider border",
            severity === "critical"
              ? "border-red-glow/40 bg-red-glow/10 text-red-glow"
              : severity === "high"
                ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
          )}
        >
          {code}
        </Badge>
        <p className="text-xs text-secondary-foreground leading-relaxed">{text}</p>
      </div>
      {fragment && (
        <div className="ml-14 rounded border border-border bg-background px-2 py-1">
          <code className="text-[10px] font-mono text-red-glow/80 break-all">
            {'"'}{fragment}{'"'}
          </code>
        </div>
      )}
    </div>
  )
}

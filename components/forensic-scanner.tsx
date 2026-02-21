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
}) {
  const { t, locale } = useI18n()
  const [phase, setPhase] = useState<ScanPhase>("idle")
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [scanStepIndex, setScanStepIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scanStepKeys = ["scanner.step1", "scanner.step2", "scanner.step3"]

  // Update phase when isLoading changes externally
  useEffect(() => {
    if (isLoading) {
      setPhase("analyzing")

      // Granular step logic
      if (analysisResult?.summary_ru || analysisResult?.summary_kz) {
        setScanStepIndex(2) // Final summary step
      } else if (analysisResult?.violations && analysisResult.violations.length > 0) {
        setScanStepIndex(1) // Middle step
      } else {
        setScanStepIndex(0) // First step (still connecting/initial analysis)
      }
    }

    if (!isLoading && analysisResult) {
      console.log("[Scanner] Loading complete.")
      setPhase("complete")
      setScanStepIndex(3)
    }

    if (error) {
      console.error("[Scanner] Error encountered:", error)
      setPhase("error")
      setErrorMessage(error.message || "AI API Error")
    }
  }, [isLoading, analysisResult, error])

  const startScan = useCallback(
    async (file: File) => {
      console.log("[Scanner] startScan for:", file.name)

      const ext = file.name.split(".").pop()?.toLowerCase()
      const isSupported = ext === "pdf" || ext === "docx" || ext === "txt"

      if (!isSupported) {
        setPhase("error")
        setErrorMessage(locale === "kz" ? "Қолдау көрсетілмейтін файл форматы. PDF немесе DOCX жүктеңіз." : "Неподдерживаемый формат файла. Пожалуйста, используйте PDF или DOCX.")
        return
      }

      setFileName(file.name)
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
                  ? "border-cyan-glow/40 text-cyan-glow bg-cyan-glow/5"
                  : phase === "complete"
                    ? "border-primary/40 text-primary bg-primary/5 shadow-[0_0_10px_rgba(0,180,216,0.1)]"
                    : "border-destructive/40 text-destructive bg-destructive/5"
              )}
            >
              {isScanning
                ? (locale === "kz" ? "ЗЕРТТЕЛУДЕ" : "ИССЛЕДУЕТСЯ")
                : phase === "complete"
                  ? (locale === "kz" ? (isCached ? "КЭШТЕЛГЕН" : "ТАЛДАНДЫ") : (isCached ? "ИЗ КЭША" : "ПРОАНАЛИЗИРОВАНО"))
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
              {locale === "kz" ? "Қайта" : "Заново"}
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
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 px-8 transition-all duration-300",
            dragOver
              ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,180,216,0.1)]"
              : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-primary/5"
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
        <div className="flex flex-col items-center gap-6 rounded-xl border border-cyan-glow/20 bg-cyan-glow/[0.02] p-8">
          {/* Animated scanner visual */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-glow/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-cyan-glow/20 animate-pulse" />
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-primary">
              {t("scanner.processing")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">{fileName}</p>
          </div>

          {/* Step indicators */}
          <div className="w-full max-w-sm flex flex-col gap-3">
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
            <p className="text-sm font-semibold text-destructive">
              {locale === "kz" ? "Талдау қатесі" : "Ошибка анализа"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            {locale === "kz" ? "Қайталау" : "Повторить"}
          </Button>
        </div>
      )}

      {/* Results Phase */}
      {phase === "complete" && analysisResult && (
        <div className="flex flex-col gap-6">
          {/* Risk Gauge Hero */}
          <div className="rounded-2xl border border-red-glow/10 bg-gradient-to-b from-red-glow/[0.05] to-transparent p-6 md:p-10 shadow-[inset_0_0_60px_rgba(239,68,68,0.05)]">
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

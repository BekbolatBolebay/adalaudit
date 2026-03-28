"use client"

import { useI18n } from "@/lib/i18n"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileSearch, Languages, Loader2, Copy, Check, Download } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { TranslationResult, HighlightSpan } from "@/lib/types"

export function ForensicComparison({
  translationResult,
  isLoading,
}: {
  translationResult: TranslationResult | null
  isLoading: boolean
}) {
  const { t } = useI18n()
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedTranslation, setCopiedTranslation] = useState(false)

  const handleCopy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getHighlightSpans = (text: string, violations: any[]): HighlightSpan[] => {
    if (!text) return []
    if (!violations || violations.length === 0) {
      return [{ text, type: "normal", tooltip: null }]
    }

    // Sort violations by their occurrence in the text to process them sequentially
    const sortedViolations = [...violations]
      .filter(v => v.fragment)
      .map(v => ({
        ...v,
        index: text.indexOf(v.fragment)
      }))
      .filter(v => v.index !== -1)
      .sort((a, b) => a.index - b.index)

    const spans: HighlightSpan[] = []
    let lastIndex = 0

    for (const v of sortedViolations) {
      // Add normal text before the violation
      if (v.index > lastIndex) {
        spans.push({
          text: text.substring(lastIndex, v.index),
          type: "normal",
          tooltip: null
        })
      }

      // Add the violation fragment
      spans.push({
        text: v.fragment,
        type: v.type as "violation" | "warning",
        tooltip: v.tooltip
      })

      lastIndex = v.index + v.fragment.length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      spans.push({
        text: text.substring(lastIndex),
        type: "normal",
        tooltip: null
      })
    }

    return spans
  }

  const originalText = translationResult?.original_text || ""
  const violationSpans = getHighlightSpans(originalText, translationResult?.violations || [])
  const translatedText = translationResult?.translated_kz || ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-sm md:text-base font-semibold text-foreground">
          {t("forensic.title")}
        </h2>
        <Badge
          variant="outline"
          className="w-fit border-primary/20 text-primary bg-primary/5 text-[9px] md:text-[10px] font-mono tracking-wider"
        >
          AI LEGAL TRANSLATION
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original (RU) Panel */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 md:px-4 py-2 bg-secondary/30">
            <div className="flex items-center gap-2 shrink-0">
              <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs font-semibold text-foreground">
                {t("forensic.original")}
              </span>
            </div>
            {translationResult && (
              <div className="flex items-center gap-1 ml-auto">
                <Badge className="bg-red-glow/10 text-red-glow border border-red-glow/30 text-[8px] md:text-[9px] font-mono whitespace-nowrap">
                  {(translationResult.violation_count || 0)} VIOLATIONS
                </Badge>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(originalText, setCopiedOriginal)}
                  >
                    {copiedOriginal ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDownload(originalText, "original.txt")}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <ScrollArea className="h-[500px]">
            {isLoading && !translationResult?.original_text ? (
              <LoadingState text="ADAL AI EXPERT" subtitle="Analyzing original text..." />
            ) : translationResult?.original_text ? (
              <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {violationSpans.map(
                  (span: HighlightSpan, i: number) => {
                    if (span.type === "violation") {
                      return (
                        <span
                          key={i}
                          className="relative bg-red-glow/15 text-red-glow border-b-2 border-red-glow/50 px-0.5 rounded-sm cursor-help"
                          title={span.tooltip || undefined}
                        >
                          {span.text}
                        </span>
                      )
                    }
                    if (span.type === "warning") {
                      return (
                        <span
                          key={i}
                          className="relative bg-orange-500/15 text-orange-400 border-b-2 border-orange-500/50 px-0.5 rounded-sm cursor-help"
                          title={span.tooltip || undefined}
                        >
                          {span.text}
                        </span>
                      )
                    }
                    return (
                      <span key={i} className="text-secondary-foreground">
                        {span.text}
                      </span>
                    )
                  }
                )}
              </div>
            ) : (
              <LoadingState
                text={t("forensic.original")}
                subtitle="Waiting for data..."
              />
            )}
          </ScrollArea>
        </div>

        {/* Translation (KZ) Panel */}
        <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 md:px-4 py-2 bg-primary/5">
            <div className="flex items-center gap-2 shrink-0">
              <Languages className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] md:text-xs font-semibold text-foreground">
                {t("forensic.translated")}
              </span>
            </div>
            {translationResult && (
              <div className="flex items-center gap-1 ml-auto">
                <Badge className="bg-primary/5 text-primary border border-primary/20 text-[8px] md:text-[9px] font-mono whitespace-nowrap">
                  AI LEGAL KZ
                </Badge>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(translatedText, setCopiedTranslation)}
                  >
                    {copiedTranslation ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDownload(translatedText, "translated.txt")}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <ScrollArea className="h-[500px]">
            {isLoading && !translationResult?.translated_kz ? (
              <LoadingState
                text="ADAL AI EXPERT"
                subtitle="Generating legal translation..."
              />
            ) : translationResult?.translated_kz ? (
              <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {translationResult.translated_kz.split("\n").map((line, i) => {
                  if (!line) return <br key={i} />
                  if (line.includes("[!]")) {
                    return (
                      <span key={i}>
                        <span className="text-red-glow font-semibold bg-red-glow/10 px-1 rounded-sm">
                          {line}
                        </span>
                        {"\n"}
                      </span>
                    )
                  }
                  return (
                    <span key={i}>
                      {line}
                      {"\n"}
                    </span>
                  )
                })}
              </div>
            ) : (
              <LoadingState
                text={t("forensic.translation")}
                subtitle="Waiting for data..."
              />
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function LoadingState({ text, subtitle }: { text: string; subtitle: string }) {
  const label = text === "ADAL AI EXPERT"
    ? "ADAL AI EXPERT"
    : text

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-6 w-6 text-primary animate-spin" />
      <div className="text-center">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest animate-pulse">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

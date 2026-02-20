"use client"

import { useI18n } from "@/lib/i18n"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileSearch, Languages, Loader2 } from "lucide-react"
import type { TranslationResult, HighlightSpan } from "@/lib/types"

export function ForensicComparison({
  translationResult,
  isLoading,
}: {
  translationResult: TranslationResult | null
  isLoading: boolean
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {t("forensic.title")}
        </h2>
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/5 text-[10px] font-mono tracking-wider"
        >
          AI LEGAL TRANSLATION
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original (RU) Panel */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-secondary/30">
            <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {t("forensic.original")}
            </span>
            {translationResult && (
              <Badge className="ml-auto bg-red-glow/10 text-red-glow border border-red-glow/30 text-[9px] font-mono">
                {translationResult.violation_count} VIOLATIONS
              </Badge>
            )}
          </div>
          <ScrollArea className="h-[360px]">
            {isLoading ? (
              <LoadingState text="Gemini 2.5 Flash" subtitle="Analyzing original text..." />
            ) : translationResult?.original_highlighted ? (
              <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {translationResult.original_highlighted.map(
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
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-primary/[0.03]">
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {t("forensic.translation")}
            </span>
            <Badge className="ml-auto bg-primary/10 text-primary border border-primary/30 text-[9px] font-mono">
              AI LEGAL KZ
            </Badge>
          </div>
          <ScrollArea className="h-[360px]">
            {isLoading ? (
              <LoadingState
                text="Gemini 2.5 Flash"
                subtitle="Generating legal translation..."
              />
            ) : translationResult?.translated_kz ? (
              <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-secondary-foreground">
                {translationResult.translated_kz.split("\n").map((line, i) => {
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
  const label = text === "Gemini 2.5 Flash"
    ? "Gemini 2.5 Flash"
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

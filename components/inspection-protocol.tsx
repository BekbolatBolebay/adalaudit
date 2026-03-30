"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileDown,
  FileText,
  Clock,
  MapPin,
  Target,
  Scale,
  Search,
  Loader2,
} from "lucide-react"
import type { ProtocolData } from "@/lib/types"

export function InspectionProtocol({
  protocolData,
  isLoading,
}: {
  protocolData: ProtocolData | null
  isLoading: boolean
}) {
  const { locale, t } = useI18n()

  const handleExport = () => {
    if (!protocolData) return

    const isKz = locale === "kz"
    const place = isKz ? protocolData.place_kz : protocolData.place_ru
    const objective = isKz ? protocolData.objective_kz : protocolData.objective_ru
    const evidence = isKz ? protocolData.evidence_kz : protocolData.evidence_ru
    const legalRef = isKz ? protocolData.legal_ref_kz : protocolData.legal_ref_ru

    const content = `${t("protocol.title")}
${"=".repeat(50)}

${t("protocol.time")}: ${protocolData.time}
${t("protocol.place")}: ${place}

${t("protocol.objective")}:
${objective}

${t("protocol.evidence")}:
${evidence.map((e, i) => `${i + 1}. ${e}`).join("\n\n")}

${t("protocol.legal")}:
${legalRef}

${t("protocol.investigator")}: ${protocolData.investigator}

${"_".repeat(50)}
${t("protocol.signature")}: ________________    ${t("protocol.date")}: ________________`

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `protocol_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {t("protocol.title")}
          </h2>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-12 flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest animate-pulse">
              ADAL AI EXPERT
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {t("protocol.loading")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!protocolData) return null

  const isKz = locale === "kz"
  const place = isKz ? protocolData.place_kz : protocolData.place_ru
  const objective = isKz ? protocolData.objective_kz : protocolData.objective_ru
  const evidence = isKz ? protocolData.evidence_kz : protocolData.evidence_ru
  const legalRef = isKz ? protocolData.legal_ref_kz : protocolData.legal_ref_ru

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {t("protocol.title")}
        </h2>
        <Button
          size="sm"
          onClick={handleExport}
          className="h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
        >
          <FileDown className="h-3.5 w-3.5" />
          {t("protocol.export")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Protocol header bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-secondary/30">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            {t("protocol.project")}
          </span>
          <Badge className="ml-auto bg-primary/10 text-primary border border-primary/30 text-[9px] font-mono">
            AI GENERATED
          </Badge>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Time */}
          <ProtocolField
            icon={<Clock className="h-3.5 w-3.5" />}
            label={t("protocol.time")}
            value={protocolData.time}
          />

          {/* Place */}
          <ProtocolField
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={t("protocol.place")}
            value={place}
          />

          {/* Objective */}
          <ProtocolField
            icon={<Target className="h-3.5 w-3.5" />}
            label={t("protocol.objective")}
            value={objective}
          />

          {/* Evidence */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Search className="h-3.5 w-3.5 text-primary" />
              {t("protocol.evidence")}
            </div>
            <div className="flex flex-col gap-2 pl-5">
              {evidence.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2"
                >
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-glow/10 text-[10px] font-mono font-bold text-red-glow">
                    {i + 1}
                  </span>
                  <p className="text-xs text-secondary-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Reference */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Scale className="h-3.5 w-3.5 text-primary" />
              {t("protocol.legal")}
            </div>
            <p className="pl-5 text-xs text-red-glow font-medium leading-relaxed bg-red-glow/5 border border-red-glow/20 rounded-lg px-3 py-2">
              {legalRef}
            </p>
          </div>

          {/* Signature */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t("protocol.investigator")}
              </span>
              <span className="text-xs font-medium text-foreground">
                {protocolData.investigator}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t("protocol.signature")}
              </span>
              <span className="text-xs text-muted-foreground/50 border-b border-dashed border-muted-foreground/30 w-20 md:w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProtocolField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="pl-5 text-xs text-secondary-foreground leading-relaxed">
        {value}
      </p>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Building2, AlertCircle } from "lucide-react"
import { CompanyRiskProfile } from "./company-risk-profile"
import type { CompanyIntelligence } from "@/lib/types"

export function CompanySearch() {
  const { t } = useI18n()
  const [bin, setBin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompanyIntelligence | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!bin || bin.length !== 12) {
      setError(t("business.error.bin_length"))
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/company/${bin}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Іздеу кезінде қате кетті")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pt-4">
      {/* Search Header */}
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("business.title")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {t("business.desc")}
        </p>
      </div>

      {/* Search Bar */}
      <form 
        onSubmit={handleSearch}
        className="relative group max-w-xl mx-auto w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex items-center gap-2 p-2 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl">
          <div className="pl-3 text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <Input
            value={bin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 12)
              setBin(val)
              setError(null)
            }}
            placeholder={t("business.search.placeholder")}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            disabled={isLoading || bin.length !== 12}
            onClick={() => handleSearch()}
            className="h-11 px-6 rounded-xl gap-2 font-bold shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {t("business.search.button")}
          </Button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg text-xs mx-auto animate-in fade-in zoom-in-95">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Results Section */}
      <div className="w-full">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs font-mono text-primary uppercase tracking-[0.3em]">
              Scanning Registry DB...
            </p>
          </div>
        ) : (
          result && <CompanyRiskProfile data={result} />
        )}
      </div>

      {!result && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="p-6 rounded-2xl border border-dashed border-border bg-secondary/5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Пример БИН (Риск)</h3>
            <p className="text-lg font-mono text-foreground font-bold">240140001234</p>
            <p className="text-[10px] text-muted-foreground mt-1">Новая компания (2024), малый штат</p>
          </div>
          <div className="p-6 rounded-2xl border border-dashed border-border bg-secondary/5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Пример БИН (Надежный)</h3>
            <p className="text-lg font-mono text-foreground font-bold">080740005678</p>
            <p className="text-[10px] text-muted-foreground mt-1">Старая компания, прозрачная история</p>
          </div>
        </div>
      )}
    </div>
  )
}

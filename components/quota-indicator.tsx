"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/lib/i18n"
import { Cpu, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export function QuotaIndicator() {
    const { t } = useI18n()
    const [usage, setUsage] = useState({ used: 0, limit: 1500 })

    useEffect(() => {
        const updateUsage = () => {
            const index = JSON.parse(localStorage.getItem("cases_history_index") || "[]")
            let totalTokens = 0
            index.forEach((key: string) => {
                const data = localStorage.getItem(key)
                if (data) {
                    const parsed = JSON.parse(data)
                    totalTokens += parsed.tokens || 0
                }
            })
            // Convert tokens to a rough estimate of "request units" or just show total tokens
            // For now, let's show total tokens used this session/stored in history
            setUsage(prev => ({ ...prev, used: totalTokens }))
        }

        updateUsage()
        window.addEventListener("storage", updateUsage)
        const interval = setInterval(updateUsage, 5000)

        return () => {
            window.removeEventListener("storage", updateUsage)
            clearInterval(interval)
        }
    }, [])

    const percentage = Math.min((usage.used / 500000) * 100, 100) // 500k tokens as a daily "soft" limit for free tier Gemini

    return (
        <Card className="bg-primary/5 border-primary/10 overflow-hidden">
            <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t("tracking.tokens")}
                        </span>
                    </div>
                    <Zap className="w-3 h-3 text-warning animate-pulse" />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-primary font-bold">{usage.used.toLocaleString()}</span>
                        <span className="text-muted-foreground/50">/ 500,000</span>
                    </div>
                    <Progress value={percentage} className="h-1 bg-primary/10" />
                </div>

                <p className="text-[9px] text-muted-foreground leading-tight italic">
                    {t("quota.estimation_note") || "Болжамды мән"}
                </p>
            </CardContent>
        </Card>
    )
}

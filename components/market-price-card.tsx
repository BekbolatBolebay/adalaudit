"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface MarketSource {
    title: string
    link: string
    price: number
}

interface MarketAnalysis {
    product_name: string
    tender_price: number
    market_price: number
    markup_percent: number
    total_loss: number
    is_overpriced: boolean
    sources: MarketSource[]
    comment_ru?: string
    comment_kz?: string
}

export function MarketPriceCard({ data }: { data: MarketAnalysis | any }) {
    const { t, locale } = useI18n()

    if (!data || data.error) return null

    const formatter = new Intl.NumberFormat(locale === "kz" ? "kk-KZ" : "ru-RU", {
        style: "currency",
        currency: "KZT",
        maximumFractionDigits: 0
    })

    return (
        <Card className="border-primary/20 bg-primary/[0.02] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-4 w-4", data.is_overpriced ? "text-red-500" : "text-green-500")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                        {locale === "kz" ? "НАРЫҚТЫҚ ТАЛДАУ" : "РЫНОЧНЫЙ АНАЛИЗ"}
                    </span>
                </div>
                <Badge variant="outline" className={cn(
                    "text-[9px] font-mono",
                    data.is_overpriced ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-green-500/30 text-green-500 bg-green-500/5"
                )}>
                    {data.is_overpriced
                        ? (locale === "kz" ? "БАҒА АСЫРА КӨРСЕТІЛГЕН" : "ЦЕНА ЗАВЫШЕНА")
                        : (locale === "kz" ? "НАРЫҚТЫҚ БАҒА" : "РЫНОЧНАЯ ЦЕНА")}
                </Badge>
            </div>

            <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase">{locale === "kz" ? "Құжаттағы баға" : "Цена в документе"}</span>
                        <p className="text-lg font-bold tabular-nums">{formatter.format(data.tender_price)}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase">{locale === "kz" ? "Нарықтық орташа" : "Среднерыночная"}</span>
                        <p className="text-lg font-bold text-primary tabular-nums">{formatter.format(data.market_price)}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tight">
                        <span>{locale === "kz" ? "Асыра көрсету" : "Превышение"}</span>
                        <span className={cn(data.is_overpriced ? "text-red-500" : "text-green-500")}>
                            {data.markup_percent > 0 ? `+${data.markup_percent}%` : `${data.markup_percent}%`}
                        </span>
                    </div>
                    <Progress value={Math.min(data.markup_percent, 100)} className="h-1.5 [&>div]:bg-primary" />
                </div>

                {data.total_loss > 0 && (
                    <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 flex items-start gap-3">
                        <TrendingUp className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                {locale === "kz" ? "Болжамды шығын" : "Потенциальный ущерб"}
                            </p>
                            <p className="text-sm font-bold text-red-700">{formatter.format(data.total_loss)}</p>
                        </div>
                    </div>
                )}

                {(data.comment_ru || data.comment_kz || data.comment) && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground italic leading-relaxed">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                        <p>{locale === "kz" ? (data.comment_kz || data.comment) : (data.comment_ru || data.comment)}</p>
                    </div>
                )}

                <div className="pt-2">
                    <span className="text-[10px] text-muted-foreground uppercase mb-2 block tracking-wider">
                        {locale === "kz" ? "Дереккөздер (TOP 3)" : "Источники данных (ТОП-3)"}
                    </span>
                    <div className="space-y-1.5">
                        {data.sources?.map((src: any, i: number) => (
                            <a
                                key={i}
                                href={src.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded border border-border bg-background hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                                    <span className="text-[10px] truncate max-w-[150px] font-medium">{src.title}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-primary">{formatter.format(src.price)}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

"use client"

import { TrendingUp, AlertCircle, ShoppingCart, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MarketAnalysis } from "@/lib/types"

interface MarketAnalysisCardProps {
    data: MarketAnalysis
    locale: "ru" | "kz"
}

export function MarketAnalysisCard({ data, locale }: MarketAnalysisCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(locale === "kz" ? "kk-KZ" : "ru-RU", {
            style: "currency",
            currency: "KZT",
            maximumFractionDigits: 0,
        }).format(price)
    }

    const isCritical = data.markup_percent > 20

    return (
        <div className={cn(
            "overflow-hidden rounded-xl border transition-all duration-500",
            isCritical
                ? "border-red-glow/30 bg-red-glow/[0.03] shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                : "border-primary/20 bg-primary/[0.02]"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-secondary/20">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">
                        {locale === "kz" ? "Нарықтық бағаны талдау" : "Анализ рыночных цен"}
                    </h3>
                </div>
                {isCritical && (
                    <Badge variant="destructive" className="animate-pulse font-mono text-[9px] tracking-tighter uppercase px-1.5 h-5 border-red-glow/50 bg-red-500">
                        {locale === "kz" ? "ЖЫМҚЫРУ ҚАУПІ" : "РИСК ХИЩЕНИЯ"}
                    </Badge>
                )}
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Product Name */}
                <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {locale === "kz" ? "Тауар атауы" : "Наименование товара"}
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                        {data.product_name}
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {locale === "kz" ? "Тендерлік баға" : "Тендерная цена"}
                        </p>
                        <p className="text-base font-bold text-foreground tabular-nums">
                            {formatPrice(data.tender_price)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {locale === "kz" ? "Нарықтық орташа баға" : "Рыночная цена"}
                        </p>
                        <p className="text-base font-bold text-primary tabular-nums">
                            {formatPrice(data.market_price)}
                        </p>
                    </div>
                </div>

                {/* Quantity & Total Loss */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {locale === "kz" ? "Саны (дана)" : "Количество (шт)"}
                        </p>
                        <p className="text-sm font-bold text-foreground tabular-nums">
                            {data.quantity || 0}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {locale === "kz" ? "Бюджет шығыны (болжам)" : "Потеря бюджета (прогноз)"}
                        </p>
                        <p className={cn(
                            "text-sm font-black tabular-nums",
                            data.total_loss > 0 ? "text-red-glow" : "text-green-500"
                        )}>
                            {formatPrice(data.total_loss || 0)}
                        </p>
                    </div>
                </div>

                {/* Overpricing Alert */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className={cn("h-4 w-4", isCritical ? "text-red-glow" : "text-yellow-500")} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                {locale === "kz" ? "Бағаның асып кетуі" : "Превышение цены"}
                            </span>
                        </div>
                        <span className={cn("text-xs font-black font-mono", isCritical ? "text-red-glow" : "text-yellow-500")}>
                            +{data.markup_percent.toFixed(1)}%
                        </span>
                    </div>

                    <Progress
                        value={Math.min(data.markup_percent, 100)}
                        className="h-2"
                        indicatorClassName={isCritical ? "bg-red-glow" : "bg-yellow-500"}
                    />

                    {data.total_loss > 0 ? (
                        <div className="flex gap-2 rounded-lg border border-red-glow/20 bg-red-glow/5 p-2 mt-2">
                            <AlertCircle className="h-4 w-4 text-red-glow shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-red-glow leading-tight uppercase">
                                    {locale === "kz" ? "ЖЫМҚЫРУ ҚАУПІ АНЫҚТАЛДЫ" : "ОБНАРУЖЕН РИСК ХИЩЕНИЯ"}
                                </p>
                                <p className="text-[9px] font-medium text-red-glow/80 leading-snug">
                                    {locale === "kz"
                                        ? `Бұл сатып алуда мемлекеттік бюджеттен ${formatPrice(data.total_loss)} артық төленуі мүмкін.`
                                        : `В данной закупке возможна переплата из госбюджета на сумму ${formatPrice(data.total_loss)}.`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-2 mt-2">
                            <Info className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium text-green-500 leading-snug">
                                {locale === "kz"
                                    ? "Баға нарықтық диапазонға сәйкес келеді. Заң бұзушылық белгілері жоқ."
                                    : "Цена соответствует рыночному диапазону. Признаков нарушений не обнаружено."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

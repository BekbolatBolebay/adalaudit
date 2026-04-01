"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, TrendingUp, Wallet, Truck, Percent } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProfitCalculator() {
  const { t } = useI18n()
  const [amount, setAmount] = useState<number>(1000000)
  const [cost, setCost] = useState<number>(700000)
  const [delivery, setDelivery] = useState<number>(50000)

  const tax = useMemo(() => amount * 0.03, [amount])
  const totalExpenses = useMemo(() => cost + delivery + tax, [cost, delivery, tax])
  const profit = useMemo(() => amount - totalExpenses, [amount, totalExpenses])
  const roi = useMemo(() => (profit / (cost + delivery)) * 100, [profit, cost, delivery])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Inputs */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            {t("starter.calc.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {t("starter.calc.amount")} (₸)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-8 font-mono font-bold"
              />
              <Wallet className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {t("starter.calc.cost")} (₸)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="pl-8 font-mono font-bold"
              />
              <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {t("starter.calc.delivery")} (₸)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={delivery}
                onChange={(e) => setDelivery(Number(e.target.value))}
                className="pl-8 font-mono font-bold"
              />
              <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex flex-col gap-4">
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-24 w-24" />
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-primary/70">
            {t("starter.calc.profit")}
          </span>
          <span className="text-3xl font-black tracking-tighter text-foreground">
            {profit.toLocaleString()} ₸
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{t("starter.calc.tax")}</span>
            <span className="text-[10px] font-mono font-bold text-destructive">-{tax.toLocaleString()} ₸</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-green-600/70">
            {t("starter.calc.roi")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tighter text-green-600">
              {roi.toFixed(1)}%
            </span>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              roi > 20 ? "bg-green-500/20 text-green-700" : "bg-orange-500/20 text-orange-700"
            )}>
              {roi > 20 ? "High Efficiency" : "Low Margin"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
             <div 
               className={cn("h-full transition-all duration-1000", roi > 20 ? "bg-green-500" : "bg-orange-500")}
               style={{ width: `${Math.min(roi * 2, 100)}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  )
}

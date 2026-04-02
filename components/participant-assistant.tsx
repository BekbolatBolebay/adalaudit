"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calculator,
    Clock,
    ClipboardCheck,
    Lightbulb,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    Wallet,
    Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantAssistantProps {
    tenderAmount: number
    tenderTitle?: string
    tenderType?: "open" | "price" | "auction"
    deadline?: string
}

export function ParticipantAssistant({
    tenderAmount: initialAmount,
    tenderTitle,
    tenderType = "open",
    deadline = "2024-12-31"
}: ParticipantAssistantProps) {
    const { t } = useI18n()
    const [amount, setAmount] = useState(initialAmount)
    const [cost, setCost] = useState(initialAmount * 0.7) // Default 70% cost
    const [delivery, setDelivery] = useState(initialAmount * 0.05) // Default 5% delivery

    // Financial Calculations
    const bidGuarantee = useMemo(() => amount * 0.01, [amount])
    const perfGuarantee = useMemo(() => amount * 0.03, [amount])
    const workingCapital = useMemo(() => cost + delivery, [cost, delivery])
    const totalRequired = useMemo(() => bidGuarantee + perfGuarantee + workingCapital, [bidGuarantee, perfGuarantee, workingCapital])

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">{t("assistant.title")}</h2>
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                    {tenderTitle || "Тендер бойынша жеке көмекші және қаржылық жоспар"}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Financial Runway */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-primary/20 bg-secondary/5 backdrop-blur-md overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Wallet className="h-32 w-32" />
                        </div>
                        <CardHeader className="border-b border-primary/10 pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                {t("assistant.financials.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">{t("starter.calc.amount")} (₸)</Label>
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="font-mono font-bold text-lg bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">{t("assistant.financials.product_cost")} (₸)</Label>
                                        <Input
                                            type="number"
                                            value={cost}
                                            onChange={(e) => setCost(Number(e.target.value))}
                                            className="font-mono font-bold bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">{t("starter.calc.delivery")} (₸)</Label>
                                        <Input
                                            type="number"
                                            value={delivery}
                                            onChange={(e) => setDelivery(Number(e.target.value))}
                                            className="font-mono font-bold bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between">
                                    <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 space-y-2 group transition-all hover:scale-[1.02]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t("assistant.financials.total")}</p>
                                        <p className="text-3xl font-black tracking-tighter">
                                            {totalRequired.toLocaleString()} ₸
                                        </p>
                                        <div className="pt-2 flex items-center gap-2">
                                            <Info className="h-3 w-3 opacity-60" />
                                            <span className="text-[8px] uppercase tracking-wider font-bold">Бұл тендерге кіру үшін қажетті минималды капитал</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("assistant.financials.bid_guarantee")}</span>
                                            <span className="text-xs font-mono font-bold">{bidGuarantee.toLocaleString()} ₸</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("assistant.financials.perf_guarantee")}</span>
                                            <span className="text-xs font-mono font-bold">{perfGuarantee.toLocaleString()} ₸</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("assistant.financials.working_capital")}</span>
                                            <span className="text-xs font-mono font-bold">{workingCapital.toLocaleString()} ₸</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Status Tracker */}
                    <Card className="border-border/40 bg-card/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                {t("assistant.status.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="relative flex justify-between gap-4 mb-8">
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-background ring-4 ring-emerald-500/10">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t("assistant.status.published")}</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center border-4 border-background ring-4 ring-primary/10 animate-pulse">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t("assistant.status.submitting")}</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 text-center opacity-40">
                                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center border-4 border-background">
                                        <ClipboardCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("assistant.status.review")}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-orange-600">{t("assistant.status.deadline")}</p>
                                        <p className="text-sm font-bold">{deadline} (18:00)</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-black border-orange-200 text-orange-700 bg-orange-100">
                                    5 КҮН ҚАЛДЫ
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI & Checklist */}
                <div className="space-y-6">
                    {/* 3. Smart Checklist */}
                    <Card className="border-border shadow-sm">
                        <CardHeader className="bg-secondary/10 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-primary" />
                                {t("assistant.checklist.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/20 transition-colors group cursor-pointer">
                                <div className="h-5 w-5 rounded-md border-2 border-primary/20 flex items-center justify-center group-hover:border-primary transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[11px] font-medium">{t("assistant.checklist.docs")}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/20 transition-colors group cursor-pointer">
                                <div className="h-5 w-5 rounded-md border-2 border-primary/20 flex items-center justify-center group-hover:border-primary transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary opacity-100" />
                                </div>
                                <span className="text-[11px] font-medium">{t("assistant.checklist.technical")}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/20 transition-colors group cursor-pointer">
                                <div className="h-5 w-5 rounded-md border-2 border-primary/20 flex items-center justify-center group-hover:border-primary transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100" />
                                </div>
                                <span className="text-[11px] font-medium">{t("assistant.checklist.experience")}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. AI Advice */}
                    <Card className="border-primary/10 bg-primary/5 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                            <Lightbulb className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                                <Lightbulb className="h-4 w-4" />
                                {t("assistant.advice.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <div className="p-3 rounded-xl bg-background/50 border border-primary/10">
                                <p className="text-[10px] leading-relaxed italic text-muted-foreground">
                                    "Бұл тендерде баға маңызды, бірақ сертификаттарды дұрыс жүктегеніңізге көз жеткізіңіз. Үлкен көлемдегі тауар үшін логистиканы алдын ала келісіңіз."
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-[10px] font-bold h-8 group">
                                ТОЛЫҚ ТАЛДАУ
                                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

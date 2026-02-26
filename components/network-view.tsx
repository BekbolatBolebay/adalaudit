"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import {
    Users,
    MapPin,
    Repeat,
    Share2,
    ShieldAlert,
    TrendingUp,
    BarChart3,
    FileText,
    Search,
    ExternalLink,
    ChevronRight
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell
} from "recharts"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet"

const barData = [
    { name: "ТОО 'Build-KZ'", wins: 45, frequent: true },
    { name: "ИП 'Ахметов'", wins: 32 },
    { name: "ТОО 'Snab-KZ'", wins: 28 },
    { name: "ТОО 'Logistic'", wins: 22 },
    { name: "ПК 'Жан'", wins: 18 }
]

const lineData = [
    { year: "2022", amount: 4500000 },
    { year: "2023", amount: 6800000 },
    { year: "2024", amount: 8200000 },
    { year: "2025", amount: 9500000 }
]

export function NetworkView() {
    const { t, locale } = useI18n()
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [evidenceOpen, setEvidenceOpen] = useState(false)
    const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
    const [bin, setBin] = useState("")

    const handleSearch = () => {
        if (!bin || bin.length < 12) return
        setIsSearching(true)
        setTimeout(() => {
            setIsSearching(false)
            setShowResults(true)
        }, 1500)
    }

    const openEvidence = (type: string) => {
        const evidences: any = {
            founders: {
                title: t("network.card.founders"),
                quote: "Учредитель ТОО 'A' (Ахметов Б.С.) также является бенефициаром ТОО 'B'.",
                date: "12.01.2024",
                amount: "150,000,000 KZT",
                source: "Egov / Stats.gov.kz",
                confidence: 98
            },
            address: {
                title: t("network.card.address"),
                quote: "Обе компании зарегистрированы по адресу: г. Алматы, пр. Абая, 150, оф. 4.",
                date: "Н/Д",
                amount: "Н/Д",
                source: "Юридический реестр",
                confidence: 100
            }
        }
        setSelectedEvidence(evidences[type] || evidences.founders)
        setEvidenceOpen(true)
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t("network.title")}</h2>
                    <p className="text-sm text-muted-foreground">Система выявления скрытых аффилированностей и картельных соглашений</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <Card className="lg:col-span-1 border-primary/10 bg-secondary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                        <Search className="w-12 h-12" />
                    </div>
                    <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider">{t("network.title")}</CardTitle>
                        <CardDescription className="text-[10px]">Поиск по государственным базам данных РК</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">{t("network.form.customer")}</Label>
                            <Input placeholder="ГУ 'Управление...'" className="bg-background text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">{t("network.form.winner")}</Label>
                            <Input placeholder="ТОО '...'" className="bg-background text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs flex items-center justify-between">
                                {t("network.form.bin")}
                                <span className="text-[8px] text-red-500 font-bold uppercase tracking-widest">Required</span>
                            </Label>
                            <Input
                                placeholder="123456789012"
                                className={cn("bg-background text-sm font-mono", bin.length > 0 && bin.length < 12 && "border-red-500 focus-visible:ring-red-500")}
                                value={bin}
                                onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            />
                            {bin.length > 0 && bin.length < 12 && (
                                <p className="text-[8px] text-red-500 font-bold">БИН должен состоять из 12 цифр</p>
                            )}
                        </div>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-sm font-bold gap-2 py-6 transition-all"
                            onClick={handleSearch}
                            disabled={isSearching || bin.length < 12}
                        >
                            {isSearching ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            {t("network.form.submit")}
                        </Button>
                    </CardContent>
                </Card>

                {/* Risk Assessment Result */}
                {showResults && (
                    <Card className="lg:col-span-2 border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-right-4">
                        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                                {t("network.risk.index")}
                            </CardTitle>
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-100 text-[10px] uppercase font-bold tracking-widest">
                                Critical Risk
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative w-32 h-32 shrink-0">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle className="text-muted/20" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                    <circle
                                        className="text-red-500 transition-all duration-1000 ease-out"
                                        strokeWidth="10"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 * (1 - 85 / 100)}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                        transform="rotate(-90 50 50)"
                                    />
                                    <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-foreground">85</text>
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">Высокая вероятность сговора</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    {t("network.risk.explanation")}
                                    Выявлены множественные совпадения по учредителям и аномальная динамика побед в данном регионе.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {showResults && (
                <>
                    {/* Found Connections Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-background hover:border-primary/40 transition-all group overflow-hidden border-border/50">
                            <div className="p-4 space-y-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit">
                                    <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-tight">{t("network.card.founders")}</h4>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">Совпадение по 3 ключевым бенефициарам холдинга.</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold text-blue-600">98% Confidence</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 gap-1" onClick={() => openEvidence('founders')}>
                                        {t("network.card.evidence")}
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-background hover:border-primary/40 transition-all group overflow-hidden border-border/50">
                            <div className="p-4 space-y-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 w-fit">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-tight">{t("network.card.address")}</h4>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">Регистрация в одном офисном помещении (пр. Абая, 150).</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold text-orange-600">100% Match</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 gap-1" onClick={() => openEvidence('address')}>
                                        {t("network.card.evidence")}
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-background hover:border-primary/40 transition-all group overflow-hidden border-border/50">
                            <div className="p-4 space-y-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit">
                                    <Repeat className="w-4 h-4 text-purple-500" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-tight">{t("network.card.repeated")}</h4>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">12 контрактов за 2 года между данными контрагентами.</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold text-purple-600">High Frequency</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 gap-1">
                                        {t("network.card.evidence")}
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-background hover:border-primary/40 transition-all group overflow-hidden border-border/50">
                            <div className="p-4 space-y-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
                                    <Share2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-tight">{t("network.card.related")}</h4>
                                <p className="text-[10px] text-muted-foreground line-clamp-2">Выявлена цепочка из 5 дочерних организаций.</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold text-emerald-600">Network Map</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 gap-1">
                                        {t("network.card.evidence")}
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Historical Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-border/50 bg-secondary/5">
                            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border/10">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        {t("network.charts.frequency")}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={9} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
                                            {barData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.frequent ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.2)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-secondary/5">
                            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border/10">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        {t("network.charts.dynamics")}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="year" fontSize={9} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={9} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("network.stats.total")}</p>
                            <p className="text-2xl font-bold mt-1">1,245</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("network.stats.unique")}</p>
                            <p className="text-2xl font-bold mt-1">86</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("network.stats.frequent")}</p>
                            <p className="text-base font-bold mt-1 truncate">Build-KZ</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("network.stats.average")}</p>
                            <p className="text-2xl font-bold mt-1">4.2M</p>
                        </div>
                    </div>

                    {/* Suspicious Pattern Alert */}
                    <div className="p-4 rounded-xl border-2 border-red-500 bg-red-500/5 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500 text-white">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-600">{t("network.alert.title")}</h4>
                                <p className="text-xs text-red-600/80 mt-0.5">
                                    Данные компании участвовали в 15 тендерах вместе, при этом в 14 случаях одна компания резко снижала цену, а вторая забирала лот по максимальной стоимости.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Evidence Drawer */}
            <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[500px] border-l-primary/10">
                    <SheetHeader className="border-b pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                            <SheetTitle className="text-xl font-bold">{t("network.evidence.title")}</SheetTitle>
                        </div>
                        <SheetDescription className="text-xs uppercase font-bold tracking-widest text-primary/60">
                            Forensic Evidence Record #FE-2024-0812
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-secondary/30 border border-primary/5 space-y-2">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("network.evidence.quote")}</Label>
                                <p className="text-sm font-medium italic leading-relaxed">
                                    "{selectedEvidence?.quote}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("network.evidence.date")}</Label>
                                    <p className="text-sm font-semibold">{selectedEvidence?.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("network.evidence.amount")}</Label>
                                    <p className="text-sm font-semibold text-emerald-600">{selectedEvidence?.amount}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("network.evidence.source")}</Label>
                                    <p className="text-sm font-semibold">{selectedEvidence?.source}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("network.evidence.confidence")}</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${selectedEvidence?.confidence}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-primary">{selectedEvidence?.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-dashed border-primary/20 bg-primary/2">
                            <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ExternalLink className="w-3 h-3" />
                                Официальный реестр
                            </h5>
                            <p className="text-[10px] text-muted-foreground mb-3">
                                Прямая ссылка на запись в государственной базе данных юридических лиц.
                            </p>
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-8 font-bold border-primary/20 hover:bg-primary/5">
                                Перейти к источнику
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

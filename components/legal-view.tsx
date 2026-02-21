"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { mockLegalLibrary } from "@/lib/demo-data"
import { BookOpen, ExternalLink, Scale, Gavel } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function LegalView() {
    const { t, locale } = useI18n()

    return (
        <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
            <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    {t("nav.legal")}
                </CardTitle>
                <CardDescription className="text-xs">
                    ДЭР тергеушілеріне арналған Қазақстан Республикасы заңнамасының жинақтық базасы.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 flex-1 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockLegalLibrary.map((law, idx) => (
                        <Card key={idx} className="bg-secondary/30 border-primary/10 hover:border-primary/30 transition-all group overflow-hidden">
                            <CardHeader className="p-4 pb-2 border-b border-primary/5 bg-primary/5">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-background border border-primary/10">
                                        <Gavel className="w-4 h-4 text-primary" />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => law.link && window.open(law.link, "_blank")}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <CardTitle className="text-sm font-bold mt-3">
                                    {locale === "kz" ? law.title_kz : law.title_ru}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {locale === "kz" ? law.summary_kz : law.summary_ru}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {law.articles.map((art) => (
                                        <Badge key={art} variant="secondary" className="text-[10px] bg-primary/5 border-primary/10 text-primary">
                                            {art}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Placeholder for AI Search */}
                    <Card className="border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-8 text-center md:col-span-2">
                        <BookOpen className="w-8 h-8 text-primary/30 mb-3" />
                        <h3 className="text-sm font-semibold">Нақты норманы іздеу керек пе?</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                            AI Көмекші кез келген заң бабы бойынша жедел ақпарат беруге дайын.
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 text-xs">
                            AI-дан сұрау
                        </Button>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}

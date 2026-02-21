"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { FileText, Calendar, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function HistoryView({ onItemClick }: { onItemClick: (fingerprint: string) => void }) {
    const { t } = useI18n()
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        const index = JSON.parse(localStorage.getItem("cases_history_index") || "[]")
        const items = index.map((key: string) => {
            const data = localStorage.getItem(key)
            if (data) {
                const parsed = JSON.parse(data)
                return {
                    id: key.split("_").slice(-2).join("-"), // Simplified ID from fingerprint
                    fingerprint: key,
                    fileName: parsed.fileName,
                    riskScore: parsed.riskScore,
                    date: new Date(parsed.timestamp).toLocaleDateString(),
                    status: parsed.riskScore > 80 ? "Critical" : "Analyzed",
                }
            }
            return null
        }).filter(Boolean)
        setHistory(items)
    }, [])

    return (
        <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    {t("nav.cases")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-primary/10">
                            <TableHead className="w-[150px] text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Файл</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-center">Тәуекел (Risk)</TableHead>

                            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Күні</TableHead>
                            <TableHead className="text-right text-[11px] uppercase tracking-wider text-muted-foreground">Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs italic">
                                    Талдаулар тарихы бос...
                                </TableCell>
                            </TableRow>
                        ) : history.map((item) => (
                            <TableRow
                                key={item.id}
                                className="border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors group"
                                onClick={() => onItemClick(item.fingerprint)}
                            >
                                <TableCell className="font-mono text-[10px] text-primary/70">{item.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-nowrap max-w-[200px] overflow-hidden">
                                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                        <span className="text-sm font-medium truncate">{item.fileName}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="outline"
                                        className={
                                            item.riskScore > 80 ? "border-destructive/30 bg-destructive/10 text-destructive" :
                                                item.riskScore > 40 ? "border-warning/30 bg-warning/10 text-orange-500" :
                                                    "border-success/30 bg-success/10 text-green-500"
                                        }
                                    >
                                        {item.riskScore}%
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {item.date}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[10px]">
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

"use client"

import { ScanSearch, History, BookOpen, Settings, Share2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const navItems = [
    { key: "nav.scanner", icon: ScanSearch, id: "scanner" },
    { key: "nav.cases", icon: History, id: "cases" },
    { key: "nav.network", icon: Share2, id: "network" },
    { key: "nav.legal", icon: BookOpen, id: "legal" },
    { key: "nav.settings", icon: Settings, id: "settings" },
] as const

type ActiveView = (typeof navItems)[number]["id"]

export function BottomNav({
    activeView,
    onNavigate,
}: {
    activeView: ActiveView
    onNavigate: (view: ActiveView) => void
}) {
    const { t } = useI18n()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-border bg-card px-2 pb-6 md:hidden">
            {navItems.map((item) => {
                const isActive = activeView === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "animate-pulse-glow")} />
                        <span className="text-[10px] font-medium leading-none tracking-tight">
                            {t(item.key)}
                        </span>
                        {isActive && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                        )}
                    </button>
                )
            })}
        </nav>
    )
}

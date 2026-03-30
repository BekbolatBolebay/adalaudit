"use client"

import { ScanSearch, History, BookOpen, Settings, Shield, Share2, Link2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"


const navItems = [
  { key: "nav.scanner", icon: ScanSearch, id: "scanner" },
  { key: "nav.tender_audit", icon: Link2, id: "tender" },
  { key: "nav.cases", icon: History, id: "cases" },
  { key: "nav.network", icon: Share2, id: "network" },
  { key: "nav.legal", icon: BookOpen, id: "legal" },
  { key: "nav.settings", icon: Settings, id: "settings" },
] as const

type ActiveView = (typeof navItems)[number]["id"]

export function AppSidebar({
  activeView,
  onNavigate,
}: {
  activeView: ActiveView
  onNavigate: (view: ActiveView) => void
}) {
  const { t } = useI18n()

  return (
    <aside className="hidden md:flex w-[72px] flex-col items-center border-r border-border bg-sidebar py-6 shrink-0 h-full">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
          <Shield className="h-5 w-5 text-primary" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "group relative flex h-12 w-12 flex-col items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={t(item.key)}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="h-5 w-5" />
              <span className="mt-1 text-[9px] font-medium leading-none tracking-wide">
                {t(item.key)}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-2 w-full flex flex-col items-center gap-4 pb-4">

        <div className="h-px w-8 bg-border" />
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase opacity-50">D.E.R.</span>
      </div>
    </aside>
  )
}

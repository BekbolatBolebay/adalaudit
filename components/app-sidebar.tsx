"use client"

import { ScanSearch, History, BookOpen, Settings, Shield } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const navItems = [
  { key: "nav.scanner", icon: ScanSearch, id: "scanner" },
  { key: "nav.cases", icon: History, id: "cases" },
  { key: "nav.legal", icon: BookOpen, id: "legal" },
  { key: "nav.settings", icon: Settings, id: "settings" },
] as const

type ActiveView = (typeof navItems)[number]["id"]

export function AppSidebar({
  activeView,
  onNavigate,
  isOpen,
}: {
  activeView: ActiveView
  onNavigate: (view: ActiveView) => void
  isOpen?: boolean
}) {
  const { t } = useI18n()

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col items-center border-r border-border bg-sidebar py-6 transition-all duration-300 md:relative md:flex",
      isOpen ? "w-[72px] translate-x-0" : "w-0 -translate-x-full md:w-[72px] md:translate-x-0"
    )}>
      <div className={cn("mb-6 flex items-center justify-center transition-opacity", !isOpen && "md:opacity-100 opacity-0")}>
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
                  ? "bg-primary/15 text-primary shadow-[0_0_12px_rgba(0,180,216,0.15)]"
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

      <div className="mt-auto flex flex-col items-center gap-2 pb-2">
        <div className="h-px w-8 bg-border" />
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">v2.1</span>
      </div>
    </aside>
  )
}

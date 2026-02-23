"use client"

import { Bell, Globe, User, Menu, X, Sun, Moon, Shield } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AppHeader() {
  const { locale, setLocale, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <h1 className="text-sm font-bold tracking-tight text-foreground sm:block hidden">
          ADAL AUDIT
        </h1>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary md:hidden" />
          <Badge
            variant="outline"
            className="border-primary/40 text-primary bg-primary/5 text-[10px] font-mono tracking-wider animate-pulse-glow"
          >
            {locale === "kz" ? "БЕЛСЕНДІ" : "LIVE"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && (
            theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="h-5 w-px bg-border sm:block hidden" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === "ru" ? "kz" : "ru")}
          className="h-8 gap-1 w-8 md:w-auto md:gap-1.5 px-0 md:px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{t("lang.toggle")}</span>
          <span className="md:hidden text-[10px]">{locale === "ru" ? "KZ" : "RU"}</span>
        </Button>

        <div className="h-5 w-px bg-border hidden md:block" />

        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex hidden">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        </button>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground leading-tight">
              {t("user.name")}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {t("user.role")}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

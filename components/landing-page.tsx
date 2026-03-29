"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, ShieldCheck, ArrowRight, Scale, Fingerprint, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, locale, setLocale } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full bg-[#03060b] text-white overflow-hidden flex flex-col items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

      {/* Header / Nav */}
      <header className="fixed top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-background/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-lg">ADAL-AUDIT</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocale(locale === "kz" ? "ru" : "kz")}
            className="text-xs font-mono tracking-widest text-white/60 hover:text-white transition-colors"
          >
            {locale === "kz" ? "RU" : "KZ"}
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-6xl relative z-10 pt-24 pb-16">
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <Badge variant="outline" className="mb-6 px-6 py-1.5 border-primary/30 bg-primary/10 text-primary text-[10px] font-mono tracking-[0.2em] uppercase rounded-full">
            {t("landing.welcome")}
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-[1.1]">
            {t("landing.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("landing.tagline")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg group transition-all"
            >
              {t("landing.cta")}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              100% Offline Forensic Engine
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {[
            { 
              title: t("landing.sov.title"), 
              desc: t("landing.sov.desc"), 
              icon: <Lock className="h-6 w-6 text-blue-500" />,
              badge: "Privacy"
            },
            { 
              title: t("landing.logic.title"), 
              desc: t("landing.logic.desc"), 
              icon: <Fingerprint className="h-6 w-6 text-orange-500" />,
              badge: "ML Engine"
            },
            { 
              title: t("landing.impact.title"), 
              desc: t("landing.impact.desc"), 
              icon: <Scale className="h-6 w-6 text-green-500" />,
              badge: "Compliance"
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-start p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm backdrop-filter hover:bg-white/[0.05] transition-all group">
              <div className="flex justify-between w-full mb-6">
                <div className="bg-white/5 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">{item.badge}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-left text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full p-8 border-t border-white/5 text-center mt-auto">
        <p className="text-[10px] font-mono tracking-widest text-white/20 uppercase">
          {t("landing.footer")}
        </p>
      </footer>
    </div>
  )
}

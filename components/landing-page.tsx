"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, ShieldCheck, ArrowRight, Scale, Fingerprint, Lock, Globe, Zap, Cpu, Server, Activity, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, locale, setLocale } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full bg-[#03060a] text-white selection:bg-primary/30 selection:text-white overflow-x-hidden font-sans">
      {/* 
        --- CINEMATIC BACKGROUND LAYER --- 
      */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Atmosphere */}
        <div className="absolute inset-0 bg-[#03060a]" />
        
        {/* Animated Radial Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[70%] bg-primary/20 rounded-full blur-[180px] animate-[pulse_10s_infinite]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[70%] bg-blue-600/10 rounded-full blur-[180px] animate-[pulse_15s_infinite]" />
        
        {/* Advanced Grid System */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-30" />
        
        {/* Vertical Beam Lines */}
        <div className="absolute left-[10%] top-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
        <div className="absolute right-[10%] top-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>

      {/* --- ELITE NAVIGATION --- */}
      <header className={cn(
        "fixed top-0 z-50 w-full px-10 py-6 flex justify-between items-center transition-all duration-500",
        scrolled ? "bg-black/80 backdrop-blur-3xl border-b border-white/5 py-4" : "bg-transparent"
      )}>
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
             <div className="absolute -inset-2 bg-primary rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
             <div className="relative bg-[#0a0f1a] p-3 rounded-xl border border-white/10 shadow-2xl">
                <Scale className="h-6 w-6 text-primary" />
             </div>
          </div>
          <div className="flex flex-col -space-y-1">
             <span className="font-black tracking-tighter text-2xl uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">ADAL AUDIT</span>
             <span className="text-[9px] font-mono tracking-[0.5em] text-white/30 uppercase">Forensic Intelligence Unit</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-12 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
             <button className="hover:text-primary transition-colors">Core Engine</button>
             <button className="hover:text-primary transition-colors">Compliance</button>
             <button className="hover:text-primary transition-colors">Security</button>
          </div>
          <div className="h-5 w-px bg-white/10 mx-2" />
          <button 
            onClick={() => setLocale(locale === "kz" ? "ru" : "kz")}
            className="text-[10px] font-mono tracking-widest text-white/40 hover:text-white transition-all uppercase"
          >
            {locale === "kz" ? "[ RU ]" : "[ KZ ]"}
          </button>
          <Button size="sm" onClick={onStart} className="hidden sm:inline-flex rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-[10px] font-bold tracking-widest">
            CONTROL CENTER
          </Button>
        </div>
      </header>

      {/* --- MASTER HERO --- */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-48 max-w-7xl mx-auto">
        <div className="text-center space-y-12 max-w-6xl w-full">
          
          {/* Status Label */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-[#0a0f1a]/80 backdrop-blur-3xl shadow-2xl ring-1 ring-white/10 mb-8">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_orange]" />
                <span className="text-[10px] font-mono tracking-[0.4em] font-black text-white/50 uppercase">{t("landing.welcome")}</span>
                <span className="text-white/10">|</span>
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold">SOVEREIGN AI ENGINE v2.0</span>
             </div>
          </div>

          {/* Epic Main Headline */}
          <div className="animate-in fade-in slide-in-from-top-12 duration-1200 delay-200">
            <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter leading-[0.85] uppercase -ml-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 select-none">
                {t("landing.title").split(":")[0]}
              </span>
              <br />
              <span className="text-primary/95 drop-shadow-[0_0_40px_rgba(var(--primary-rgb),0.45)] italic relative inline-block">
                {t("landing.title").split(":")[1] || ""}
                {/* Decoration */}
                <span className="absolute -bottom-6 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </span>
            </h1>
            <p className="text-xl md:text-3xl text-white/40 max-w-4xl mx-auto leading-relaxed font-light mt-12 tracking-wide uppercase">
              {t("landing.tagline")}
            </p>
          </div>

          {/* Master CTA Container */}
          <div className="flex flex-col items-center gap-12 pt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 w-full">
             <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-[40px] opacity-100 group-hover:blur-[60px] transition-all" />
                <Button 
                  size="lg" 
                  onClick={onStart}
                  className="relative h-24 px-16 rounded-full bg-white text-black hover:bg-white text-3xl font-black transition-transform active:scale-95 shadow-[0_20px_80px_rgba(255,255,255,0.2)]"
                >
                  {t("landing.cta")}
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-3 transition-transform duration-500" />
                </Button>
             </div>
             
             {/* Tech Row Under CTA */}
             <div className="flex flex-wrap justify-center items-center gap-12 text-[10px] font-mono tracking-[0.3em] text-white/30 uppercase opacity-60">
                <div className="flex items-center gap-3">
                   <Lock className="h-4 w-4" />
                   <span>End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-3">
                   <ShieldCheck className="h-4 w-4" />
                   <span>Off-Grid Intelligence</span>
                </div>
                <div className="flex items-center gap-3">
                   <Activity className="h-4 w-4" />
                   <span>Real-time Forensics</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- PERFORMANCE STRIP --- */}
        <div className="mt-64 w-full max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-1 animate-in fade-in duration-1000 delay-1000">
           {[
              { label: "Data Leakage Risk", value: "0.0%", icon: <Lock className="h-4 w-4" /> },
              { label: "Audit Confidence", value: "98.7%", icon: <Zap className="h-4 w-4" /> },
              { label: "Detection Delay", value: "REAL-TIME", icon: <Cpu className="h-4 w-4" /> },
              { label: "Operational Mode", value: "SOVEREIGN", icon: <Server className="h-4 w-4" /> }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col p-10 border border-white/5 bg-white/[0.01] first:rounded-l-[40px] last:rounded-r-[40px] hover:bg-white/[0.03] transition-colors group">
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-black tracking-tighter mb-2">{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/20">{stat.label}</div>
             </div>
           ))}
        </div>

        {/* --- THE AUDIT BENTO: TRUE IMPACT --- */}
        <section className="mt-56 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-1200">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Massive Feature Card */}
              <div className="md:col-span-7 group relative overflow-hidden rounded-[50px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-16 flex flex-col justify-end h-[600px] hover:border-primary/40 transition-all duration-700">
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 
                 <div className="mb-12 p-6 rounded-[30px] bg-primary/10 w-fit text-primary border border-primary/20 shadow-2xl">
                    <Fingerprint className="h-10 w-10 animate-pulse" />
                 </div>
                 
                 <div className="relative z-10 space-y-6">
                    <Badge variant="outline" className="px-6 py-2 border-primary/30 text-primary font-mono tracking-[0.3em] text-[11px] bg-primary/5 uppercase rounded-full">Strategic Sovereignty</Badge>
                    <h3 className="text-6xl font-black tracking-tighter leading-[0.9]">{t("landing.sov.title")}</h3>
                    <p className="text-white/40 text-xl leading-relaxed max-w-lg font-light">{t("landing.sov.desc")}</p>
                 </div>
              </div>

              {/* Stacked Side Cards */}
              <div className="md:col-span-5 flex flex-col gap-8">
                 {/* Top Side Card */}
                 <div className="flex-1 group relative overflow-hidden rounded-[50px] border border-white/10 bg-white/[0.01] p-12 flex flex-col justify-between hover:border-orange-500/30 transition-all">
                    <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 w-fit border border-orange-500/20">
                       <Bot className="h-10 w-10 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter mb-4">{t("landing.logic.title")}</h3>
                      <p className="text-white/30 text-base leading-relaxed font-light">{t("landing.logic.desc")}</p>
                    </div>
                 </div>

                 {/* Bottom Side Card */}
                 <div className="flex-1 group relative overflow-hidden rounded-[50px] border border-white/10 bg-white/[0.01] p-12 flex flex-col justify-between hover:border-green-500/30 transition-all">
                    <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 w-fit border border-green-500/20">
                       <Scale className="h-10 w-10 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter mb-4">{t("landing.impact.title")}</h3>
                      <p className="text-white/30 text-base leading-relaxed font-light">{t("landing.impact.desc")}</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- FINAL ACTION SECTION --- */}
        <section className="mt-72 relative w-full text-center space-y-20 py-40 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
           <div className="relative animate-in zoom-in duration-1000">
              <h2 className="text-6xl md:text-[10rem] font-black tracking-[0.1em] text-white/5 uppercase select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">MISSION READY</h2>
              <h3 className="relative text-5xl md:text-8xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
                 Secure your data.<br />Ensure the truth.
              </h3>
           </div>
           
           <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Button 
                onClick={onStart} 
                className="group relative h-24 px-20 rounded-full bg-primary text-black hover:bg-white transition-all font-black text-3xl shadow-[0_40px_100px_rgba(var(--primary-rgb),0.4)]"
              >
                {t("hero.start")}
                <ChevronRight className="ml-4 h-10 w-10 group-hover:translate-x-4 transition-transform duration-500" />
              </Button>
           </div>
        </section>
      </main>

      {/* --- ELITE FOOTER --- */}
      <footer className="relative z-10 w-full pt-48 pb-16 px-12 max-w-7xl mx-auto border-t border-white/5 mt-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-32">
           <div className="md:col-span-6 space-y-10">
              <div className="flex items-center gap-4">
                 <Scale className="h-8 w-8 text-primary" />
                 <span className="font-black text-3xl tracking-tighter">ADAL AUDIT</span>
              </div>
              <p className="text-white/20 text-sm max-w-lg leading-loose uppercase tracking-[0.2em]">
                {t("landing.tagline")}
              </p>
           </div>
           
           <div className="md:col-span-3 space-y-8">
              <h4 className="text-[10px] font-mono tracking-[0.4em] text-primary uppercase font-black underline decoration-primary/20 underline-offset-8">Unit Resources</h4>
              <ul className="space-y-4 text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium">
                 <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><div className="h-1 w-1 bg-primary/40" /> Forensic Engine</li>
                 <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><div className="h-1 w-1 bg-primary/40" /> Case Management</li>
                 <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><div className="h-1 w-1 bg-primary/40" /> Security Protocols</li>
              </ul>
           </div>

           <div className="md:col-span-3 space-y-8">
              <h4 className="text-[10px] font-mono tracking-[0.4em] text-primary uppercase font-black underline decoration-primary/20 underline-offset-8">System Info</h4>
              <div className="space-y-6">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">Network Status</span>
                    <span className="text-[10px] font-mono text-green-500/80 uppercase flex items-center gap-2 tracking-widest">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Encrypted & Secure
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">ML Readiness</span>
                    <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest italic font-bold">100% Operational</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
           <div className="flex flex-col gap-1">
              <p className="text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase opacity-50">
                {t("landing.footer")}
              </p>
              <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em] text-center md:text-left">Developed by Team Adal Audit for Decentrathon 5.0</span>
           </div>
           <div className="flex items-center gap-12">
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-mono text-primary uppercase tracking-[0.5em] font-black">Audit Verified</span>
                 <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">2026-Platform-Sovereign</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  )
}

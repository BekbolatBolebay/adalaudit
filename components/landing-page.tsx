"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { 
  ArrowRight, Scale, Fingerprint, Lock, Zap, Cpu, Activity, 
  ChevronRight, Radar, Shield, ShieldCheck, Database, 
  Sparkles, Bot, LayoutPanelLeft, Globe, Search 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, locale, setLocale } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const { mainLabel, description } = useMemo(() => {
    const raw = t("landing.title")
    const parts = raw.split(":").map(s => s.trim())
    return {
      mainLabel: parts[0] || "ADAL AUDIT",
      description: parts[1] || ""
    }
  }, [t])

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { 
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" } as any
    }
  }

  const beamVariants = {
    initial: { x: "-100%", opacity: 0 },
    animate: { 
      x: "100%", 
      opacity: [0, 1, 1, 0],
      transition: { 
        duration: 3, 
        repeat: Infinity, 
        repeatDelay: 2, 
        ease: "easeInOut" 
      } as any
    }
  }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative min-h-[200vh] w-full bg-[#010204] text-white selection:bg-primary/40 selection:text-white overflow-x-hidden font-sans antialiased">
      
      {/* IMMERSIVE INTERACTIVE GLOW */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary-rgb), 0.12), transparent 45%)`,
          opacity: 0.5
        } as any}
      />

      {/* CINEMATIC PARALLAX BACKGROUND */}
      <motion.div style={{ y: backgroundY }} className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Extreme Tactical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff08_1px,transparent_1px)] bg-[size:25px_25px] opacity-30" />
        
        {/* Floating Forensic Geometry */}
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
           className="absolute top-[10%] left-[5%] opacity-5"
        >
           <Radar className="w-[40rem] h-[40rem] text-primary" />
        </motion.div>

        <motion.div 
           animate={{ rotate: -360 }}
           transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-[0%] right-[-5%] opacity-5"
        >
           <Globe className="w-[50rem] h-[50rem] text-blue-500" />
        </motion.div>

        {/* Ambient Focal Points */}
        <div className="absolute top-[20%] left-[15%] w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[30%] right-[20%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[200px]" />
      </motion.div>

      {/* ELITE FLOATING HEADER */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "fixed top-0 z-50 w-full px-8 md:px-20 py-10 transition-all duration-700",
          scrolled ? "bg-black/80 backdrop-blur-3xl border-b border-white/5 py-5" : "bg-transparent"
        )}
      >
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-6 group cursor-pointer"
          >
            <div className="bg-primary p-3 rounded-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
               <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
               <span className="font-black tracking-tighter text-2xl italic leading-none">ADAL AUDIT</span>
               <span className="text-[8px] font-mono tracking-[0.5em] text-white/80 uppercase mt-1">{t("landing.sov.sub")}</span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-10">
            <nav className="hidden lg:flex items-center gap-14 text-[10px] font-mono uppercase tracking-[0.5em] text-white/40">
               {[
                 { key: "landing.nav.analysis", label: "Analysis" },
                 { key: "landing.nav.sovereign", label: "Sovereign" },
                 { key: "landing.nav.security", label: "Security" },
                 { key: "landing.nav.logs", label: "Logs" }
               ].map((item) => (
                 <motion.span 
                   key={item.key}
                   whileHover={{ textShadow: "0 0 10px white", color: "white" }}
                   className="cursor-pointer transition-all duration-300"
                 >
                   {t(item.key)}
                 </motion.span>
               ))}
            </nav>
            <div className="h-6 w-px bg-white/10" />
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(locale === "kz" ? "ru" : "kz")}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60 font-black uppercase tracking-[0.2em]"
            >
              {locale === "kz" ? t("landing.lang.switch") : t("landing.lang.switch_ru")}
            </motion.button>
            <Button onClick={onStart} className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-[11px] tracking-widest px-10 h-12 backdrop-blur-3xl shadow-2xl">
               {t("landing.access_portal")}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* CINEMATIC HERO SECTION */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-48 max-w-[1600px] mx-auto"
      >
        <motion.div style={{ y: textY, opacity: opacityHero }} className="text-center w-full space-y-24 flex flex-col items-center relative">
          
          {/* Top Mission Status */}
          <motion.div variants={itemVariants} className="relative">
             <div className="inline-flex items-center gap-5 px-10 py-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-3xl shadow-3xl">
                <motion.div 
                   animate={{ scale: [1, 1.5, 1] }} 
                   transition={{ duration: 2, repeat: Infinity }}
                   className="h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_orange]" 
                />
                <span className="text-[11px] font-mono tracking-[0.5em] text-primary font-black uppercase">
                   {t("landing.welcome")} — {t("landing.core_deployed")}
                </span>
             </div>
          </motion.div>

          {/* MASTER HEADLINE */}
          <motion.div variants={itemVariants} className="space-y-8 flex flex-col items-center">
             <h1 className="flex flex-col items-center select-none">
                <motion.span 
                  className="text-7xl md:text-[9rem] lg:text-[11rem] font-black tracking-tighter leading-[0.8] text-white drop-shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                   {mainLabel}
                </motion.span>
                
                <motion.span 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="relative mt-8 text-primary italic text-3xl md:text-5xl lg:text-[5rem] font-black tracking-tight transform -rotate-1 px-10 py-3 backdrop-blur-3xl rounded-2xl border border-primary/20 bg-primary/5 inline-block group"
                >
                   {description}
                   <motion.div 
                      variants={beamVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" 
                   />
                </motion.span>
             </h1>

             <motion.p 
               variants={itemVariants}
               className="mt-16 text-xl md:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light uppercase tracking-[0.2em] italic"
             >
                « {t("landing.tagline")} »
             </motion.p>
          </motion.div>

          {/* CALL TO ACTION */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-20 pt-16 w-full">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="relative group cursor-pointer" 
               onClick={onStart}
             >
                <div className="absolute -inset-24 bg-primary/30 rounded-full blur-[130px] opacity-100 group-hover:bg-primary/50 transition-all duration-1000 animate-pulse" />
                <button className="relative h-36 px-48 rounded-[60px] bg-white/5 border border-white/10 text-white hover:bg-primary/20 hover:border-primary/40 transition-all duration-700 text-6xl font-black shadow-[0_50px_150px_rgba(var(--primary-rgb),0.25)] flex items-center gap-10 group-active:scale-95 overflow-hidden backdrop-blur-3xl">
                   <span className="relative z-10">{t("landing.cta")}</span>
                   <div className="relative z-10 bg-white/10 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="h-14 w-14 stroke-[5px]" />
                   </div>
                   <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12"
                   />
                </button>
             </motion.div>

             {/* Technology Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1300px] pt-24">
                {[
                   { label: "landing.feat.airgapped", icon: <Lock />, desc: "landing.feat.airgapped.desc", state: "SECURED" },
                   { label: "landing.feat.deterministic", icon: <Search />, desc: "landing.feat.deterministic.desc", state: "ACTIVE" },
                   { label: "landing.feat.govtech", icon: <Database />, desc: "landing.feat.govtech.desc", state: "ONLINE" }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -10, borderColor: "rgba(var(--primary-rgb), 0.4)" }}
                    className="flex flex-col items-start text-left gap-6 p-12 rounded-[56px] border border-white/5 bg-white/[0.02] backdrop-blur-xl group cursor-default transition-all duration-500"
                  >
                     <div className="flex w-full justify-between items-start">
                        <div className="p-6 rounded-[32px] bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform">
                           {item.icon}
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary px-4 py-1.5 rounded-full">{item.state}</Badge>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[11px] font-mono tracking-[0.5em] text-white/50 uppercase font-black">{t(item.label)}</span>
                        <h4 className="text-2xl font-bold text-white/90">{t(item.desc)}</h4>
                     </div>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        </motion.div>

        {/* PERFORMANCE MATRIX */}
        <section className="mt-96 w-full px-4 overflow-visible">
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={containerVariants}
             className="grid grid-cols-2 lg:grid-cols-4 gap-8"
           >
              {[
                 { val: "99.98%", label: "landing.stat.precision", sub: "landing.stat.precision.sub" },
                 { val: "0.1MS", label: "landing.stat.latency", sub: "landing.stat.latency.sub" },
                 { val: "O-API", label: "landing.stat.dependency", sub: "landing.stat.dependency.sub" },
                 { val: "READY", label: "landing.stat.unit_status", sub: "landing.stat.unit_status.sub" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="relative p-16 rounded-[80px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-50" />
                   <div className="text-5xl font-black tracking-tighter mb-4 text-white">{stat.val}</div>
                   <div className="text-[14px] font-mono tracking-[0.5em] text-white/70 font-black">{t(stat.label)}</div>
                   <p className="text-[10px] font-mono text-primary/70 uppercase mt-4 tracking-widest font-bold underline decoration-primary/20 underline-offset-4">{t(stat.sub)}</p>
                </motion.div>
              ))}
           </motion.div>
        </section>

        {/* BENTO MASTER SUITE */}
        <section className="mt-96 w-full">
           <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-10 h-auto md:h-[1100px]">
              {/* PRIMARY HERO BENTO */}
              <motion.div 
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="md:col-span-8 row-span-2 group relative overflow-hidden rounded-[100px] border border-white/5 bg-gradient-to-tr from-[#0a0f18] via-transparent to-transparent p-32 flex flex-col justify-end hover:border-primary/40 transition-all duration-1000 shadow-5xl"
              >
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
                 <motion.div style={{ y: backgroundY }} className="absolute top-10 right-10 rotate-12 opacity-[0.03]">
                    <Fingerprint className="w-[40rem] h-[40rem]" />
                 </motion.div>
                 <div className="relative z-10 space-y-16">
                    <div className="inline-flex items-center gap-6 px-10 py-4 rounded-full border border-primary/20 bg-primary/5">
                       <ShieldCheck className="h-6 w-6 text-primary" />
                       <span className="text-sm font-mono tracking-[0.6em] text-primary font-black">{t("landing.bento.arch")}</span>
                    </div>
                    <h3 className="text-[5rem] md:text-[7rem] lg:text-[8rem] font-black tracking-tighter leading-[0.8] text-white shadow-2xl uppercase">{t("landing.sov.title")}</h3>
                    <p className="text-white/60 text-4xl leading-relaxed max-w-4xl font-light italic tracking-wide">{t("landing.sov.desc")}</p>
                 </div>
              </motion.div>

              {/* ACTION TILES */}
              <motion.div 
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 50 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="md:col-span-4 row-span-1 group relative overflow-hidden rounded-[100px] border border-white/5 bg-[#0a0f1a]/60 p-20 flex flex-col justify-center gap-14 hover:border-orange-500/40 transition-all cursor-default"
              >
                 <div className="p-10 rounded-[48px] bg-orange-500/10 text-orange-500 w-fit border border-orange-500/20 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                    <Bot className="h-20 w-20" />
                 </div>
                 <div className="space-y-6">
                   <h3 className="text-4xl font-black tracking-tighter text-white">{t("landing.logic.title")}</h3>
                   <p className="text-white/60 text-xl font-light leading-snug">{t("landing.logic.desc")}</p>
                 </div>
              </motion.div>

              <motion.div 
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 50 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="md:col-span-4 row-span-1 group relative overflow-hidden rounded-[100px] border border-white/5 bg-[#0a0f1a]/60 p-20 flex flex-col justify-center gap-14 hover:border-green-500/40 transition-all cursor-default"
              >
                 <div className="p-10 rounded-[48px] bg-green-500/10 text-green-500 w-fit border border-green-500/20 shadow-2xl group-hover:-rotate-12 group-hover:scale-110 transition-all duration-700">
                    <Scale className="h-20 w-20" />
                 </div>
                 <div className="space-y-6">
                   <h3 className="text-4xl font-black tracking-tighter text-white">{t("landing.impact.title")}</h3>
                   <p className="text-white/60 text-xl font-light leading-snug">{t("landing.impact.desc")}</p>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* MISSION CTA */}
        <section className="mt-[40rem] py-96 w-full text-center relative flex flex-col items-center gap-48">
           <motion.div 
              style={{ opacity: 0.05, y: backgroundY }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[45rem] font-extrabold text-white select-none pointer-events-none uppercase tracking-widest font-sans"
           >
              {t("landing.cta.justice")}
           </motion.div>
           
           <h3 className="relative text-[4rem] md:text-[6rem] lg:text-[9rem] font-black tracking-tighter uppercase leading-none italic group">
              {t("landing.cta.truth")}<br />
              <span className="text-primary not-italic drop-shadow-[0_0_150px_rgba(var(--primary-rgb),0.4)]">{t("landing.cta.enforced")}</span>
           </h3>
           
           <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer pt-32"
           >
              <div className="absolute -inset-40 bg-primary/40 rounded-full blur-[180px] opacity-100 group-hover:bg-primary/70 transition-all duration-1000 animate-pulse" />
              <Button 
                onClick={onStart} 
                className="relative h-48 px-56 rounded-full bg-white/5 border border-white/10 text-white hover:bg-primary/20 hover:border-primary/40 text-7xl font-black transition-all shadow-[0_60px_200px_rgba(var(--primary-rgb),0.3)] group-hover:shadow-[0_80px_250px_rgba(var(--primary-rgb),0.5)] flex items-center gap-16 backdrop-blur-3xl"
              >
                {t("hero.start")}
                <ChevronRight className="h-24 w-24 stroke-[8px] group-hover:translate-x-12 transition-transform duration-1000" />
              </Button>
           </motion.div>
        </section>
      </motion.main>

      {/* MASTER ELITE FOOTER */}
      <footer className="relative z-20 w-full pt-[30rem] pb-24 px-12 md:px-40 max-w-[2000px] mx-auto bg-gradient-to-b from-transparent to-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-64 mb-64 items-end">
           <div className="lg:col-span-8 space-y-32">
              <div className="flex items-center gap-16 group">
                 <div className="p-8 bg-primary/15 rounded-[60px] border border-primary/20 shadow-5xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
                    <Fingerprint className="h-32 w-32 text-primary" />
                 </div>
                 <div className="flex flex-col">
                    <span className="font-black text-6xl md:text-[8rem] lg:text-[10rem] tracking-tighter uppercase italic leading-[0.75] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/30">ADAL AUDIT</span>
                    <span className="text-[18px] font-mono tracking-[1.2em] text-white/70 uppercase font-black">{t("landing.footer.unit")}</span>
                 </div>
              </div>
              <p className="text-white/70 text-5xl max-w-7xl leading-tight font-light uppercase tracking-[0.4em] italic decoration-primary/20 underline-offset-[30px] decoration-[2px] underline">
                 « {t("landing.tagline")} »
              </p>
           </div>
           
           <div className="lg:col-span-4 flex justify-end">
              <div className="text-right space-y-20 font-mono">
                 <h4 className="text-[22px] tracking-[1em] text-primary uppercase font-black border-b-4 border-primary pb-8">{t("landing.footer.index")}</h4>
                 <ul className="space-y-16 text-white/80 text-[18px] uppercase tracking-[0.6em] font-black italic">
                    {[
                      { key: "landing.nav.analysis" },
                      { key: "landing.nav.sovereign" },
                      { key: "landing.nav.security" },
                      { key: "landing.nav.logs" }
                    ].map(link => (
                      <motion.li 
                        key={link.key}
                        whileHover={{ x: -20, color: "rgba(var(--primary-rgb), 1)" }}
                        className="cursor-pointer transition-all"
                      >
                         / {t(link.key)}
                      </motion.li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-32 border-t border-white/5 gap-20 font-mono text-white/80 text-[14px] uppercase tracking-[1em]">
           <span>{t("landing.footer.rights")}</span>
           <div className="flex items-center gap-20 px-20 py-10 border border-white/10 rounded-full bg-white/[0.02]">
              <div className="flex items-center gap-6">
                 <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_#22c55e]" />
                 <span className="text-primary font-black uppercase">{t("landing.footer.online")}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <span>{t("landing.footer")}</span>
           </div>
        </div>
      </footer>
    </div>
  )
}

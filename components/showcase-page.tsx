"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Cpu, Activity, Database, Lock, Globe, Zap, ArrowRight, ChevronDown, CheckCircle2, AlertCircle, FileSearch, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ShowcasePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const sections = [
    {
      title: "Vision & Sovereignty",
      subtitle: "The Future of National Forensic Intelligence",
      description: "Adal Audit is not just a tool; it's a sovereign shield for the nation's financial integrity. Built to operate in entirely isolated environments, it ensures that sensitive government data never leaves the national perimeter.",
      icon: <Shield className="w-12 h-12 text-primary" />,
      stats: [
        { label: "Data Sovereignty", value: "100%" },
        { label: "Offline Mode", value: "Native" }
      ]
    },
    {
      title: "Hyper-Forensic Engine",
      subtitle: "LLM-Powered Anomaly Detection",
      description: "Our core engine utilizes the latest advancements in Large Language Models to detect Unicode-level text manipulations, hidden control characters, and complex pricing anomalies that escape traditional rule-based systems.",
      icon: <Cpu className="w-12 h-12 text-blue-500" />,
      stats: [
        { label: "Precision", value: "99.98%" },
        { label: "Inference", value: "0.1ms" }
      ]
    },
    {
      title: "National Impact",
      subtitle: "Securing the Public Budget",
      description: "By automating the audit of thousands of procurement documents, Adal Audit saves millions in taxpayer money and prevents corruption at the architectural level of state spending.",
      icon: <Scale className="w-12 h-12 text-green-500" />,
      stats: [
        { label: "Tenders Indexed", value: "500K+" },
        { label: "Risk Mitigation", value: "Critical" }
      ]
    }
  ]

  return (
    <div className="relative min-h-screen w-full bg-[#020408] text-white overflow-hidden font-sans">
      
      {/* Cinematic Background Image Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-40 bg-cover bg-center grayscale-[0.5] contrast-[1.2]" 
        style={{ backgroundImage: 'url("/forensic-bg.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408]" />
      </div>

      <header className="fixed top-0 z-50 w-full px-12 py-8 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-primary rounded-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]">
              <Shield className="h-6 w-6 text-black" />
           </div>
           <span className="font-black tracking-tighter text-2xl uppercase italic">Adal Audit</span>
        </div>
        <div className="hidden md:flex items-center gap-12 text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
           <span className="hover:text-primary transition-colors cursor-pointer">Vision</span>
           <span className="hover:text-primary transition-colors cursor-pointer">Tech</span>
           <span className="hover:text-primary transition-colors cursor-pointer">Impact</span>
           <span className="hover:text-primary transition-colors cursor-pointer">Roadmap</span>
        </div>
        <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary font-mono text-xs tracking-widest rounded-full px-8">
           WHITEPAPER
        </Button>
      </header>

      <main className="relative z-10 pt-40 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <div className="max-w-6xl w-full px-6 flex flex-col items-center text-center space-y-12 py-20">
           <Badge variant="outline" className="px-6 py-2 border-primary/20 text-primary bg-primary/5 uppercase font-mono tracking-[0.5em] text-[10px] rounded-full">Project Intelligence Briefing</Badge>
           <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none italic uppercase">
             The <span className="text-primary not-italic">Sovereign</span> <br /> Standard
           </h1>
           <p className="text-xl md:text-2xl text-white/40 max-w-3xl leading-relaxed font-light lowercase tracking-widest italic border-l-2 border-primary px-8">
             Revolutionizing government accountability through autonomous AI forensics and national data sovereignty.
           </p>
           
           <div className="flex flex-wrap justify-center gap-6 pt-12">
              <Button size="lg" className="h-20 px-12 rounded-full bg-primary text-black hover:bg-white text-xl font-black transition-all shadow-[0_30px_60px_rgba(var(--primary-rgb),0.3)]">
                 ENTER MAINFRAME
              </Button>
              <Button size="lg" variant="outline" className="h-20 px-12 rounded-full border-white/20 text-white hover:bg-white/10 text-xl font-black transition-all">
                 DOCUMENTATION
              </Button>
           </div>
        </div>

        {/* FEATURE BENTO */}
        <section className="max-w-7xl w-full px-6 py-40 grid grid-cols-1 md:grid-cols-3 gap-8">
           {sections.map((section, idx) => (
             <div 
               key={idx}
               className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-12 hover:border-primary/30 transition-all duration-700 hover:-translate-y-4"
             >
                <div className="mb-8">{section.icon}</div>
                <h3 className="text-4xl font-black tracking-tighter mb-2">{section.title}</h3>
                <h4 className="text-xs font-mono text-primary/60 tracking-[0.2em] uppercase mb-6">{section.subtitle}</h4>
                <p className="text-white/30 leading-relaxed font-light mb-12">{section.description}</p>
                
                <div className="flex justify-between items-center border-t border-white/5 pt-8">
                   {section.stats.map((stat, i) => (
                     <div key={i} className="flex flex-col">
                        <span className="text-xs font-mono text-white/20 uppercase tracking-widest">{stat.label}</span>
                        <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                     </div>
                   ))}
                </div>
                
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent translate-y-[-100%] group-hover:translate-y-[800px] transition-all duration-[2s] ease-in-out" />
             </div>
           ))}
        </section>

        {/* MISSION STRIP */}
        <section className="w-full py-64 relative bg-[#05080f] overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-[0.5em]">MISSION</div>
           
           <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-12">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                A System Built for <span className="text-primary">Truth</span>
              </h2>
              <p className="text-white/20 text-2xl font-light italic leading-relaxed">
                "In an era where digital noise masks systemic corruption, we provide the clarity of autonomous logic. Adal Audit is the digital eye that never tires, the investigator that never blinks."
              </p>
           </div>
        </section>

      </main>

      <footer className="w-full py-20 px-12 border-t border-white/5 mt-40 flex flex-col items-center gap-12 text-center">
         <div className="flex items-center gap-6">
            <Scale className="w-12 h-12 text-primary" />
            <span className="font-black text-4xl uppercase tracking-tighter italic">Adal Audit</span>
         </div>
         <p className="text-white/20 font-mono text-[10px] tracking-[0.5em] uppercase">DECENTRATHON 5.0 — NATIONAL SOVEREIGN AI INITIATIVE</p>
         <div className="flex gap-12 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span className="hover:text-primary cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Legal Framework</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Sovereignty Portal</span>
         </div>
      </footer>
    </div>
  )
}

"use client"

import { useI18n } from "@/lib/i18n"
import { ProfitCalculator } from "./profit-calculator"
import { 
  Compass, CheckCircle2, 
  CircleSlash, ArrowRight,
  BookOpen, Calculator,
  Flag, Trophy,
  ClipboardCheck, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export function TenderStarterMap() {
  const { t } = useI18n()

  const steps = [
    { key: "starter.step1", icon: Compass, color: "text-blue-500", bg: "bg-blue-500/10" },
    { key: "starter.step2", icon: ClipboardCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
    { key: "starter.step3", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { key: "starter.step4", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
    { key: "starter.step5", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ]

  return (
    <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="mx-auto p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-inner">
           <Flag className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
          {t("starter.title")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          {t("starter.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Side: Roadmap */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 mb-2">
               <div className="h-6 w-1 rounded-full bg-primary" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t("starter.roadmap.title")}</h3>
            </div>
            
            <div className="flex flex-col gap-2">
               {steps.map((step, i) => (
                  <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all cursor-default relative overflow-hidden">
                     {i < steps.length - 1 && (
                        <div className="absolute left-8 top-12 h-6 w-px bg-border group-hover:bg-primary/20" />
                     )}
                     <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform", step.bg, step.color)}>
                        <step.icon className="h-5 w-5" />
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Step 0{i+1}</span>
                        <span className="text-xs font-bold text-foreground">{t(step.key)}</span>
                     </div>
                     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-primary" />
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-4 p-6 rounded-3xl border border-dashed border-border bg-secondary/10 flex flex-col items-center text-center gap-3 group hover:border-primary/50 transition-colors">
               <div className="p-3 rounded-full bg-background border border-border group-hover:rotate-12 transition-transform">
                  <Calculator className="h-6 w-6 text-primary" />
               </div>
               <p className="text-[10px] font-medium text-muted-foreground uppercase leading-relaxed tracking-wider">
                  Always check profitability before applying!
               </p>
            </div>
         </div>

         {/* Right Side: Calculator */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 mb-2">
               <div className="h-6 w-1 rounded-full bg-primary" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t("starter.calc.title")}</h3>
            </div>
            <ProfitCalculator />
            
            {/* Additional Tips Section */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 group hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                     <span className="text-xs font-black uppercase tracking-tight">Requirement Checklist</span>
                  </div>
                  <ul className="space-y-2 text-[10px] text-muted-foreground font-medium">
                     <li className="flex items-center gap-2">• EDS (Electronic Digital Signature)</li>
                     <li className="flex items-center gap-2">• No tax debt (Zero balance)</li>
                     <li className="flex items-center gap-2">• Bank Guarantee / Cash Security</li>
                  </ul>
               </div>

               <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 group hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-2">
                     <CircleSlash className="h-4 w-4 text-red-500" />
                     <span className="text-xs font-black uppercase tracking-tight">Common Mistakes</span>
                  </div>
                  <ul className="space-y-2 text-[10px] text-muted-foreground font-medium">
                     <li className="flex items-center gap-2">• Ignoring delivery logistics</li>
                     <li className="flex items-center gap-2">• Missing mandatory certs</li>
                     <li className="flex items-center gap-2">• Underestimating lead time</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

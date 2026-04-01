"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, Calendar, Users, Briefcase, 
  AlertTriangle, CheckCircle2, History,
  TrendingDown, Globe, ShieldAlert, Scale, Activity
} from "lucide-react"
import type { CompanyIntelligence } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CompanyRiskProfile({ data }: { data: CompanyIntelligence }) {
  const { locale, t } = useI18n()
  const isKz = locale === "kz"

  const riskColor = 
    data.risk_level === "high" || data.risk_level === "critical" 
      ? "text-red-500" 
      : data.risk_level === "medium" 
        ? "text-orange-500" 
        : "text-green-500"

  const riskBg = 
    data.risk_level === "high" || data.risk_level === "critical" 
      ? "bg-red-500/10 border-red-500/20" 
      : data.risk_level === "medium" 
        ? "bg-orange-500/10 border-orange-500/20" 
        : "bg-green-500/10 border-green-500/20"

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Profile Card */}
      <div className={cn("p-8 rounded-3xl border transition-all shadow-2xl", riskBg)}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className={cn("p-5 rounded-2xl bg-background/50 border border-border shadow-inner group-hover:scale-110 transition-transform", riskColor)}>
              <Building2 className="h-10 w-10" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
                {isKz ? data.name_kz : data.name_ru}
              </h2>
              <div className="flex items-center gap-4 mt-1 font-mono text-xs text-muted-foreground tracking-widest uppercase">
                <span>BIN: {data.bin}</span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {data.registration_date}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground mr-2">{t("business.risk.status")}</span>
                <Badge className={cn("text-lg px-6 py-1.5 rounded-full font-black uppercase tracking-tighter border-2 shadow-lg", 
                  data.risk_level === 'high' ? 'bg-red-500 text-white border-red-400' : 'bg-green-500 text-white border-green-400')}>
                  {t(`risk.${data.risk_level === "high" ? "high" : data.risk_level}`)}
                </Badge>
             </div>
             <div className="h-1 rounded-full bg-border w-full overflow-hidden mt-1">
                <div className={cn("h-full", data.risk_level === 'high' ? 'bg-red-600' : 'bg-green-600')} style={{ width: `${data.risk_score}%` }} />
             </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-3xl italic">
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                « {isKz ? data.summary_kz : data.summary_ru} »
            </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vital Stats Card */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-6">
           <h3 className="text-xs font-black font-mono uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary" />
              {t("business.stats.vital")}
           </h3>
           <div className="space-y-6">
              <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold font-mono">{t("business.stats.staff")}</span>
                    <span className="font-black text-foreground">{data.staff_count} PPL</span>
                 </div>
                 <Progress value={Math.min((data.staff_count / 10) * 100, 100)} className="h-1.5 bg-secondary" />
              </div>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold font-mono">{t("business.stats.tax")}</span>
                    <span className="font-black text-foreground">{data.tax_history_score}/100</span>
                 </div>
                 <Progress value={data.tax_history_score} className="h-1.5 bg-secondary" />
              </div>
           </div>
        </div>

        {/* Red Flags / Intelligence */}
        <div className="md:col-span-2 p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black font-mono uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-3 w-3 text-red-500" />
              {t("business.intel.flags")}
            </h3>
            {data.red_flags.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.red_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 group hover:bg-red-500/10 transition-colors">
                     <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-black text-red-600 uppercase tracking-widest">{flag.type}</span>
                        <p className="text-xs font-bold text-foreground mt-0.5">
                           {isKz ? flag.message_kz : flag.message_ru}
                        </p>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-green-500 opacity-60 h-full">
                 <CheckCircle2 className="h-10 w-10" />
                 <p className="text-xs font-black uppercase tracking-widest">{t("business.intel.none")}</p>
              </div>
            )}
        </div>
      </div>

      {/* Affiliation & Network */}
      <div className="p-8 rounded-3xl border border-border bg-card flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black font-mono uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Globe className="h-3 w-3 text-blue-500" />
                {t("business.network.title")}
            </h3>
            <Badge variant="outline" className="text-[9px] font-mono uppercase border-blue-500/20 text-blue-500 px-3">{t("business.network.visual")}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {data.affiliations.map((aff, i) => (
                <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Scale className="h-12 w-12" />
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                         <div className="text-[10px] font-black">{aff.name[0]}</div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-foreground">{aff.name}</span>
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{aff.role}</span>
                      </div>
                   </div>
                   {aff.bin && (
                      <div className="text-[9px] font-mono text-muted-foreground flex items-center gap-2 border-t border-border/50 pt-2 mt-1">
                         <History className="h-3 w-3" />
                         BIN_LINK: {aff.bin}
                      </div>
                   )}
                </div>
             ))}
          </div>
      </div>
    </div>
  )
}

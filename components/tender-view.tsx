"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Search, Loader2, Link2, AlertCircle, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { InspectionProtocol } from "./inspection-protocol"

export function TenderView() {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [protocolData, setProtocolData] = useState<any>(null)
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLogs, setActiveLogs] = useState<string[]>([])

  const handleAnalyze = async () => {
    if (!url) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    setProtocolData(null)
    setActiveLogs([])

    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      const data = await response.json()
      
      if (data.error) throw new Error(data.error)

      // LIVE STREAM EFFECT for Logs
      if (data.metadata?.forensic_logs) {
         for (let i = 0; i < data.metadata.forensic_logs.length; i++) {
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
            setActiveLogs(prev => [...prev, data.metadata.forensic_logs[i]]);
         }
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "Талдау барысында қате кетті")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateProtocol = async () => {
    if (!result || protocolData) return
    setIsGeneratingProtocol(true)
    try {
       const res = await fetch("/api/protocol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             violations: result.violations,
             fileName: result.title || "tender_document.pdf",
             detected_tender_price: result.price,
          }),
       }).then(r => r.json())

       if (res.error) throw new Error(res.error)
       setProtocolData(res)
       
       // Scroll to protocol
       setTimeout(() => {
          document.getElementById("protocol-section")?.scrollIntoView({ behavior: "smooth" })
       }, 100)
    } catch (err: any) {
       console.error("Protocol generation failed:", err)
    } finally {
       setIsGeneratingProtocol(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/40">
          {t("tender.title")}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t("hero.subtitle")}
        </p>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardContent className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary/60 font-black">
              {t("tender.input.label")}
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex gap-4">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input 
                      placeholder={t("tender.input.placeholder")}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-16 pl-14 pr-6 rounded-xl bg-background/50 border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all text-lg font-medium placeholder:text-muted-foreground/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)] focus:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !url}
                  className="h-16 px-10 rounded-xl bg-primary text-black hover:bg-white font-black text-sm tracking-widest transition-all shadow-xl group/btn"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>{t("tender.button.analyze")}</span>
                      <Zap className="h-4 w-4 fill-black group-hover/btn:animate-pulse" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(isAnalyzing || activeLogs.length > 0) && !result && (
              <motion.div 
                key="loading-stream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-6"
              >
                <div className="relative p-10 rounded-3xl border border-primary/20 bg-primary/5 overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.1),transparent_70%)]" />
                   
                   <div className="relative flex flex-col items-center gap-8">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-t-primary animate-spin" />
                        <Search className="absolute inset-x-0 inset-y-0 h-10 w-10 text-primary m-auto animate-pulse" />
                      </div>

                      <div className="w-full max-w-lg space-y-3 font-mono">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-primary/60 font-black mb-4">
                           <span>Forensic Stream v2.5</span>
                           <span className="animate-pulse">Live // Analyzing</span>
                        </div>
                        
                        <div className="min-h-[120px] space-y-2">
                           {activeLogs.map((log, idx) => (
                             <motion.div 
                               key={idx}
                               initial={{ x: -10, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               className="text-xs text-white/80 flex items-start gap-3 border-l border-primary/20 pl-4 py-1"
                             >
                               <span className="text-primary opacity-50 shrink-0">[{idx+1}]</span>
                               <span className="leading-relaxed">{log}</span>
                             </motion.div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-center gap-2">
                   {[0, 1, 2].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ 
                         scale: [1, 1.5, 1],
                         opacity: [0.2, 1, 0.2]
                       }}
                       transition={{ 
                         duration: 1, 
                         repeat: Infinity, 
                         delay: i * 0.2 
                       }}
                       className="h-1.5 w-1.5 rounded-full bg-primary"
                     />
                   ))}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 flex items-center gap-4"
              >
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-3xl border border-white/5 bg-white/[0.02] gap-6" id="tender-result-header">
                  <div className="flex items-center gap-6">
                    <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                      <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white uppercase tracking-tight">{result.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-[10px] font-mono border-white/10 uppercase tracking-widest">{result.tender_id}</Badge>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-mono uppercase tracking-widest">VERIFIED_SECURE</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">{result.price?.toLocaleString()} ₸</div>
                    <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mt-2">{t("tender.label.budget")}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="relative group p-8 rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                           <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-white/40">{t("scanner.risk")}</span>
                        </div>
                        <div className="flex items-end gap-6">
                           <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="text-8xl font-black text-primary tracking-tighter"
                           >
                             {result.risk_score}%
                           </motion.div>
                           <div className="pb-4">
                              <div className={cn(
                                 "text-xl font-bold uppercase tracking-tight",
                                 result.risk_score > 70 ? "text-red-500" : result.risk_score > 40 ? "text-orange-500" : "text-green-500"
                              )}>
                                 {result.risk_score > 70 ? t("risk.critical") : result.risk_score > 40 ? t("risk.high") : t("risk.low")}
                              </div>
                              <div className="text-[10px] font-mono tracking-widest text-muted-foreground mt-1 uppercase">{t("forensic.violations.count")}: {result.violations?.length}</div>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-blue-500" />
                         <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-white/40">Forensic Summary</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed italic">
                        « {locale === "kz" ? result.summary_kz : result.summary_ru} »
                      </p>
                   </div>
                </div>

                {/* NEW: Financial Guide & Bidding Strategy */}
                {result.financial_guide && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                           <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-blue-400/60">Financial Guide (Қаржылық нұсқаулық)</span>
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">3% Кепілдік (Guarantee):</span>
                              <span className="text-xl font-bold text-white">{result.financial_guide.guarantee_3_percent?.toLocaleString()} ₸</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Қажетті капитал (Min Capital):</span>
                              <span className="text-sm font-mono text-blue-400">{result.financial_guide.min_capital_required?.toLocaleString()} ₸</span>
                           </div>
                           <div className="h-px bg-white/5" />
                           <div className="flex items-center justify-between text-primary">
                              <span className="text-sm font-bold uppercase tracking-wider">Ұсынылатын баға (Rec. Bid):</span>
                              <span className="text-2xl font-black">{result.financial_guide.recommended_bid?.toLocaleString()} ₸</span>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-primary" />
                           <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-primary/60">Submission Strategy (Стратегия)</span>
                        </div>
                        <div className="space-y-4">
                           <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-white/80 leading-relaxed">
                              <strong>Стратегия:</strong> {result.financial_guide.strategy}
                           </div>
                           <div className="space-y-2">
                             {result.submission_guide?.map((step: string, i: number) => (
                               <div key={i} className="text-[11px] flex items-center gap-3 text-muted-foreground">
                                 <div className="h-1 w-1 rounded-full bg-primary shrink-0" />
                                 {step}
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* NEW: Hidden Traps in TenderView */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-destructive" />
                         <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-destructive/60">{t("scanner.result.traps")}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {result.hidden_traps && result.hidden_traps.length > 0 ? (
                          result.hidden_traps.map((trap: string, i: number) => (
                            <div key={i} className="text-xs flex items-center gap-2 text-foreground/80 bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-xl">
                              <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                              {trap}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">{locale === 'kz' ? 'Жасырын тұзақтар анықталмады' : 'Скрытых ловушек не обнаружено'}</p>
                        )}
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-primary" />
                         <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-black text-primary/60">Winning Probability</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-black text-primary">{result.winning_probability || 0}%</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{t("scanner.result.winning_prob")}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary transition-all duration-1000"
                             style={{ width: `${result.winning_probability || 0}%` }}
                           />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-white/20 font-black">{t("tender.label.violations")}</span>
                      <div className="h-px flex-1 mx-8 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {result.violations?.map((v: any, i: number) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="group flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
                         >
                            <Badge className={cn(
                               "shrink-0 p-2 border font-mono",
                               v.severity === "critical" ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-orange-500/20 bg-orange-500/10 text-orange-500"
                            )}>
                               {v.code}
                            </Badge>
                            <div className="space-y-2">
                               <p className="font-bold text-white/90">{locale === "kz" ? v.text_kz : v.text_ru}</p>
                               {v.original_fragment && (
                                  <div className="text-[10px] font-mono text-muted-foreground p-2 rounded bg-black/20 border border-white/5 italic">
                                     "{v.original_fragment}"
                                  </div>
                               )}
                               <p className="text-xs text-muted-foreground/80 leading-relaxed">{v.explanation}</p>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 border-t border-white/5">
                   <Button 
                      variant="outline" 
                      onClick={() => {
                        document.getElementById("tender-result-header")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="w-full md:w-auto px-10 h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-black font-bold tracking-wider uppercase transition-all"
                   >
                      {t("scanner.button.market_check")}
                   </Button>
                   <Button 
                      onClick={handleGenerateProtocol}
                      disabled={isGeneratingProtocol}
                      className="w-full md:w-auto px-10 h-14 rounded-2xl bg-primary text-black hover:bg-white font-black tracking-widest uppercase shadow-xl shadow-primary/10 transition-all"
                   >
                      {isGeneratingProtocol ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        t("tender.button.protocol")
                      )}
                   </Button>
                </div>

                {/* Protocol Section */}
                {(isGeneratingProtocol || protocolData) && (
                   <div id="protocol-section" className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
                      <InspectionProtocol 
                         protocolData={protocolData} 
                         isLoading={isGeneratingProtocol} 
                      />
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

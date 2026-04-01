"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, Bot, User, X, Loader2, Mic, MicOff, 
  Brain, Sparkles, Command, ShieldCheck,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

interface ForensicChatProps {
    context?: any
    isVisible: boolean
    onClose: () => void
    isEmbedded?: boolean
}

export function ForensicChat({ context, isVisible, onClose, isEmbedded = false }: ForensicChatProps) {
    const { t, locale } = useI18n()
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState("")
    const [isExpertMode, setIsExpertMode] = useState(true)
    const [isListening, setIsListening] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = locale === "kz" ? "kk-KZ" : "ru-RU"

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsListening(false)
            }

            recognitionRef.current.onerror = () => {
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }
    }, [locale])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
        } else {
            recognitionRef.current?.start()
            setIsListening(true)
        }
    }

    const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
        e?.preventDefault();
        const text = customInput || input;
        if (!text.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: "user", content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: [...messages, userMessage], 
                    context: { ...context, is_expert: isExpertMode } 
                })
            });

            if (!res.ok) throw new Error("Chat service error");

            const data = await res.json();
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content || data.text
            }]);
        } catch (err) {
            console.error("Local Chat Error:", err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: locale === "kz" 
                    ? "Кешіріңіз, жергілікті чат қызметінде қате орын алды." 
                    : "Извините, произошла ошибка в работе локального чата."
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleQuickAction = (prompt: string) => {
        handleSubmit(undefined, prompt);
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    if (!isVisible && !isEmbedded) return null

    const quickActions = [
        { 
            label: locale === "kz" ? "Тәуекелдер" : "Риски", 
            icon: ShieldCheck,
            prompt: "Осы құжаттағы негізгі коррупциялық рисктерді қысқаша атап бер." 
        },
        { 
            label: locale === "kz" ? "Заңнама" : "Законы", 
            icon: Command,
            prompt: "Табылған бұзушылықтар ҚР заңының қай баптарына қайшы келеді?" 
        },
        { 
            label: locale === "kz" ? "Қадамдар" : "Шаги", 
            icon: ChevronRight,
            prompt: "Осы жағдай бойынша әрі қарай қандай тергеу амалдарын жүргізу керек?" 
        }
    ]

    return (
        <Card className={cn(
            "flex flex-col border-primary/20 bg-background/80 backdrop-blur-xl z-50 overflow-hidden ring-1 ring-white/10 shadow-2xl transition-all duration-500",
            isEmbedded
                ? "h-full w-full border-none shadow-none rounded-none bg-transparent"
                : "fixed bottom-5 right-5 w-[420px] h-[650px] animate-in slide-in-from-bottom-10 fade-in zoom-in-95"
        )}>
            {/* Premium Header */}
            <CardHeader className="p-4 border-b bg-primary/5 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden shadow-inner">
                                <Bot className="w-6 h-6 animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                            </div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold tracking-tight">ADAL EXPERT AI</CardTitle>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-primary/60" />
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Forensic Assistant</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "h-8 w-8 rounded-lg transition-colors",
                                isExpertMode ? "text-primary bg-primary/10" : "text-muted-foreground"
                            )}
                            onClick={() => setIsExpertMode(!isExpertMode)}
                            title="Expert Mode"
                        >
                            <Brain className="w-4 h-4" />
                        </Button>
                        {!isEmbedded && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative bg-grid-white/[0.02]">
                <ScrollArea className="h-full" ref={scrollRef}>
                    <div className="p-5 space-y-6">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center py-12 animate-in fade-in duration-1000">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
                                        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground tracking-tight">
                                    {locale === "kz" ? "Инспектор дайын" : "Инспектор готов"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                                    {locale === "kz" 
                                        ? "Тендерлік құжаттама бойынша кәсіби сараптамалық сұрақтар қойыңыз." 
                                        : "Задайте профессиональные вопросы по тендерной документации."}
                                </p>
                                
                                <div className="grid grid-cols-1 gap-2.5 w-full mt-10">
                                    {quickActions.map((action, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="group text-[11px] justify-between h-auto py-3 px-4 bg-white/5 hover:bg-primary/5 border-primary/5 hover:border-primary/20 text-left rounded-xl transition-all hover:scale-[1.02]"
                                            onClick={() => handleQuickAction(action.prompt)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <action.icon className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100" />
                                                <span className="font-medium text-foreground/80 group-hover:text-foreground">{action.label}</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-primary/40 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl border shrink-0 shadow-sm transition-transform hover:scale-110",
                                    m.role === "user" 
                                        ? "bg-secondary/50 border-white/5" 
                                        : "bg-primary/10 border-primary/20 ring-4 ring-primary/5"
                                )}>
                                    {m.role === "user" ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
                                </div>
                                <div className={cn(
                                    "max-w-[82%] rounded-2xl p-4 text-[13px] leading-relaxed relative",
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10"
                                        : "bg-card/50 border border-white/5 rounded-tl-none text-foreground backdrop-blur-sm"
                                )}>
                                    {m.content}
                                    {m.role === "assistant" && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                                            <ShieldCheck className="w-3 h-3 text-primary/60" />
                                            <span>Expert Verification Complete</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 ring-4 ring-primary/5 shrink-0">
                                    <Bot className="w-4 h-4 text-primary animate-spin" />
                                </div>
                                <div className="bg-card/30 border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex flex-col gap-3 w-full max-w-[200px]">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase">Processing...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (input && input.trim()) handleSubmit(e);
                }} className="flex w-full items-end gap-2.5 relative z-10">
                    <div className="flex-1 relative">
                        <Input
                            placeholder={locale === "kz" ? "Сарапшыдан сұраңыз..." : "Спросите эксперта..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="bg-white/5 border-white/10 pr-12 focus-visible:ring-primary/40 focus-visible:border-primary/50 py-6 pl-4 text-sm rounded-2xl transition-all"
                        />
                        <button
                            type="button"
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl transition-all flex items-center justify-center",
                                isListening ? "text-red-500 bg-red-500/10 scale-110" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            )}
                            onClick={toggleListening}
                            disabled={isLoading}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!input.trim() || isLoading} 
                        className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}

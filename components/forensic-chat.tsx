"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, X, MessageCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForensicChatProps {
    context?: any
    isVisible: boolean
    onClose: () => void
    isEmbedded?: boolean
}

export function ForensicChat({ context, isVisible, onClose, isEmbedded = false }: ForensicChatProps) {
    const [input, setInput] = useState("")
    const {
        messages,
        status,
        sendMessage
    } = useChat({
        api: "/api/chat",
        body: { context },
        id: "forensic-chat",
        initialMessages: [],
        onError: (err: any) => {
            console.error("Chat Hook Error:", err);
        }
    } as any) as any;

    const isLoading = status === "submitting" || status === "streaming";

    useEffect(() => {
        console.log("[ForensicChat] messages updated:", messages.length, "status:", status);
    }, [messages.length, status]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage([{ role: "user", content: input }]);
            setInput("");
        }
    }

    const handleQuickAction = (prompt: string) => {
        if (!isLoading) {
            sendMessage([{ role: "user", content: prompt }]);
        }
    }

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!isVisible && !isEmbedded) return null

    const quickActions = [
        { label: "Рисктерді қорытындылау", prompt: "Осы құжаттағы негізгі коррупциялық рисктерді қысқаша атап бер." },
        { label: "Заң бойынша талдау", prompt: "Табылған бұзушылықтар ҚР заңының қай баптарына қайшы келеді?" },
        { label: "Болашақ қадамдар", prompt: "Осы жағдай бойынша әрі қарай қандай тергеу амалдарын жүргізу керек?" }
    ]

    return (
        <Card className={cn(
            "flex flex-col border-primary/20 bg-background/95 backdrop-blur-sm z-50",
            isEmbedded
                ? "h-full w-full border-none shadow-none rounded-none bg-transparent"
                : "fixed bottom-4 right-4 w-[400px] h-[600px] shadow-2xl animate-in slide-in-from-bottom-5"
        )}>
            <CardHeader className="p-4 border-b bg-primary/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold">AI Инспектор</CardTitle>
                        <p className="text-[10px] text-muted-foreground">Талдау бойынша онлайн кеңес</p>
                    </div>
                </div>
                {!isEmbedded && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {messages.length === 0 && (
                            <div className={cn(
                                "flex flex-col items-center justify-center text-center space-y-4 px-6 text-muted-foreground",
                                isEmbedded ? "h-[300px] mt-20" : "h-[400px]"
                            )}>
                                <div className="p-4 rounded-full bg-primary/5 border border-dashed border-primary/20">
                                    <Bot className="w-8 h-8 text-primary/40" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Сұрақ қойыңыз</h3>
                                    <p className="text-xs mt-1">Жүктелген құжат бойынша кез келген ақпаратты сұраңыз немесе жиі қойылатын сұрақтарды пайдаланыңыз.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full mt-4">
                                    {quickActions.map((action, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="text-[11px] justify-start h-auto py-2 bg-background hover:bg-primary/5 border-primary/10 text-left"
                                            onClick={() => handleQuickAction(action.prompt)}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1",
                                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-1 rounded-full border",
                                        m.role === "user" ? "bg-muted border-none" : "bg-primary/10 border-primary/20"
                                    )}
                                >
                                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                                </div>
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm whitespace-pre-wrap",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 border border-primary/5 rounded-tl-none text-foreground"
                                    )}
                                >
                                    {m.content ? (
                                        typeof m.content === 'string'
                                            ? m.content
                                            : Array.isArray(m.content)
                                                ? m.content.map((p: any) => p.text || (typeof p === 'string' ? p : "")).join("")
                                                : String(m.content)
                                    ) : m.parts && Array.isArray(m.parts) ? (
                                        m.parts.map((p: any) => p.text || (typeof p === 'string' ? p : "")).join("")
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="p-1 rounded-full border bg-primary/10 border-primary/20">
                                    <Bot className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="bg-muted/50 border border-primary/5 rounded-2xl rounded-tl-none px-4 py-3 text-[10px] flex gap-2 items-center">
                                    <Loader2 className="w-3 h-3 animate-spin text-primary/60" />
                                    <span className="text-muted-foreground italic font-medium">Инспектор ойлануда...</span>
                                    <div className="flex gap-1 ml-1">
                                        <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background/50">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (input && input.trim()) {
                        handleSubmit(e);
                    }
                }} className="flex w-full gap-2">
                    <Input
                        placeholder="Сұрақ қойыңыз..."
                        value={input || ""}
                        onChange={handleInputChange || (() => { })}
                        className="text-xs h-10 bg-muted/30 focus-visible:ring-primary/20"
                    />
                    <Button type="submit" size="icon" disabled={!input || !input.trim() || isLoading} className="h-10 w-10 shrink-0">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}

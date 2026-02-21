"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, X, MessageCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForensicChatProps {
    context?: any
    isVisible: boolean
    onClose: () => void
}

export function ForensicChat({ context, isVisible, onClose }: ForensicChatProps) {
    const { messages, input = "", handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        body: { context },
    } as any) as any

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!isVisible) return null

    const quickActions = [
        { label: "Рисктерді қорытындылау", prompt: "Осы құжаттағы негізгі коррупциялық рисктерді қысқаша атап бер." },
        { label: "Заң бойынша талдау", prompt: "Табылған бұзушылықтар ҚР заңының қай баптарына қайшы келеді?" },
        { label: "Болашақ қадамдар", prompt: "Осы жағдай бойынша әрі қарай қандай тергеу амалдарын жүргізу керек?" }
    ]

    const handleQuickAction = (prompt: string) => {
        // Manually trigger handleSubmit with the prompt
        handleSubmit(undefined, {
            data: { prompt } // This depends on how exactly useChat handles manual submits, usually we just set input and submit
        })
        // For AI SDK useChat, setting input and then calling handleSubmit is common
    }

    return (
        <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm z-50 animate-in slide-in-from-bottom-5">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 px-6 text-muted-foreground">
                                <div className="p-4 rounded-full bg-primary/5 border border-dashed border-primary/20">
                                    <MessageCircle className="w-8 h-8 text-primary/40" />
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
                                            onClick={() => handleInputChange({ target: { value: action.prompt } } as any)}
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
                                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 border border-primary/5 rounded-tl-none"
                                    )}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="p-1 rounded-full border bg-primary/10 border-primary/20">
                                    <Bot className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="bg-muted/50 border border-primary/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background/50">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        placeholder="Сұрақ қойыңыз..."
                        value={input || ""}
                        onChange={handleInputChange}
                        className="text-xs h-10 bg-muted/30 focus-visible:ring-primary/20"
                    />
                    <Button type="submit" size="icon" disabled={!(input || "").trim() || isLoading} className="h-10 w-10 shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}

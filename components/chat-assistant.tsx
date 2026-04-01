"use client"

import { useState } from "react"
import { ForensicChat } from "./forensic-chat"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Global FAB */}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
                {isOpen && (
                    <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                        <ForensicChat 
                            isVisible={isOpen} 
                            onClose={() => setIsOpen(false)} 
                        />
                    </div>
                )}
                
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-14 w-14 rounded-2xl shadow-2xl transition-all duration-500 border border-white/10 group overflow-hidden",
                        isOpen ? "bg-destructive hover:bg-destructive/90 rotate-90" : "bg-primary hover:bg-primary/90"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isOpen ? (
                        <X className="w-6 h-6 text-white relative z-10" />
                    ) : (
                        <div className="relative">
                            <MessageSquare className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                            <Sparkles className="absolute -top-2 -right-2 w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        </div>
                    )}
                </Button>
            </div>
        </>
    )
}

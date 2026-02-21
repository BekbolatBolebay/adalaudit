"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/lib/i18n"
import { Settings, User, Bell, Shield, Brain, Cpu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsView() {
    const { t, locale, setLocale } = useI18n()

    return (
        <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
            <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    {t("nav.settings")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 flex-1 overflow-auto space-y-6">
                {/* Profile Section */}
                <Card className="bg-secondary/20 border-primary/5">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">СА</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-sm font-bold">{t("user.name")}</h3>
                                <p className="text-xs text-muted-foreground">{t("user.role")}</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto text-[10px] h-8">
                                Редактирау
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* AI Preferences */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5" />
                        AI және Аналитика
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Тереңдетілген талдау</Label>
                                <p className="text-[10px] text-muted-foreground">Әрбір сөйлемді заң нормаларымен тексеру</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Автоматты аударма</Label>
                                <p className="text-[10px] text-muted-foreground">Жүктелген бойда қазақ тіліне аудару</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-primary">{t("settings.demo_mode")}</Label>
                                <p className="text-[10px] text-muted-foreground">{t("settings.demo_mode.sub")}</p>
                            </div>
                            <Switch
                                checked={typeof window !== 'undefined' && localStorage.getItem("demo_mode") === "true"}
                                onCheckedChange={(checked) => {
                                    localStorage.setItem("demo_mode", checked.toString())
                                    // Force a small delay then reload to apply globally OR just trigger a storage event
                                    window.dispatchEvent(new Event('storage'))
                                    window.location.reload() // Simplest way to ensure all hooks/APIs get the new state
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" />
                        Жүйелік баптаулар
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Интерфейс тілі</Label>
                                <p className="text-[10px] text-muted-foreground">Платформаның негізгі қолдану тілі</p>
                            </div>
                            <Select value={locale} onValueChange={(v: any) => setLocale(v)}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kz" className="text-xs">Қазақ тілі</SelectItem>
                                    <SelectItem value="ru" className="text-xs">Русский язык</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Қауіпсіздік хабарламалары</Label>
                                <p className="text-[10px] text-muted-foreground">Сыни қауіптер туралы жедел ескерту</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/5 flex justify-end gap-3">
                    <Button variant="ghost" className="text-xs">Қалпына келтіру</Button>
                    <Button className="text-xs bg-primary hover:bg-primary/90">Сақтау</Button>
                </div>
            </CardContent>
        </Card>
    )
}

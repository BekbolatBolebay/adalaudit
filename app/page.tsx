"use client"

import { I18nProvider } from "@/lib/i18n"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <I18nProvider>
      <Dashboard />
    </I18nProvider>
  )
}

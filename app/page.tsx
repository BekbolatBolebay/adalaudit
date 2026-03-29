"use client"

import { useState } from "react"
import { I18nProvider } from "@/lib/i18n"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <I18nProvider>
      {showDashboard ? (
        <Dashboard />
      ) : (
        <LandingPage onStart={() => setShowDashboard(true)} />
      )}
    </I18nProvider>
  )
}

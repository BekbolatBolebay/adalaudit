"use client"

import { useState, useEffect } from "react"
import { I18nProvider } from "@/lib/i18n"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"
import { AnimatePresence, motion } from "framer-motion"

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(false)

  // Sync state with URL hash for back button support
  useEffect(() => {
    const handleHashChange = () => {
      setShowDashboard(window.location.hash === "#dashboard")
    }
    
    // Initial check
    handleHashChange()
    
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleStart = () => {
    window.location.hash = "dashboard"
  }

  return (
    <I18nProvider>
      <AnimatePresence mode="wait">
        {showDashboard ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
          >
            <LandingPage onStart={handleStart} />
          </motion.div>
        )}
      </AnimatePresence>
    </I18nProvider>
  )
}

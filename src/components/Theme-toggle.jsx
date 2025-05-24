"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed right-4 bottom-4 z-[99] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
    >
      {/* Light mode icon (sun) */}
      <Sun className="h-4 w-4 block dark:hidden" />

      {/* Dark mode icon (moon) */}
      <Moon className="h-4 w-4 hidden dark:block" />
    </motion.button>
  )
}

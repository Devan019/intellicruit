import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/providers/theme-provider"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Intellicruit - AI-Powered Hiring Platform",
  description: "Revolutionize your hiring process with AI-powered recruitment solutions",
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
              <Navbar />
              <main className="pt-16">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

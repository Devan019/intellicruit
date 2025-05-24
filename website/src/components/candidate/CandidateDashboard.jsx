"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, User, Heart, TrendingUp, Menu, X, Target, FileText } from "lucide-react"
import DashboardOverview from "./DashboardOverview"
import JobRecommendations from "./JobRecommendations"
import ApplicationTracker from "./ApplicationTracker"
import SavedJobs from "./SavedJobs"
import JobAnalytics from "./JobAnalytics"
import CandidateProfile from "./CandidateProfile"

export default function CandidateDashboard() {
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minHeight, setMinHeight] = useState("100vh")

  useEffect(() => {
    const updateHeight = () => {
      setMinHeight(`calc(100vh - 4rem)`)
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "recommendations", label: "Job Recommendations", icon: Target },
    { id: "applications", label: "My Applications", icon: FileText },
    { id: "saved-jobs", label: "Saved Jobs", icon: Heart },
    { id: "analytics", label: "Career Analytics", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="flex h-full" style={{ minHeight }}>
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Sidebar */}
        <div
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 left-0 z-40 w-64 
          bg-white dark:bg-gray-800 shadow-lg h-full top-16 lg:top-0
        `}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your career journey</p>
          </div>
          <nav className="mt-6">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 5 }}
                onClick={() => {
                  setActiveView(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  activeView === item.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-full bg-white dark:bg-gray-900 transition-colors duration-200 lg:ml-0">
          {activeView === "overview" && <DashboardOverview />}
          {activeView === "recommendations" && <JobRecommendations />}
          {activeView === "applications" && <ApplicationTracker />}
          {activeView === "saved-jobs" && <SavedJobs />}
          {activeView === "analytics" && <JobAnalytics />}
          {activeView === "profile" && <CandidateProfile />}
        </div>
      </div>
    </div>
  )
}

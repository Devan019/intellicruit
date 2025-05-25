"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Briefcase, Users, BarChart3, Menu, X } from 'lucide-react'
import JobPostingForm from "./JobPostingForm"
import JobListings from "./AllJobs"

export default function HRDashboard() {
  const [activeView, setActiveView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minHeight, setMinHeight] = useState("100vh")

  useEffect(() => {
    const updateHeight = () => {
      setMinHeight(`calc(100vh - 4rem)`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'create-job', label: 'Create Job', icon: Plus },
    { id: 'job-listings', label: 'Job Listings', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users }
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
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 left-0 z-40 w-64 
          bg-white dark:bg-gray-800 shadow-lg h-full top-16 lg:top-0
        `}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">HR Dashboard</h2>
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
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${activeView === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
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
          {activeView === 'overview' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Overview</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Active Jobs</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Total Applications</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">248</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Pending Reviews</h3>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">35</p>
                </motion.div>
              </div>
            </div>
          )}

          {activeView === 'create-job' && <JobPostingForm />}

          {activeView === 'job-listings' && (
            <JobListings />
          )}

          {activeView === 'candidates' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Candidates</h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-600 dark:text-gray-300">Candidate management will be displayed here...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

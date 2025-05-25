import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User,
  Briefcase,
  BarChart3,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import Profile from "./Profile"
import JobSearch from "./candidate/JobSearch"
import JobInsights from "./candidate/JobInsights"
import axios from "axios"
import { useRouter } from "next/navigation"
import { IconBriefcase2Filled } from "@tabler/icons-react"
import Recommendations from "./candidate/Recommadation"
import CareerRecommender from "./CareerRecommender"

export default function CandidateDashboard() {
  const [activeView, setActiveView] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minHeight, setMinHeight] = useState("100vh")
  const router = useRouter();
   useEffect(() => {
      const checkUserRole = async () => {
        try {
          const response = await axios.get('/api/get-role')
          const role = response.data.role
          console.log("User role:", role)
          if (role !== 'Candidate') {
            router.push('/')
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          router.push('/')
        }
      }
  
      checkUserRole()
  
    },[])

  useEffect(() => {
    const updateHeight = () => {
      setMinHeight(`calc(100vh - 4rem)`)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'jobs', label: 'Job Search', icon: Briefcase },
    { id: 'job Insights', label: 'Job Insights', icon: BarChart3 },
    { id: 'job recommendations', label: 'Job Recommendations', icon: IconBriefcase2Filled },
    { id: 'resume-tips', label: 'Resume Tips', icon: FileText },
     { id: 'career-recommender', label: 'Career Recommender', icon: FileText },
  ]

  return (
    <div className="min-h-screen pt-16 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <div className="flex h-full" style={{ minHeight }}>
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-md shadow-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Sidebar */}
        <div
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            fixed lg:static inset-y-0 left-0 z-40 w-64 
            shadow-lg h-full top-16 lg:top-0
            bg-white dark:bg-gray-800
          `}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Candidate Portal</h2>
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
                className={`w-full flex items-center px-6 py-3 text-left transition-colors
                  ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
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
          {activeView === 'profile' && <Profile />}
          {activeView === 'jobs' && <JobSearch />}
          {activeView === 'job Insights' && <JobInsights />}
          {activeView === 'job recommendations' && <Recommendations />}
          {activeView === 'resume-tips' && <div className="p-6">Resume Tips View (Coming Soon)</div>}
          {activeView === 'career-recommender' &&  <CareerRecommender />}
        </div>
      </div>
    </div>
  )
}

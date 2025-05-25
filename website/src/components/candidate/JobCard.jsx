"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, DollarSign, Briefcase, Video } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function JobCard({ job }) {
  const { theme } = useTheme()

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`p-6 rounded-xl border transition-all ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 hover:shadow-xl' 
          : 'bg-white border-gray-200 shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {job.title}
              </h3>
              <p className={`text-lg mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {job.company}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {job.settings?.enableAptitudeTest && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  theme === 'dark' 
                    ? 'bg-orange-900 text-orange-200' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  Aptitude Test Required
                </span>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                theme === 'dark' 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {job.status || 'Open'}
              </span>
            </div>
          </div>

          <div className={`flex flex-wrap gap-4 mb-4 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.jobType?.charAt(0).toUpperCase() + job.jobType?.slice(1).replace("-", " ")}
            </div>
            {job.salaryRange && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.salaryRange.min} - {job.salaryRange.max}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {getTimeAgo(job.createdAt)}
            </div>
          </div>

          <p className={`mb-4 line-clamp-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.requirements?.slice(0, 3).map((req, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {req}
              </span>
            ))}
            {job.requirements?.length > 3 && (
              <span className={`px-3 py-1 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                +{job.requirements.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {job.applicants || 0} applicants
            </span>
            <div className="flex flex-wrap gap-2">
              <Link href={`/jobs/${job._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  View Details
                </motion.button>
              </Link>
              
              <Link href={`/interview/${job._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Video className="w-4 h-4" />
                  Mock Interview
                </motion.button>
              </Link>
              
              <Link href={`/apply/${job._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Apply Now
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
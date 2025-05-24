"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MapPin, DollarSign, Clock, Briefcase, Search, Filter, Trash2, ExternalLink, Star, Calendar } from 'lucide-react'
import Link from "next/link"

export default function SavedJobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  // Mock saved jobs data
  const [savedJobs, setSavedJobs] = useState([
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechFlow Inc.",
      location: "San Francisco, CA",
      salary: "$130k - $170k",
      savedDate: "2024-01-15",
      type: "full-time",
      remote: true,
      urgent: false,
      description: "Join our team to build next-generation web applications using React and modern technologies.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      match: 98,
      applied: false,
    },
    {
      id: 2,
      title: "Frontend Engineer",
      company: "StartupXYZ",
      location: "Austin, TX",
      salary: "$90k - $120k",
      savedDate: "2024-01-14",
      type: "full-time",
      remote: false,
      urgent: true,
      description: "Build beautiful and responsive user interfaces for our fintech platform.",
      skills: ["React", "JavaScript", "CSS", "Redux"],
      match: 95,
      applied: true,
    },
    {
      id: 3,
      title: "UI/UX Developer",
      company: "DesignCorp",
      location: "Los Angeles, CA",
      salary: "$95k - $125k",
      savedDate: "2024-01-13",
      type: "full-time",
      remote: false,
      urgent: false,
      description: "Bridge the gap between design and development in our creative team.",
      skills: ["React", "Figma", "CSS", "Design Systems"],
      match: 85,
      applied: false,
    },
    {
      id: 4,
      title: "Full Stack Developer",
      company: "WebTech Solutions",
      location: "Seattle, WA",
      salary: "$85k - $110k",
      savedDate: "2024-01-12",
      type: "contract",
      remote: true,
      urgent: false,
      description: "Work on both frontend and backend development for e-commerce solutions.",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      match: 92,
      applied: false,
    },
    {
      id: 5,
      title: "JavaScript Developer",
      company: "CodeCraft",
      location: "Denver, CO",
      salary: "$80k - $105k",
      savedDate: "2024-01-10",
      type: "full-time",
      remote: true,
      urgent: false,
      description: "Work with modern JavaScript technologies in a collaborative environment.",
      skills: ["JavaScript", "Vue.js", "Node.js", "PostgreSQL"],
      match: 82,
      applied: false,
    },
  ])

  const filterOptions = [
    { value: "all", label: "All Saved Jobs" },
    { value: "not-applied", label: "Not Applied" },
    { value: "applied", label: "Already Applied" },
    { value: "remote", label: "Remote Only" },
    { value: "urgent", label: "Urgent Hiring" },
  ]

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    switch (filter) {
      case "not-applied":
        matchesFilter = !job.applied
        break
      case "applied":
        matchesFilter = job.applied
        break
      case "remote":
        matchesFilter = job.remote
        break
      case "urgent":
        matchesFilter = job.urgent
        break
      default:
        matchesFilter = true
    }
    
    return matchesSearch && matchesFilter
  })

  const removeSavedJob = (jobId) => {
    setSavedJobs(savedJobs.filter(job => job.id !== jobId))
  }

  const getMatchColor = (match) => {
    if (match >= 90) return "text-green-600 dark:text-green-400"
    if (match >= 80) return "text-blue-600 dark:text-blue-400"
    if (match >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const getMatchBg = (match) => {
    if (match >= 90) return "bg-green-100 dark:bg-green-900/20"
    if (match >= 80) return "bg-blue-100 dark:bg-blue-900/20"
    if (match >= 70) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-gray-100 dark:bg-gray-700"
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Saved Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Keep track of interesting opportunities for later review
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{savedJobs.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Saved</div>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {savedJobs.filter(job => !job.applied).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Not Applied</div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {savedJobs.filter(job => job.applied).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Applied</div>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {savedJobs.filter(job => job.urgent).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Saved Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                  {job.urgent && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
                      Urgent
                    </span>
                  )}
                  {job.remote && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                      Remote
                    </span>
                  )}
                  {job.applied && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                      Applied
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getMatchBg(job.match)}`}>
                  <Star className={`h-3 w-3 ${getMatchColor(job.match)}`} />
                  <span className={`text-xs font-medium ${getMatchColor(job.match)}`}>{job.match}%</span>
                </div>
                <button
                  onClick={() => removeSavedJob(job.id)}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.salary}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Saved {new Date(job.savedDate).toLocaleDateString()}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm line-clamp-2">{job.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map((skill, skillIndex) => (
                <span
                  key={skillIndex}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Link href={`/jobs/${job.id}`} className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </motion.button>
              </Link>
              {!job.applied && (
                <Link href={`/apply/${job.id}`} className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Apply Now
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {savedJobs.length === 0 ? "No saved jobs yet" : "No jobs found"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {savedJobs.length === 0 
              ? "Start saving jobs you're interested in to keep track of them here"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {savedJobs.length === 0 && (
            <Link href="/jobs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Browse Jobs
              </motion.button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

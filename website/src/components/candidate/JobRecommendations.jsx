"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Target, MapPin, DollarSign, Clock, Briefcase, Star, Heart, ExternalLink, Sparkles } from "lucide-react"
import Link from "next/link"

export default function JobRecommendations() {
  const [filter, setFilter] = useState("all")

  // Mock recommended jobs data
  const recommendedJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechFlow Solutions",
      location: "San Francisco, CA",
      salary: "$130,000 - $170,000",
      type: "full-time",
      matchScore: 95,
      postedDate: "2024-01-16",
      description: "Join our team building next-generation web applications with React and TypeScript...",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      reasons: ["Matches your React expertise", "Salary aligns with expectations", "Company culture fit: 92%"],
      saved: false,
      urgent: false,
    },
    {
      id: 2,
      title: "Frontend Engineering Lead",
      company: "InnovateX",
      location: "Remote",
      salary: "$140,000 - $180,000",
      type: "full-time",
      matchScore: 92,
      postedDate: "2024-01-15",
      description: "Lead a team of frontend engineers in building scalable web applications...",
      skills: ["React", "Leadership", "JavaScript", "CSS"],
      reasons: ["Leadership experience match", "Remote work preference", "Tech stack alignment: 95%"],
      saved: true,
      urgent: true,
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "StartupHub",
      location: "Austin, TX",
      salary: "$110,000 - $140,000",
      type: "full-time",
      matchScore: 88,
      postedDate: "2024-01-14",
      description: "Build end-to-end solutions in a fast-paced startup environment...",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      reasons: ["Full-stack skills match", "Startup environment preference", "Growth opportunity: High"],
      saved: false,
      urgent: false,
    },
    {
      id: 4,
      title: "UI/UX Frontend Developer",
      company: "DesignTech Co.",
      location: "New York, NY",
      salary: "$120,000 - $150,000",
      type: "full-time",
      matchScore: 85,
      postedDate: "2024-01-13",
      description: "Collaborate with designers to create beautiful, functional user interfaces...",
      skills: ["React", "CSS", "Figma", "Design Systems"],
      reasons: ["Design collaboration interest", "UI/UX skills alignment", "Company benefits: Excellent"],
      saved: false,
      urgent: false,
    },
  ]

  const filteredJobs =
    filter === "all"
      ? recommendedJobs
      : filter === "saved"
        ? recommendedJobs.filter((job) => job.saved)
        : filter === "urgent"
          ? recommendedJobs.filter((job) => job.urgent)
          : recommendedJobs.filter((job) => job.matchScore >= 90)

  const getMatchColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 80) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getMatchBg = (score) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 80) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const toggleSaved = (jobId) => {
    // In real app, this would update the backend
    console.log("Toggle saved for job:", jobId)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Recommendations</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized job matches based on your profile, skills, and preferences
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Recommendations", count: recommendedJobs.length },
            {
              id: "high-match",
              label: "High Match (90%+)",
              count: recommendedJobs.filter((j) => j.matchScore >= 90).length,
            },
            { id: "saved", label: "Saved", count: recommendedJobs.filter((j) => j.saved).length },
            { id: "urgent", label: "Urgent", count: recommendedJobs.filter((j) => j.urgent).length },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white"
      >
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <div>
            <h3 className="font-semibold">AI-Powered Matching</h3>
            <p className="text-sm text-purple-100">
              Our AI analyzed 1,247 jobs and found {recommendedJobs.length} perfect matches for your profile
            </p>
          </div>
        </div>
      </motion.div>

      {/* Job Recommendations */}
      <div className="space-y-6">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {job.title}
                        {job.urgent && (
                          <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400">{job.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchBg(job.matchScore)}`}>
                        <Star className={`h-4 w-4 inline mr-1 ${getMatchColor(job.matchScore)}`} />
                        <span className={getMatchColor(job.matchScore)}>{job.matchScore}% Match</span>
                      </div>
                      <button
                        onClick={() => toggleSaved(job.id)}
                        className={`p-2 rounded-full transition-colors ${
                          job.saved ? "text-red-600 hover:text-red-700" : "text-gray-400 hover:text-red-600"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${job.saved ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace("-", " ")}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Match Reasons */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Why this is a great match:</h4>
                    <ul className="space-y-1">
                      {job.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </motion.button>
                    </Link>
                    <Link href={`/apply/${job.id}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Apply Now
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recommendations found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or update your profile to get better matches
          </p>
        </div>
      )}
    </div>
  )
}

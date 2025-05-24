"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, DollarSign, Briefcase, Users, Calendar, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function JobDetails({ jobId }) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock job data - in real app, this would come from API
  const mockJob = {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    jobType: "full-time",
    experienceLevel: "senior",
    department: "Engineering",
    salary: "$120,000 - $160,000",
    description: `We're looking for a senior frontend developer to join our innovative team at TechCorp Inc. You'll be working on cutting-edge web applications that serve millions of users worldwide.

As a Senior Frontend Developer, you'll collaborate with our design and backend teams to create exceptional user experiences. You'll have the opportunity to mentor junior developers and contribute to architectural decisions.

Our tech stack includes React, TypeScript, Next.js, and modern CSS frameworks. We value clean code, testing, and continuous learning.`,
    responsibilities: [
      "Develop and maintain high-quality frontend applications using React and TypeScript",
      "Collaborate with UX/UI designers to implement pixel-perfect designs",
      "Optimize applications for maximum speed and scalability",
      "Mentor junior developers and conduct code reviews",
      "Participate in architectural decisions and technical planning",
      "Write comprehensive tests and documentation",
      "Stay up-to-date with the latest frontend technologies and best practices",
    ],
    requirements: [
      "5+ years of experience in frontend development",
      "Expert knowledge of React, JavaScript, and TypeScript",
      "Experience with modern build tools and workflows",
      "Strong understanding of responsive design and cross-browser compatibility",
      "Experience with testing frameworks (Jest, React Testing Library)",
      "Knowledge of performance optimization techniques",
      "Excellent communication and teamwork skills",
      "Bachelor's degree in Computer Science or equivalent experience",
    ],
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Next.js",
      "Redux",
      "GraphQL",
      "REST APIs",
      "Git",
      "Webpack",
      "Jest",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "401(k) with company matching",
      "Flexible work arrangements and remote options",
      "Professional development budget",
      "Unlimited PTO policy",
      "Modern office with free meals and snacks",
      "Team building events and company retreats",
    ],
    postedDate: "2024-01-15",
    applicationDeadline: "2024-02-15",
    hasAptitudeTest: true,
    applicants: 45,
    companyInfo: {
      size: "500-1000 employees",
      industry: "Technology",
      founded: "2015",
      website: "https://techcorp.com",
    },
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJob(mockJob)
      setLoading(false)
    }, 1000)
  }, [jobId])

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/jobs">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </motion.button>
        </Link>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{job.company}</p>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace("-", " ")}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted {getTimeAgo(job.postedDate)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {job.applicants} applicants
                </div>
              </div>

              {job.hasAptitudeTest && (
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg text-sm mb-4">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Aptitude Test Required
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <Link href={`/apply/${job.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Apply Now
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Save Job
              </motion.button>
            </div>
          </div>

          {job.applicationDeadline && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <Calendar className="h-4 w-4 mr-2" />
              Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                {job.description.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-300">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits & Perks</h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About {job.company}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                  <span className="text-gray-900 dark:text-white">{job.companyInfo.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Company Size:</span>
                  <span className="text-gray-900 dark:text-white">{job.companyInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Founded:</span>
                  <span className="text-gray-900 dark:text-white">{job.companyInfo.founded}</span>
                </div>
                <a
                  href={job.companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </motion.div>

            {/* Apply CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-2">Ready to Apply?</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Join our team and make an impact with cutting-edge technology.
              </p>
              <Link href={`/apply/${job.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Apply Now
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

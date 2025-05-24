"use client"

import { motion } from "framer-motion"
import {
  Briefcase,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react"
import Link from "next/link"

export default function DashboardOverview() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalApplications: 12,
    pendingApplications: 5,
    interviewsScheduled: 2,
    savedJobs: 8,
    profileViews: 34,
    responseRate: 67,
  }

  const recentApplications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      appliedDate: "2024-01-15",
      status: "interview",
      nextStep: "Technical Interview on Jan 20",
    },
    {
      id: 2,
      jobTitle: "Product Manager",
      company: "InnovateLabs",
      appliedDate: "2024-01-14",
      status: "pending",
      nextStep: "Waiting for response",
    },
    {
      id: 3,
      jobTitle: "UX Designer",
      company: "DesignStudio",
      appliedDate: "2024-01-13",
      status: "rejected",
      nextStep: "Application not selected",
    },
  ]

  const upcomingInterviews = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      date: "2024-01-20",
      time: "2:00 PM",
      type: "Technical Interview",
      interviewer: "Sarah Johnson",
    },
    {
      id: 2,
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      date: "2024-01-22",
      time: "10:00 AM",
      type: "Final Round",
      interviewer: "Mike Chen",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "interview":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "interview":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's an overview of your job search progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Applications</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews Scheduled</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.savedJobs}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.profileViews}</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.responseRate}%</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
              <Link href="/dashboard?view=applications">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{application.jobTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.company}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Applied on {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                    >
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{application.nextStep}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Interviews</h2>
          </div>
          <div className="p-6">
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{interview.jobTitle}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{interview.company}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {new Date(interview.date).toLocaleDateString()} at {interview.time}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {interview.type} with {interview.interviewer}
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        Prepare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No upcoming interviews</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Keep applying to schedule more interviews!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white"
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/jobs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-left"
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <h3 className="font-medium">Browse Jobs</h3>
              <p className="text-sm text-blue-100">Find new opportunities</p>
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-left"
          >
            <User className="h-6 w-6 mb-2" />
            <h3 className="font-medium">Update Profile</h3>
            <p className="text-sm text-blue-100">Keep your profile current</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-left"
          >
            <TrendingUp className="h-6 w-6 mb-2" />
            <h3 className="font-medium">View Analytics</h3>
            <p className="text-sm text-blue-100">Track your progress</p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

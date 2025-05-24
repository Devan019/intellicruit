"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Clock, CheckCircle, XCircle, Calendar, MapPin, Building, Search, MessageSquare } from "lucide-react"

export default function ApplicationTracker() {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock applications data
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      appliedDate: "2024-01-15",
      status: "interview",
      stage: "Technical Interview",
      nextStep: "Technical Interview scheduled for Jan 20, 2:00 PM",
      interviewer: "Sarah Johnson",
      notes: "Completed initial screening. Technical round focuses on React and system design.",
      timeline: [
        { stage: "Applied", date: "2024-01-15", completed: true },
        { stage: "Screening", date: "2024-01-16", completed: true },
        { stage: "Technical", date: "2024-01-20", completed: false, current: true },
        { stage: "Final", date: "TBD", completed: false },
        { stage: "Offer", date: "TBD", completed: false },
      ],
    },
    {
      id: 2,
      jobTitle: "Product Manager",
      company: "InnovateLabs",
      location: "New York, NY",
      appliedDate: "2024-01-14",
      status: "pending",
      stage: "Application Review",
      nextStep: "Waiting for initial response from hiring team",
      notes: "Application submitted with cover letter highlighting PM experience.",
      timeline: [
        { stage: "Applied", date: "2024-01-14", completed: true, current: true },
        { stage: "Screening", date: "TBD", completed: false },
        { stage: "Interview", date: "TBD", completed: false },
        { stage: "Final", date: "TBD", completed: false },
        { stage: "Offer", date: "TBD", completed: false },
      ],
    },
    {
      id: 3,
      jobTitle: "UX Designer",
      company: "DesignStudio",
      location: "Remote",
      appliedDate: "2024-01-13",
      status: "rejected",
      stage: "Application Review",
      nextStep: "Application was not selected for this position",
      notes: "Feedback: Portfolio was impressive but looking for more enterprise UX experience.",
      timeline: [
        { stage: "Applied", date: "2024-01-13", completed: true },
        { stage: "Review", date: "2024-01-15", completed: true },
        { stage: "Rejected", date: "2024-01-16", completed: true, current: true },
      ],
    },
    {
      id: 4,
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Austin, TX",
      appliedDate: "2024-01-12",
      status: "interview",
      stage: "Final Interview",
      nextStep: "Final interview with CEO scheduled for Jan 22, 10:00 AM",
      interviewer: "Mike Chen (CEO)",
      notes: "Passed technical assessment. Final round focuses on culture fit and vision alignment.",
      timeline: [
        { stage: "Applied", date: "2024-01-12", completed: true },
        { stage: "Screening", date: "2024-01-13", completed: true },
        { stage: "Technical", date: "2024-01-16", completed: true },
        { stage: "Final", date: "2024-01-22", completed: false, current: true },
        { stage: "Offer", date: "TBD", completed: false },
      ],
    },
    {
      id: 5,
      jobTitle: "React Developer",
      company: "WebFlow Agency",
      location: "Los Angeles, CA",
      appliedDate: "2024-01-10",
      status: "accepted",
      stage: "Offer Received",
      nextStep: "Offer received! Deadline to respond: Jan 25",
      notes: "Excellent interview process. Offer includes equity and remote work options.",
      timeline: [
        { stage: "Applied", date: "2024-01-10", completed: true },
        { stage: "Screening", date: "2024-01-11", completed: true },
        { stage: "Technical", date: "2024-01-14", completed: true },
        { stage: "Final", date: "2024-01-17", completed: true },
        { stage: "Offer", date: "2024-01-18", completed: true, current: true },
      ],
    },
  ]

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === "all" || app.status === filter
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "interview":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
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

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    interview: applications.filter((app) => app.status === "interview").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Tracker</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Track the progress of all your job applications in one place</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Applications" },
            { id: "pending", label: "Pending" },
            { id: "interview", label: "Interview" },
            { id: "accepted", label: "Accepted" },
            { id: "rejected", label: "Rejected" },
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
              {filterOption.label} ({statusCounts[filterOption.id]})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {application.jobTitle}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="mr-4">{application.company}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{application.location}</span>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
                    >
                      {getStatusIcon(application.status)}
                      <span className="ml-2 capitalize">{application.status}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Applied on {new Date(application.appliedDate).toLocaleDateString()} • Current stage:{" "}
                    {application.stage}
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Application Progress</h4>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {application.timeline.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center flex-shrink-0">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                step.completed
                                  ? "border-green-500 bg-green-500 text-white"
                                  : step.current
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : step.current ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-medium">{stepIndex + 1}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                              {step.stage}
                            </span>
                            {step.date !== "TBD" && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(step.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {stepIndex < application.timeline.length - 1 && (
                            <div
                              className={`w-8 h-0.5 ${
                                step.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Step */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Next Step</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">{application.nextStep}</p>
                    {application.interviewer && (
                      <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                        Interviewer: {application.interviewer}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  {application.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white">Notes</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{application.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                    {application.status === "interview" && (
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                        Prepare for Interview
                      </button>
                    )}
                    {application.status === "accepted" && (
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                        Review Offer
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Start applying to jobs to track your progress here"}
          </p>
        </div>
      )}
    </div>
  )
}

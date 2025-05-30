"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import AptitudeTest from "./AptitudeTest"
import ApplicationForm from "./ApplicationForm"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"

export default function JobApplication({ jobId }) {
  const [job, setJob] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [parsedResumeData, setparsedResumeData] = useState(false);
  const [isgiven, setisgiven] = useState(false)
  
  const { userId } = useAuth()

  const getJobVisId = async () => {
    const api = await axios.get(`/api/job/${jobId}`)
    return api.data
  }

  useEffect(() => {
    const fetchapplied = async () => {
      try {
        const response = await axios.post('/api/job/applied', { clerk_id: userId, job_id: jobId })
        console.log(response.data)
        setisgiven(response.data.applied)
      } catch (error) {
        console.error("Error checking application status:", error)
      }
    }
    fetchapplied()

  }, [])

  useEffect(() => {
    setLoading(true)
    const fetchJob = async () => {
      try {
        const jobData = await getJobVisId()
        setJob(jobData.job)
      } catch (error) {
        console.error("Error fetching job details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])
  const handleTestComplete = (result) => {
    setTestResult(result)
    if (result.passed) {
      setCurrentStep(2)
    }
  }

  const handleApplicationSubmit = (applicationData) => {
    console.log("Application submitted:", applicationData)
    setCurrentStep(3)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
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
        <Link href={`/jobs/${job._id}`}>
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </motion.button>
        </Link>

        {/* Check if user has already applied */}
        {isgiven && (
          <div className="mb-4">
            <AlertCircle className="h-5 w-5 inline-block mr-2" />
            You have already applied for this job.
          </div>
        )}


      {!isgiven && (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Apply for {job.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
          </motion.div>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {/* Step 1: Aptitude Test */}
                {job.settings?.enableAptitudeTest && (
                  <>
                    <div
                      className={`flex items-center ${currentStep >= 1 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep > 1
                          ? "border-green-600 bg-green-600 text-white"
                          : currentStep === 1
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300"
                          }`}
                      >
                        {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
                      </div>
                      <span className="ml-2 font-medium">Aptitude Test</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />
                  </>
                )}

                {/* Step 2: Application Form */}
                <div
                  className={`flex items-center ${currentStep >= (job.settings?.enableAptitudeTest ? 2 : 1) ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep > (job.settings?.enableAptitudeTest ? 2 : 1)
                      ? "border-green-600 bg-green-600 text-white"
                      : currentStep === (job.settings?.enableAptitudeTest ? 2 : 1)
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300"
                      }`}
                  >
                    {currentStep > (job.settings?.enableAptitudeTest ? 2 : 1) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : job.settings?.enableAptitudeTest ? (
                      "2"
                    ) : (
                      "1"
                    )}
                  </div>
                  <span className="ml-2 font-medium">Application</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />

                {/* Step 3: Confirmation */}
                <div
                  className={`flex items-center ${currentStep >= (job.settings?.enableAptitudeTest ? 3 : 2) ? "text-green-600 dark:text-green-400" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= (job.settings?.enableAptitudeTest ? 3 : 2)
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300"
                      }`}
                  >
                    {currentStep >= (job.settings?.enableAptitudeTest ? 3 : 2) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : job.settings?.enableAptitudeTest ? (
                      "3"
                    ) : (
                      "2"
                    )}
                  </div>

                  <span className="ml-2 font-medium">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on current step */}
          {currentStep === 1 && job.settings?.enableAptitudeTest && (
            <AptitudeTest  job_id={job._id} test={job.aptitudeTest} onComplete={handleTestComplete} />
          )}

          {((currentStep === 2 && job.settings?.enableAptitudeTest) || (currentStep === 1 && !job.settings?.enableAptitudeTest)) && (
            <ApplicationForm job={job} testResult={testResult} onSubmit={handleApplicationSubmit} parsedResumeData={parsedResumeData} setparsedResumeData={setparsedResumeData} />
          )}

          {currentStep === (job.settings?.enableAptitudeTest ? 3 : 2) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for applying to {job.title} at {job.company}. We'll review your application and get back to you
                soon.
              </p>
              {testResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <p className="text-green-800 dark:text-green-200">Aptitude Test Score: {testResult.score}% (Passed)</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/jobs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Browse More Jobs
                  </motion.button>
                </Link>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    View Applications
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Test Failed State */}
          {testResult && !testResult.passed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center mt-8"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Test Not Passed</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unfortunately, you didn't meet the minimum score requirement for this position. Your score:{" "}
                {testResult.score}% (Required: {job.aptitudeTest.passingScore}%)
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/jobs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Browse Other Jobs
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}


    </div>
    </div >
  )
}

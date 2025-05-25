"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Settings, TestTube, Users } from 'lucide-react'
import JobDescriptionForm from "@/components/forms/JobDescriptionForm"
import AptitudeTestBuilder from "@/components/AptitudeTestBuilder"
import axios from "axios"

export default function JobPostingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [jobDescription, setJobDescription] = useState(null)
  const [aptitudeTest, setAptitudeTest] = useState(null)
  const [postingSettings, setPostingSettings] = useState({
    enableAptitudeTest: false,
    maxApplications: 100,
    autoScreening: true,
    emailNotifications: true,
    publishImmediately: true
  })

  const steps = [
    { id: 1, name: "Job Description", icon: Eye, component: "description" },
    { id: 2, name: "Aptitude Test", icon: TestTube, component: "test" },
    { id: 3, name: "Settings", icon: Settings, component: "settings" },
    { id: 4, name: "Review & Publish", icon: Users, component: "review" }
  ]

  const handleJobDescriptionSubmit = (data) => {
    setJobDescription(data)
    setCurrentStep(2)
  }

  const handleTestSave = (data) => {
    setAptitudeTest(data)
    setCurrentStep(3)
  }

  const handlePublish = async() => {

    const jobPosting = {
      jobDescription,
      aptitudeTest: postingSettings.enableAptitudeTest ? aptitudeTest : null,
      settings: postingSettings,
      createdAt: new Date(),
      status: 'active'
    }

    console.log('Submitting job posting:', jobPosting);

    const api = await axios.post("/api/job",jobPosting);
    const res = api.data;
    console.log(res);
    
    console.log('Publishing job posting:', jobPosting)
    alert('Job posting published successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-6 lg:mb-8">
          <nav className="flex justify-center">
            <ol className="flex items-center space-x-2 sm:space-x-5 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center">
                  <div className={`flex items-center ${
                    step.id < currentStep 
                      ? 'text-green-600 dark:text-green-400' 
                      : step.id === currentStep 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                      step.id < currentStep 
                        ? 'border-green-600 bg-green-600 text-white' 
                        : step.id === currentStep 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="ml-2 text-xs sm:text-sm font-medium hidden sm:block">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 sm:w-12 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2 sm:mx-4" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <JobDescriptionForm onSubmit={handleJobDescriptionSubmit} />
        )}

        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enableTest"
                  checked={postingSettings.enableAptitudeTest}
                  onChange={(e) => setPostingSettings({
                    ...postingSettings,
                    enableAptitudeTest: e.target.checked
                  })}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableTest" className="font-medium text-gray-900 dark:text-gray-100">
                  Enable Aptitude Test for this position
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When enabled, candidates must pass the aptitude test before they can submit their application.
              </p>
            </div>

            {postingSettings.enableAptitudeTest ? (
              <AptitudeTestBuilder onSave={handleTestSave} />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <TestTube className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No aptitude test required
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Candidates can apply directly without taking a test.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(3)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Continue to Settings
                </motion.button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Job Posting Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Maximum Applications</label>
                <input
                  type="number"
                  min="1"
                  value={postingSettings.maxApplications}
                  onChange={(e) => setPostingSettings({
                    ...postingSettings,
                    maxApplications: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-4">
                {[
                  { key: 'autoScreening', label: 'Enable AI Auto-Screening' },
                  { key: 'emailNotifications', label: 'Email Notifications' },
                  { key: 'publishImmediately', label: 'Publish Immediately' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={setting.key}
                      checked={postingSettings[setting.key]}
                      onChange={(e) => setPostingSettings({
                        ...postingSettings,
                        [setting.key]: e.target.checked
                      })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={setting.key} className="text-gray-900 dark:text-gray-100">{setting.label}</label>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(4)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Continue to Review
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Review & Publish</h2>
            
            <div className="space-y-6">
              {/* Job Summary */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Job Description Summary</h3>
                {jobDescription && (
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Title:</strong> {jobDescription.title}</p>
                    <p><strong>Department:</strong> {jobDescription.department}</p>
                    <p><strong>Location:</strong> {jobDescription.location}</p>
                    <p><strong>Type:</strong> {jobDescription.jobType}</p>
                  </div>
                )}
              </div>

              {/* Test Summary */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Aptitude Test</h3>
                {postingSettings.enableAptitudeTest && aptitudeTest ? (
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Test Title:</strong> {aptitudeTest.title}</p>
                    <p><strong>Questions:</strong> {aptitudeTest.questions.length}</p>
                    <p><strong>Time Limit:</strong> {aptitudeTest.timeLimit} minutes</p>
                    <p><strong>Passing Score:</strong> {aptitudeTest.passingScore}%</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">No aptitude test required</p>
                )}
              </div>

              {/* Settings Summary */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Settings</h3>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Max Applications:</strong> {postingSettings.maxApplications}</p>
                  <p><strong>Auto-Screening:</strong> {postingSettings.autoScreening ? 'Enabled' : 'Disabled'}</p>
                  <p><strong>Email Notifications:</strong> {postingSettings.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Publish Job Posting
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MockInterview from '@/components/candidate/MockInterview';
import WithRoleCheck from '@/components/WithRoleCheck';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function InterviewPage() {
  const { jobId } = useParams();
  const { theme } = useTheme();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the same API endpoint as JobSearch component
      const response = await axios.get(`/api/job/${jobId}`);
      
      if (response.data) {
        setJobDetails(response.data);
      } else {
        throw new Error('Job not found');
      }
      
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'} text-red-600 mb-4`}>
            {error}
          </div>
          <Link 
            href="/candidate"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'} text-yellow-600 mb-4`}>
            Job not found
          </div>
          <Link 
            href="/candidate"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WithRoleCheck requiredRole={["Candidate"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/candidate"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Link>
            
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{jobDetails.title}</h1>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    {jobDetails.company} • {jobDetails.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      {jobDetails.department}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                      {jobDetails.jobType?.charAt(0).toUpperCase() + jobDetails.jobType?.slice(1).replace("-", " ")}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      {jobDetails.experienceLevel}
                    </span>
                    {jobDetails.salaryRange && (
                      <span className={`px-3 py-1 text-sm rounded-full ${theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                        ${jobDetails.salaryRange.min} - ${jobDetails.salaryRange.max}
                      </span>
                    )}
                  </div>
                  
                  {/* Job Description Preview */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mt-4`}>
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-3`}>
                      {jobDetails.description}
                    </p>
                  </div>

                  {/* Requirements Preview */}
                  {jobDetails.requirements && jobDetails.requirements.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Key Requirements</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobDetails.requirements.slice(0, 5).map((req, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${
                              theme === 'dark' 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {req}
                          </span>
                        ))}
                        {jobDetails.requirements.length > 5 && (
                          <span className={`px-2 py-1 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            +{jobDetails.requirements.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mock Interview Component */}
          <MockInterview 
            jobDescription={jobDetails.description}
            jobTitle={jobDetails.title}
            jobId={jobId}
            jobDetails={jobDetails}
          />
        </div>
      </div>
    </WithRoleCheck>
  );
}
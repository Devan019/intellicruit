
// Mock data - replace with your API call
const mockApplications = [
  {
    _id: '1',
    personalInfo: {
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1-555-0123',
      city: 'San Francisco',
      state: 'CA'
    },
    total_score: 485,
    scores: {
      technical_skills: 95,
      experience: 92,
      certifications: 98,
      projects: 100,
      soft_skills: 100
    },
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: [
      {
        company: 'Google',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2024-12',
        current: false
      }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Science',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2020'
      }
    ],
    status: 'reviewed',
    submittedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@email.com',
      phone: '+1-555-0124',
      city: 'Seattle',
      state: 'WA'
    },
    total_score: 475,
    scores: {
      technical_skills: 90,
      experience: 95,
      certifications: 85,
      projects: 95,
      soft_skills: 110
    },
    skills: ['JavaScript', 'TypeScript', 'React', 'GraphQL', 'MongoDB'],
    experience: [
      {
        company: 'Microsoft',
        position: 'Principal Engineer',
        startDate: '2019-03',
        endDate: '2024-11',
        current: false
      }
    ],
    education: [
      {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2019'
      }
    ],
    status: 'interview',
    submittedAt: new Date('2024-01-12')
  },
  {
    _id: '3',
    personalInfo: {
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'michael.rodriguez@email.com',
      phone: '+1-555-0125',
      city: 'Austin',
      state: 'TX'
    },
    total_score: 465,
    scores: {
      technical_skills: 88,
      experience: 90,
      certifications: 92,
      projects: 95,
      soft_skills: 100
    },
    skills: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    experience: [
      {
        company: 'Tesla',
        position: 'Lead Developer',
        startDate: '2021-06',
        endDate: '2024-10',
        current: false
      }
    ],
    education: [
      {
        institution: 'UT Austin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Software Engineering',
        graduationYear: '2021'
      }
    ],
    status: 'submitted',
    submittedAt: new Date('2024-01-10')
  },
  {
    _id: '4',
    personalInfo: {
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'michael.rodriguez@email.com',
      phone: '+1-555-0125',
      city: 'Austin',
      state: 'TX'
    },
    total_score: 465,
    scores: {
      technical_skills: 88,
      experience: 90,
      certifications: 92,
      projects: 95,
      soft_skills: 100
    },
    skills: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    experience: [
      {
        company: 'Tesla',
        position: 'Lead Developer',
        startDate: '2021-06',
        endDate: '2024-10',
        current: false
      }
    ],
    education: [
      {
        institution: 'UT Austin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Software Engineering',
        graduationYear: '2021'
      }
    ],
    status: 'submitted',
    submittedAt: new Date('2024-01-10')
  }
];

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Award, Eye, Filter, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Zap, Clock, Calendar, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CalendarDays, MessageSquare, UserCheck, CheckCircle,
  AlertCircle, Send, Loader2
} from 'lucide-react';
import axios from 'axios';

const JobLeaderboard = ({ jobid }) => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [loading, setloading] = useState(false)

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Scheduler states
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedulerAction, setSchedulerAction] = useState('');
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [schedulerResult, setSchedulerResult] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    recruiter: '',
    candidate: ''
  });
  const [jobDetails, setJobDetails] = useState({
    company: '',
    position: '',
    tone: 'professional'
  });

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setloading(true)
      try {
        const api = await axios.get(`/api/jobapplications/${jobid}`);
        const data = api.data || [];
        console.log(data);
        setApplications(data);
        
        const jobposter =  await axios.get(`/api/job/${jobid}`)
        setAvailabilityForm((prev)=>{
          return {
            candidate : data,
            recruiter: jobposter.data.job
          }
        })

        setloading(false)
      } catch (error) {
        setloading(false)
        console.error('Error fetching applications:', error);
        setApplications([]);
      }
    }

    if (jobid) {
      fetchApplications();
    }
  }, [jobid]);

  // Toggle theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Filter and search applications
  const getFilteredAndSearchedApplications = () => {
    return applications
      .filter(app => {
        const statusMatch = statusFilter === 'all' || app.status === statusFilter;
        const searchMatch = searchTerm === '' ||
          `${app.personalInfo?.firstName} ${app.personalInfo?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          app.experience?.some(exp =>
            exp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.position?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        return statusMatch && searchMatch;
      })
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
  };

  // Get paginated applications
  const getPaginatedApplications = () => {
    const filteredApps = getFilteredAndSearchedApplications();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, Math.min(startIndex + limit, filteredApps.length));
    return filteredApps.slice(startIndex, endIndex);
  };

  const filteredApplications = getPaginatedApplications();
  const totalFilteredApplications = getFilteredAndSearchedApplications();
  const totalPages = Math.ceil(Math.min(totalFilteredApplications.length, limit) / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, limit]);

  // Scheduler functions
  const openScheduler = (action, application) => {
    setSelectedApplication(application);
    setSchedulerAction(action);
    setShowScheduler(true);
    setSchedulerResult(null);

    // Pre-fill candidate info
    if (application) {
      setAvailabilityForm(prev => ({
        ...prev,
        candidate: `${application.personalInfo?.firstName} ${application.personalInfo?.lastName}`
      }));
    }

    if(action == "communicate"){

      handleGenerateCommunication()
    }else if(action == "schedule"){
      handleScheduleInterview()
    }
  };

  const handleScheduleInterview = async () => {

    console.log(selectedApplication, availabilityForm)

    if (!selectedApplication || !availabilityForm.recruiter || !availabilityForm.candidate) {
      alert('Please fill in all required fields');
      return;
    }

    setloading(true);

    setSchedulerLoading(true);
    try {
      const requestData = {
        candidate: {
          name: `${selectedApplication.personalInfo?.firstName} ${selectedApplication.personalInfo?.lastName}`,
          email: selectedApplication.personalInfo?.email
        },
        job: {
          company: jobDetails.company,
          position: jobDetails.position,
          tone: jobDetails.tone
        },
        availability: {
          recruiter: availabilityForm.recruiter,
          candidate: availabilityForm.candidate
        }
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_FASTAPI_URI}/schedule-interview/`, requestData);
      setSchedulerResult(response.data);

    } catch (error) {
      console.error('Error scheduling interview:', error);
      setSchedulerResult({ error: 'Failed to schedule interview' });
    } finally {
      setloading(false)
      setSchedulerLoading(false);
    }
  };

  const handleGenerateCommunication = async (type) => {
    if (!selectedApplication) return;
    setloading(true)
    setSchedulerLoading(true);
    try {
      const requestData = {
        type: type,
        candidate: {
          name: `${selectedApplication.personalInfo?.firstName} ${selectedApplication.personalInfo?.lastName}`,
          email: selectedApplication.personalInfo?.email
        },
        job: {
          company: jobDetails.company,
          position: jobDetails.position,
          tone: jobDetails.tone
        }
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_FASTAPI_URI}/generate-communication/`, requestData);
      setSchedulerResult(response.data);
    } catch (error) {
      console.error('Error generating communication:', error);
      setSchedulerResult({ error: 'Failed to generate communication' });
    } finally {
      setloading(false)
      setSchedulerLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 450) return 'text-green-500';
    if (score >= 400) return 'text-blue-500';
    if (score >= 350) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      reviewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      hired: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status] || colors.submitted;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {loading && (
        <div className="fixed inset-0 bg-blue-50/40 dark:bg-blue-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded shadow">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800 dark:text-blue-200">Loading...</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🏆 Application Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Top performing candidates ranked by overall score</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8 items-center justify-between"
        >
          <div className="flex gap-4 items-center">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
              <option value={25}>Top 25</option>
              <option value={30}>Top 30</option>
              <option value={50}>Top 50</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaderboard */}
        <div className="grid gap-4 mb-8">
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No applications found</h3>
              <p className="text-gray-500 dark:text-gray-500">
                {searchTerm ? `No results for "${searchTerm}"` : "No applications match your current filters"}
              </p>
            </motion.div>
          ) : (
            filteredApplications.map((app, index) => {
              const globalRank = totalFilteredApplications.findIndex(a => a._id === app._id) + 1;
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(globalRank)}
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{globalRank}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {app.personalInfo?.firstName?.[0] || 'A'}{app.personalInfo?.lastName?.[0] || 'B'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {app.personalInfo?.firstName || 'N/A'} {app.personalInfo?.lastName || ''}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.personalInfo?.email || 'No email'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(app.total_score || 0)}`}>
                          {app.total_score || 0}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Score</div>
                      </div>

                      {app.scores && (
                        <div className="flex gap-2">
                          {Object.entries(app.scores).map(([skill, score]) => (
                            <div key={skill} className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{score || 0}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {skill.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-400" />
                        </button>

                        <button
                          onClick={() => openScheduler('schedule', app)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="Schedule Interview"
                        >
                          <CalendarDays className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => openScheduler('communicate', app)}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          title="Send Message"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </motion.div>
        )}

        {/* Application Details Modal */}
        <AnimatePresence>
          {selectedApplication && !showScheduler && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedApplication(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Application Details
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openScheduler('schedule', selectedApplication)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <CalendarDays className="w-4 h-4" />
                        Schedule
                      </button>
                      <button
                        onClick={() => openScheduler('communicate', selectedApplication)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {selectedApplication.personalInfo?.firstName?.[0] || 'A'}{selectedApplication.personalInfo?.lastName?.[0] || 'B'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {selectedApplication.personalInfo?.firstName} {selectedApplication.personalInfo?.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                            {selectedApplication.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail className="w-4 h-4" />
                          {selectedApplication.personalInfo?.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.personalInfo?.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4" />
                          {selectedApplication.personalInfo?.city}, {selectedApplication.personalInfo?.state}
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Score Breakdown</h4>
                      <div className="space-y-3">
                        {selectedApplication.scores && Object.entries(selectedApplication.scores).map(([skill, score]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {skill.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-8">
                                {score}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100">Total Score</span>
                            <span className={`text-xl font-bold ${getScoreColor(selectedApplication.total_score || 0)}`}>
                              {selectedApplication.total_score || 0}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Experience
                      </h4>
                      {selectedApplication.experience?.map((exp, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">{exp.position}</h5>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education
                      </h4>
                      {selectedApplication.education?.map((edu, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">{edu.degree}</h5>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.institution}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.fieldOfStudy} • {edu.graduationYear}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Timeline
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Submitted on {selectedApplication?.submittedAt?.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobLeaderboard;
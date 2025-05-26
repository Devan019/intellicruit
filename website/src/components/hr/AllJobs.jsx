import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const {userId} = useAuth();
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    type: 'all',
  });
  const [jobDepartments, setJobDepartments] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const { theme } = useTheme();
  const router = useRouter();

  // Get user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('/api/get-role');
        setUserRole(response.data.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setUserRole('Candidate'); // Default to Candidate if error
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`/api/job/user/${userId}`);
        // console.log('Fetched jobs:', response.data);
        setJobDepartments([...new Set(response.data.jobs.map(job => job.department))]);
        setJobs(response.data.jobs);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`/api/job/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleUpdateJob = async (jobId, updateData) => {
    try {
      const response = await axios.put(`/api/job/${jobId}`, updateData);
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, ...response.data } : job
      ));
      setEditingJob(null);
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job. Please try again.');
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await handleUpdateJob(jobId, { status: newStatus });
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    // Search term filter
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = 
      filters.status === 'all' || job.status === filters.status;

    // Department filter
    const matchesDepartment = 
      filters.department === 'all' || job.department === filters.department;

    // Job type filter
    const matchesType = 
      filters.type === 'all' || job.jobType === filters.type || job.type === filters.type;

    return matchesSearch && matchesStatus && matchesDepartment && matchesType;
  });

  if (loading || userRole === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'} text-red-600`}>
        Error loading jobs: {error}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Posted Jobs</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <svg
              className={`absolute right-3 top-2.5 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Departments</option>
            {jobDepartments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Job Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
        >
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            No jobs found matching your criteria.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job._id || job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      {job.department}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                      {job.jobType || job.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'open' 
                        ? theme === 'dark' 
                          ? 'bg-green-900/50 text-green-300' 
                          : 'bg-green-100 text-green-800'
                        : theme === 'dark'
                          ? 'bg-red-900/50 text-red-300'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {job?.status?.charAt(0).toUpperCase() + job?.status?.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Posted: {new Date(job.createdAt || job.postedDate).toLocaleDateString()}
                  </div>
                  
                  {/* HR Actions Menu */}
                  {userRole === 'HR' && (
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === job._id ? null : job._id)}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {actionMenuOpen === job._id && (
                        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                          <div className="py-1">
                            <Link href={`/jobs/${job._id}`}>
                              <button
                                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                                onClick={() => setActionMenuOpen(null)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                            </Link>
                            
                            <button
                              onClick={() => {
                                setEditingJob(job);
                                setActionMenuOpen(null);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Job
                            </button>
                            
                            <button
                              onClick={() => {
                                handleToggleStatus(job._id, job.status);
                                setActionMenuOpen(null);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {job.status === 'open' ? 'Close Job' : 'Open Job'}
                            </button>
                            
                            <button
                              onClick={() => {
                                setDeleteConfirm(job._id);
                                setActionMenuOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Job
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {job.description?.length > 200 
                  ? `${job.description.substring(0, 200)}...` 
                  : job.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div>
                 <button 
                   onClick={() => {
                      router.push(`/receiveApplications/${job._id}`);
                   }}
                   className='px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700'>
                   View Applications
                 </button>
                </div>
                <div className="flex gap-2">
                  {/* View Details Button for all users */}
                  <Link href={`/jobs/${job._id}`}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      View Details
                    </motion.button>
                  </Link>
                  
                  {/* Apply Now Button - Only for Candidates */}
                  {userRole === 'Candidate' && (
                    <Link href={`/apply/${job._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      >
                        Apply Now
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Confirm Delete
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Edit Job
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({...editingJob, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditingJob(null)}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateJob(editingJob._id, editingJob)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Click outside to close menu */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default JobListings;
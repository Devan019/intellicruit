"use client"
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Code, Lightbulb, TrendingUp, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import WithRoleCheck from "@/components/WithRoleCheck";

const Recommendations = () => {
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const { userId } = useAuth();

  // Load skills from profile API
  const apiCall = async () => {
    try {
      const api = await axios.get(`/api/profile`);
      const data = api.data.skills;
      console.log(data);
      setSkills(data);
    } catch (err) {
      console.error("Error fetching profile skills:", err);
      setError("Could not load skills from profile");
    }
  };

  // Function to convert API job data to recommendation format
  const mapJobsToRecommendations = (jobs) => {
    return jobs.map((job, index) => ({
      id: `job-${index}`,
      title: job.Job_Title,
      company: job.Industry,
      type: 'job',
      description: `${job.Job_Title} in ${job.Industry} (${job.Location}). Required skills: ${job.Required_Skills}. Remote: ${job.Remote_Friendly}.`
    }));
  };

  // Fetch recommendations when skills are loaded
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (skills.length === 0) {
        await apiCall();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_FASTAPI_URI}/recommend-jobs`, 
          skills
        );

        setRecommendations(
          response.data && response.data.recommended_jobs
            ? mapJobsToRecommendations(response.data.recommended_jobs)
            : []
        );
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Could not fetch live recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [skills]);

  const getIconForType = (type) => {
    switch (type) {
      case 'job':
        return <Briefcase className="text-blue-400" size={18} />;
      case 'course':
        return <Lightbulb className="text-yellow-400" size={18} />;
      case 'skill':
        return <Code className="text-green-400" size={18} />;
      default:
        return null;
    }
  };

  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(rec =>
        activeCategory === 'jobs' ? rec.type === 'job' :
        activeCategory === 'courses' ? rec.type === 'course' :
        rec.type === 'skill'
      );

  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900 rounded-xl p-6 shadow-lg"
      >
        {/* Title and filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-6">
          <h3 className="text-xl font-semibold text-gray-100 flex items-center">
            <TrendingUp size={20} className="mr-2 text-purple-400" />
            Smart Recommendations
          </h3>

          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('jobs')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                activeCategory === 'jobs'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveCategory('courses')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                activeCategory === 'courses'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveCategory('skills')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                activeCategory === 'skills'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Skills
            </button>
          </div>
        </div>

        {/* Skills pills */}
        {skills.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {skills.slice(0, 5).map((skill, idx) => (
              <motion.span
                key={idx}
                className="bg-gray-800 text-sm text-gray-300 px-3 py-1 rounded-full border border-gray-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                {skill}
              </motion.span>
            ))}
            {skills.length > 5 && (
              <motion.span
                className="bg-gray-800 text-sm text-gray-400 px-3 py-1 rounded-full border border-gray-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                +{skills.length - 5} more
              </motion.span>
            )}
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-purple-500 border-r-purple-500 border-b-gray-700 border-l-gray-700 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Finding the best matches for your skills...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded-md mb-4">
            <p className="text-yellow-200 text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && recommendations.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-800 p-4 rounded-full mb-4">
              <Code size={32} className="text-gray-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-300 mb-2">No recommendations yet</h4>
            <p className="text-gray-500 max-w-md">
              Add skills to your profile or upload your resume to get personalized recommendations.
            </p>
          </motion.div>
        )}

        {/* Recommendations grid */}
        {!loading && filteredRecommendations.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredRecommendations.map((rec, idx) => (
                <motion.div
                  key={rec.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {getIconForType(rec.type)}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-gray-500">
                          {rec.type}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-lg font-medium text-gray-100 mb-1">
                      {rec.title}
                    </h4>

                    {rec.company && (
                      <p className="text-sm text-gray-400 mb-3">{rec.company}</p>
                    )}

                    <p className="text-sm text-gray-400 mb-4">
                      {rec.description}
                    </p>

                    <div className="flex justify-end">
                      <motion.button
                        className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span>View details</span>
                        <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Colored bar at bottom based on type */}
                  <div className={`h-1 w-full ${
                    rec.type === 'job' ? 'bg-blue-500' :
                    rec.type === 'course' ? 'bg-yellow-500' :
                    'bg-green-500'}`}
                  ></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </WithRoleCheck>
  );
};

export default Recommendations;
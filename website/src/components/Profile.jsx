import React from 'react'
import { motion } from "framer-motion"
import { 
  User, Mail, Phone, MapPin 
} from 'lucide-react'

const Profile = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 p-6 rounded-lg shadow border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              John Doe
            </h3>
            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
              Full Stack Developer
            </p>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                john.doe@email.com
              </div>
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                San Francisco, CA
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills & Experience */}
        <div className="col-span-2 space-y-6">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg shadow border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'MongoDB'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg shadow border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Experience
            </h4>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 dark:border-opacity-50">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Senior Developer
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  TechStart Inc. • 2023 - Present
                </p>
                <p className="text-sm mt-2 text-gray-700 dark:text-gray-400">
                  Led development of key features, increased performance by 40%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile

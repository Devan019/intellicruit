"use client"

import { motion } from "framer-motion"
import { Brain, Calendar, MessageSquare, BarChart3, Shield, Clock, Users, Target } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Resume Screening",
      description: "Automatically analyze and rank resumes based on job requirements with advanced AI algorithms.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      title: "Smart Interview Scheduling",
      description: "Coordinate interviews seamlessly with automated scheduling that considers all stakeholders.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageSquare,
      title: "Candidate Communication",
      description: "Maintain consistent communication with candidates throughout the hiring process.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Get detailed insights into your hiring process with comprehensive analytics and reporting.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Bias-Free Screening",
      description: "Ensure fair and unbiased candidate evaluation with AI-driven objective assessments.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Clock,
      title: "Time Optimization",
      description: "Reduce hiring time by up to 80% with automated workflows and intelligent prioritization.",
      color: "from-teal-500 to-blue-500",
    },
  ]

  const benefits = [
    { icon: Users, title: "Faster Hiring", value: "3x" },
    { icon: Target, title: "Better Matches", value: "95%" },
    { icon: Clock, title: "Time Saved", value: "80%" },
  ]

  return (
    <section id="features" className="py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Brain className="h-4 w-4" />
            <span>Powerful Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Everything You Need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Efficient Hiring
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Our AI-powered platform addresses every challenge in the hiring process, from resume screening to candidate
            communication and interview scheduling.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} mb-6`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>

              {/* Hover Effect */}
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 lg:p-12"
        >
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Proven Results
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              Join thousands of companies that have transformed their hiring process
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4"
                >
                  <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{benefit.value}</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{benefit.title}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

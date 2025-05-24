"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, BarChart3, PieChart, Calendar, Target, Clock, Award, MapPin, DollarSign, Briefcase } from 'lucide-react'

export default function JobAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")

  // Mock analytics data
  const analyticsData = {
    applicationStats: {
      total: 12,
      thisMonth: 8,
      lastMonth: 4,
      successRate: 25,
      averageResponseTime: 5.2,
    },
    salaryInsights: {
      averageOffered: 105000,
      marketAverage: 98000,
      yourRange: { min: 80000, max: 130000 },
      topPayingCompanies: [
        { name: "TechCorp Inc.", salary: 140000 },
        { name: "InnovateLabs", salary: 115000 },
        { name: "WebTech Solutions", salary: 95000 },
      ],
    },
    skillsAnalysis: {
      inDemand: [
        { skill: "React", demand: 95, yourLevel: 90 },
        { skill: "TypeScript", demand: 88, yourLevel: 85 },
        { skill: "Node.js", demand: 82, yourLevel: 75 },
        { skill: "GraphQL", demand: 70, yourLevel: 60 },
        { skill: "AWS", demand: 85, yourLevel: 45 },
      ],
      recommendations: [
        "Consider improving your AWS skills - high demand, low proficiency",
        "GraphQL skills could boost your marketability",
        "Your React skills are excellent and in high demand",
      ],
    },
    locationTrends: [
      { location: "San Francisco, CA", jobs: 45, avgSalary: 135000 },
      { location: "New York, NY", jobs: 38, avgSalary: 125000 },
      { location: "Seattle, WA", jobs: 32, avgSalary: 115000 },
      { location: "Austin, TX", jobs: 28, avgSalary: 105000 },
      { location: "Remote", jobs: 52, avgSalary: 110000 },
    ],
    industryBreakdown: [
      { industry: "Technology", percentage: 35, applications: 4 },
      { industry: "Fintech", percentage: 25, applications: 3 },
      { industry: "E-commerce", percentage: 20, applications: 2 },
      { industry: "Healthcare", percentage: 12, applications: 2 },
      { industry: "Education", percentage: 8, applications: 1 },
    ],
    monthlyTrends: [
      { month: "Oct", applications: 3, interviews: 1, offers: 0 },
      { month: "Nov", applications: 5, interviews: 2, offers: 1 },
      { month: "Dec", applications: 4, interviews: 1, offers: 0 },
      { month: "Jan", applications: 8, interviews: 3, offers: 2 },
    ],
  }

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ]

  const getSkillColor = (demand, yourLevel) => {
    const gap = demand - yourLevel
    if (gap > 20) return "text-red-600 dark:text-red-400"
    if (gap > 10) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getSkillBg = (demand, yourLevel) => {
    const gap = demand - yourLevel
    if (gap > 20) return "bg-red-100 dark:bg-red-900/20"
    if (gap > 10) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-green-100 dark:bg-green-900/20"
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Market Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Insights into your job search performance and market trends
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.applicationStats.total}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                +{analyticsData.applicationStats.thisMonth} this month
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.applicationStats.successRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Interview Rate</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.applicationStats.averageResponseTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                days
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(analyticsData.salaryInsights.averageOffered / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                +{Math.round(((analyticsData.salaryInsights.averageOffered - analyticsData.salaryInsights.marketAverage) / analyticsData.salaryInsights.marketAverage) * 100)}% vs market
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Salary Offered</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Application Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Application Trends</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.monthlyTrends.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{month.applications} apps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{month.interviews} interviews</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{month.offers} offers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Industry Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Industry Breakdown</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.industryBreakdown.map((industry, index) => (
                <div key={industry.industry} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{industry.industry}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {industry.applications} applications ({industry.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${industry.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skills Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills Market Analysis</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Skill Demand vs Your Proficiency</h3>
              <div className="space-y-4">
                {analyticsData.skillsAnalysis.inDemand.map((skill, index) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Market: {skill.demand}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          You: {skill.yourLevel}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-300 dark:bg-blue-700 h-2 rounded-full" 
                          style={{ width: `${skill.demand}%` }}
                        />
                      </div>
                      <div className="absolute top-0 w-full bg-transparent rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${skill.yourLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Skill Recommendations</h3>
              <div className="space-y-3">
                {analyticsData.skillsAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Skill Gap Analysis</h4>
                <div className="space-y-2">
                  {analyticsData.skillsAnalysis.inDemand.map((skill, index) => {
                    const gap = skill.demand - skill.yourLevel
                    return (
                      <div key={skill.skill} className={`flex items-center justify-between p-2 rounded ${getSkillBg(skill.demand, skill.yourLevel)}`}>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                        <span className={`text-sm font-medium ${getSkillColor(skill.demand, skill.yourLevel)}`}>
                          {gap > 0 ? `+${gap}% needed` : "Proficient"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Location & Salary Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Job Markets</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.locationTrends.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{location.location}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{location.jobs} open positions</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${(location.avgSalary / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">avg salary</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Salary Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Salary Insights</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Salary Range</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Target Range</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(analyticsData.salaryInsights.yourRange.min / 1000).toFixed(0)}k - ${(analyticsData.salaryInsights.yourRange.max / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Market Average</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(analyticsData.salaryInsights.marketAverage / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Top Paying Companies</h3>
                <div className="space-y-2">
                  {analyticsData.salaryInsights.topPayingCompanies.map((company, index) => (
                    <div key={company.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{company.name}</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${(company.salary / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

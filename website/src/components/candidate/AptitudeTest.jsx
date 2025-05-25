"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle } from "lucide-react"
import axios from "axios"

export default function AptitudeTest({ test, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(test.timeLimit * 60) // Convert to seconds
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)


  useEffect(() => {
    let timer
    if (testStarted && timeLeft > 0 && !testCompleted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [testStarted, timeLeft, testCompleted])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }



  const handleSubmitTest = async() => {
    setTestCompleted(true)

    let correctAnswers = 0
    test.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })
    const score = Math.round((correctAnswers / test.questions.length) * 100)
    const passed = score >= test.passingScore
    const testResult = {
      score, passed,answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
        questionId,
        answer: test.questions.find(q => q.id === questionId).options[answerIndex],
        isCorrect: test.questions.find(q => q.id === questionId).correctAnswer === answerIndex,
      })),
    }

    await axios.post("/api/application", testResult)
    
    const result = {
      score,
      passed,
      correctAnswers,
      totalQuestions: test.questions.length,
      timeSpent: test.timeLimit * 60 - timeLeft,
    }

    onComplete(result)
  }

  const startTest = () => {
    setTestStarted(true)
  }

  const currentQuestionData = test.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / test.questions.length) * 100

  if (!testStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{test.title}</h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{test.description}</p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{test.questions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{test.timeLimit}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{test.passingScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pass Score</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Important Instructions</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• You have {test.timeLimit} minutes to complete the test</li>
                  <li>• You can navigate between questions</li>
                  <li>• Make sure to answer all questions before submitting</li>
                  <li>• The test will auto-submit when time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTest}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Start Test
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{test.title}</h2>
          <div className="flex items-center text-lg font-semibold">
            <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className={`${timeLeft < 300 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
          <span>
            Question {currentQuestion + 1} of {test.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">{currentQuestionData.question}</h3>

          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <motion.label
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestionData.id] === index
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionData.id}`}
                  value={index}
                  checked={answers[currentQuestionData.id] === index}
                  onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </motion.label>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </motion.button>

          <div className="flex items-center space-x-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-blue-600 text-white"
                    : answers[test.questions[index].id] !== undefined
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === test.questions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitTest}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Submit Test
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Next
            </motion.button>
          )}
        </div>

        {/* Answered Questions Summary */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {Object.keys(answers).length} of {test.questions.length} questions answered
        </div>
      </div>
    </motion.div>
  )
}

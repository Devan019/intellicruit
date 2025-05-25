"use client"

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Video, 
  Mic, 
  Square, 
  Play, 
  RotateCcw,
  Eye,
  Smile,
  Volume2,
  Clock,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MockInterview = ({ jobDescription, jobTitle = "Software Developer" }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, analysis, results
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);

  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 7000; // 7 seconds
  const BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URI || 'http://localhost:8000';

  // Start interview session with backend
  const startInterview = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get camera/microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      
      // Setup audio analysis for silence detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start mock interview session with backend
      const response = await fetch(`${BACKEND_URL}/mock-interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          num_questions: 5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start interview session');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setSessionId(data.session_id);
      setCurrentStep('interview');
      setCurrentQuestionIndex(0);
      
      // Speak first question after a delay
      setTimeout(() => {
        speakQuestion(data.questions[0]);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to start interview. Please check your camera/microphone permissions.');
      console.error('Interview start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = (question) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setTimeout(() => {
          startRecording();
        }, 1000);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        startRecording();
      }, 3000);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm'
    });
    
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      submitAnswer(videoBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setSilenceTimer(0);
    startSilenceDetection();
  };

  const startSilenceDetection = () => {
    let silenceTime = 0;
    
    const detectSilence = () => {
      if (!analyserRef.current || !isRecording) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedVolume = average / 255;

      if (normalizedVolume < SILENCE_THRESHOLD) {
        silenceTime += 100;
        setSilenceTimer(silenceTime);
        
        if (silenceTime >= SILENCE_DURATION) {
          stopRecording();
          return;
        }
      } else {
        silenceTime = 0;
        setSilenceTimer(0);
      }

      if (isRecording) {
        setTimeout(detectSilence, 100);
      }
    };

    detectSilence();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSilenceTimer(0);
    }
  };

  const submitAnswer = async (videoBlob) => {
    try {
      setLoading(true);

      // Convert video blob to proper format and extract audio
      const audioBlob = await extractAudioFromVideo(videoBlob);
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question_index', currentQuestionIndex.toString());
      formData.append('question', questions[currentQuestionIndex]);
      formData.append('audio_file', audioBlob, `answer_${currentQuestionIndex}.wav`);
      formData.append('video_file', videoBlob, `answer_${currentQuestionIndex}.webm`);

      const response = await fetch(`${BACKEND_URL}/mock-interview/submit-answer`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      
      // Store the answer result
      setRecordedAnswers(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        question: questions[currentQuestionIndex],
        result: result,
        timestamp: Date.now()
      }]);

      // Move to next question or finish interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeout(() => {
          speakQuestion(questions[currentQuestionIndex + 1]);
        }, 2000);
      } else {
        finishInterview();
      }

    } catch (err) {
      setError('Failed to submit answer: ' + err.message);
      console.error('Submit answer error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract audio from video blob
  const extractAudioFromVideo = async (videoBlob) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // For now, we'll just return the video blob as audio
      // In a real implementation, you'd use FFmpeg.js or similar to extract audio
      resolve(videoBlob);
    });
  };

  const finishInterview = async () => {
    // Stop media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setCurrentStep('analysis');
    setLoading(true);

    try {
      // Get session results from backend
      const response = await fetch(`${BACKEND_URL}/mock-interview/session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get interview results');
      }

      const sessionResults = await response.json();
      setResults(sessionResults);
      setCurrentStep('results');

    } catch (err) {
      setError('Failed to analyze interview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const retryInterview = () => {
    setCurrentStep('setup');
    setCurrentQuestionIndex(0);
    setIsRecording(false);
    setSilenceTimer(0);
    setRecordedAnswers([]);
    setResults(null);
    setError(null);
    setSessionId(null);
    setQuestions([]);
  };

  const renderSetupScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
    >
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Mock Interview Setup</h2>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Prepare for your interview with AI-generated questions based on the job description.
        </p>
      </div>

      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="font-semibold mb-2">What to expect:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-500" />
              <span>5 AI-generated questions based on job requirements</span>
            </li>
            <li className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-500" />
              <span>Video recording for body language analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Automatic question progression after 7 seconds of silence</span>
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span>Detailed performance analysis and scoring</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startInterview}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting Interview...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Interview
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderInterviewScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <div className="flex items-center gap-4">
            {loading && (
              <div className="flex items-center gap-2 text-blue-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
            {silenceTimer > 0 && (
              <div className="flex items-center gap-2 text-orange-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Silence: {Math.round(silenceTimer / 1000)}s / 7s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className="text-lg font-medium">{questions[currentQuestionIndex]}</p>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          
          {isRecording && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
            >
              <Square className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recorded Answers Preview */}
      {recordedAnswers.length > 0 && (
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <h3 className="text-lg font-semibold mb-4">Completed Answers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordedAnswers.map((answer, index) => (
              <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Question {answer.questionIndex + 1}</span>
                  {answer.result && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      Score: {answer.result.scores?.final_score_out_of_5 || 'N/A'}/5
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {answer.question.slice(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderAnalysisScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
    >
      <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Analyzing Your Interview</h2>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
        Our AI is analyzing your responses, body language, and speech patterns. This may take a few moments.
      </p>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <span>Analyzing eye contact and confidence</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Smile className="w-4 h-4 text-green-500" />
          <span>Evaluating facial expressions</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="w-4 h-4 text-orange-500" />
          <span>Processing speech patterns and clarity</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Video className="w-4 h-4 text-purple-500" />
          <span>Assessing overall presentation</span>
        </div>
      </div>
    </motion.div>
  );

  const renderResultsScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <div className={`p-8 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          {results?.overall_stats?.average_final_score?.toFixed(1) || '0.0'}/5.0
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Your overall interview performance score
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <div className="font-semibold text-lg">{results?.overall_stats?.completion_rate?.toFixed(0) || 0}%</div>
            <div className="text-gray-500">Completion Rate</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{results?.overall_stats?.answered_questions || 0}</div>
            <div className="text-gray-500">Questions Answered</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{results?.overall_stats?.average_video_score?.toFixed(1) || 0}</div>
            <div className="text-gray-500">Video Score</div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      {results?.answers && results.answers.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Detailed Question Analysis</h3>
          {results.answers.map((answer, index) => (
            <div key={index} className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Question {index + 1}</h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  {answer.question}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Video Analysis */}
                <div>
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    Video Analysis
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Eye Contact</span>
                      <span>{Math.round((answer.video_analysis?.eye_contact_ratio || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expression</span>
                      <span>{Math.round((answer.video_analysis?.facial_expression_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence</span>
                      <span>{Math.round((answer.video_analysis?.confidence_score || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Audio Analysis */}
                <div>
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-green-500" />
                    Audio Analysis
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Speaking Rate</span>
                      <span>{Math.round(answer.audio_analysis?.speaking_rate_bpm || 0)} BPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy</span>
                      <span>{((answer.audio_analysis?.average_energy || 0) * 100).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Silence Ratio</span>
                      <span>{Math.round((answer.audio_analysis?.silence_ratio || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score and Feedback */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Score:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {answer.scores?.final_score_out_of_5 || 0}/5.0
                  </span>
                </div>
                {answer.feedback && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mt-3`}>
                    <h6 className="font-medium mb-1">AI Feedback:</h6>
                    <p className="text-sm">{answer.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={retryInterview}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.history.back()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Jobs
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {currentStep === 'setup' && renderSetupScreen()}
        {currentStep === 'interview' && renderInterviewScreen()}
        {currentStep === 'analysis' && renderAnalysisScreen()}
        {currentStep === 'results' && renderResultsScreen()}
      </AnimatePresence>
    </div>
  );
};

export default MockInterview;
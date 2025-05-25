// models/Application.js
import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  institution: { type: String },
  degree: { type: String },
  fieldOfStudy: { type: String },
  graduationYear: { type: String },
  gpa: { type: String }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  company: { type: String },
  position: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String }
}, { _id: false });

const AvailabilitySchema = new mongoose.Schema({
  startDate: { type: Date },
  noticePeriod: {
    type: String,
    enum: ['immediate', '1-week', '2-weeks', '1-month', '2-months', '3-months'],
    default: 'immediate'
  },
  salaryExpectation: { type: String },
  workType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote', 'hybrid'],
    default: 'full-time'
  }
}, { _id: false });

const PersonalInfoSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  dateOfBirth: { type: Date },
  linkedinUrl: { type: String },
  portfolioUrl: { type: String }
}, { _id: false });

const QuestionAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  questionText: { type: String },
  answer: { type: String },
  questionType: { type: String, enum: ['textarea', 'radio'] },
  options: { type: [String] }
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  type: { type: String, enum: ['resume', 'cover-letter', 'additional'] },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  // Core References
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  //check apptitude is give or no

  apptitudeGiven : {
    type: Boolean,
    default: false
  },

  // Personal Information
  personalInfo: { type: PersonalInfoSchema },

  // Education & Experience
  education: { type: [EducationSchema] },
  experience: { type: [ExperienceSchema] },

  // Skills & Documents
  skills: { type: [String] },
  documents: { type: [DocumentSchema] },

  // Application Content
  coverLetter: { type: String },
  availability: { type: AvailabilitySchema },

  // Additional Questions
  // questionAnswers: { type: [QuestionAnswerSchema] },

  // Test Results (if applicable)
  testResult: {
    score: { type: Number },
    passed: { type: Boolean },
  },

  // Scoring & Feedback
  scores: {
    technical_skills: { type: Number, min: 0, max: 100 },
    experience: { type: Number, min: 0, max: 100 },
    certifications: { type: Number, min: 0, max: 100 },
    projects: { type: Number, min: 0, max: 100 },
    soft_skills: { type: Number, min: 0, max: 100 }
  },
  total_score: { type: Number, min: 0, max: 500 },
  strengths_summary: { type: String },
  improvement_areas: { type: [String] },
  suggestions: { type: [String] },


  // Application Metadata
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'interview', 'rejected', 'hired'],
    default: 'submitted'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
});

export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
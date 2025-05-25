// models/JobPosting.js
import mongoose from "mongoose";

const SalaryRangeSchema = new mongoose.Schema({
    min: { type: Number },
    max: { type: Number }
});

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'true-false'],
        default: 'multiple-choice'
    },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    points: { type: Number, required: true, default: 1 }
});

const AptitudeTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    timeLimit: { type: Number, required: true, default: 30 }, // in minutes
    passingScore: { type: Number, required: true, default: 70 }, // percentage
    questions: { type: [QuestionSchema], required: true }
});

const JobPostingSettingsSchema = new mongoose.Schema({
    enableAptitudeTest: { type: Boolean, default: false },
    maxApplications: { type: Number, default: 100 },
    autoScreening: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    publishImmediately: { type: Boolean, default: true }
});

const JobPostingSchema = new mongoose.Schema({
    // Job Description
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },

    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    jobType: {
        type: String,
        required: true,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        default: 'full-time'
    },
    experienceLevel: {
        type: String,
        required: true,
        enum: ['entry', 'mid', 'senior', 'executive'],
        default: 'entry'
    },
    description: { type: String, required: true },
    responsibilities: { type: [String], required: true },
    requirements: { type: [String], required: true },
    skills: { type: [String], required: true },
    benefits: { type: [String], required: true },
    salaryRange: { type: SalaryRangeSchema },
    applicationDeadline: { type: Date },

    // Aptitude Test (optional)
    aptitudeTest: { type: AptitudeTestSchema },

    // Settings
    settings: { type: JobPostingSettingsSchema, required: true },

    // Metadata
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    company: {
        type : String,
        // required: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'closed', 'archived'],
        default: 'draft'
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    applicationCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



export const JobPosting = mongoose.models.JobPosting || mongoose.model('JobPosting', JobPostingSchema);
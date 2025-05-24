import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    job_title: {
        type: String,
        required: true,
    },
    job_department: {
        type: String,
        required: true,
    },
    job_location: {
        type: String,
        required: true,
    },
    job_type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        required: true,
    },
    experience_level: {
        type: String,
        enum: ['entry-level', 'mid-level', 'senior-level', 'executive'],
        required: true,
    },
    job_description: {
        type: String,
        required: true,
    },
    job_salary: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

export default mongoose.models.Job || mongoose.model("Job", JobSchema);

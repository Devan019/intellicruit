import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // Existing Clerk authentication fields
    clerk_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    resume_url: {
        type: String,
    },
    
    // Extended Profile Information
    firstName: { 
        type: String,
        default: function() {
            // Extract firstName from name if available
            return this.name ? this.name.split(' ')[0] : '';
        }
    },
    lastName: { 
        type: String,
        default: function() {
            // Extract lastName from name if available
            const nameParts = this.name ? this.name.split(' ') : [];
            return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }
    },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    jobTitle: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
    
    // User role for the application system
    role: { 
        type: String, 
        enum: ['Candidate', 'HR'], 
        default: 'Candidate' 
    },
    
    // Skills and Experience arrays
    skills: [{ type: String }],
    experience: [{
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        current: { type: Boolean, default: false },
        description: String
    }],
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        graduationYear: String,
        gpa: String
    }],
    
    // Profile completion tracking
    profileCompleted: { 
        type: Boolean, 
        default: false 
    },
    lastProfileUpdate: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true,
})

// Pre-save middleware to auto-populate firstName/lastName from name
UserSchema.pre('save', function(next) {
    if (this.isModified('name') && this.name) {
        const nameParts = this.name.split(' ');
        if (!this.firstName) {
            this.firstName = nameParts[0] || '';
        }
        if (!this.lastName && nameParts.length > 1) {
            this.lastName = nameParts.slice(1).join(' ');
        }
    }
    
    // Update lastProfileUpdate when profile fields are modified
    const profileFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 
                          'zipCode', 'jobTitle', 'linkedinUrl', 'portfolioUrl', 'skills', 
                          'experience', 'education'];
    
    const isProfileModified = profileFields.some(field => this.isModified(field));
    if (isProfileModified) {
        this.lastProfileUpdate = new Date();
        
        // Check if profile is complete
        const hasBasicInfo = this.firstName && this.lastName && this.phone;
        const hasSkillsOrExperience = (this.skills && this.skills.length > 0) || 
                                     (this.experience && this.experience.length > 0);
        this.profileCompleted = hasBasicInfo && hasSkillsOrExperience;
    }
    
    next();
});

// Instance method to get full name
UserSchema.methods.getFullName = function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.name || '';
};

// Instance method to check profile completion
UserSchema.methods.isProfileComplete = function() {
    const hasBasicInfo = this.firstName && this.lastName && this.email && this.phone;
    const hasSkillsOrExperience = (this.skills && this.skills.length > 0) || 
                                 (this.experience && this.experience.length > 0);
    return hasBasicInfo && hasSkillsOrExperience;
};

// Static method to find users with complete profiles
UserSchema.statics.findCompleteProfiles = function() {
    return this.find({ profileCompleted: true });
};

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import axios from "axios";

export default function ApplicationForm({
  job,
  testResult,
  onSubmit,
  parsedResumeData,
  setparsedResumeData,
}) {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      dateOfBirth: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
    education: [
      {
        id: 1,
        institution: "",
        degree: "",
        fieldOfStudy: "",
        graduationYear: "",
        gpa: "",
      },
    ],
    experience: [
      {
        id: 1,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    skills: [],
    resume: null,
    coverLetter: "",
    additionalDocuments: [],
    availability: {
      startDate: "",
      noticePeriod: "",
      salaryExpectation: "",
      workType: "full-time",
    },
    questions: {},
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  // Reordered sections - Skills & Documents first
  const sections = [
    { id: 0, title: "Skills & Documents", icon: FileText },
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Education", icon: GraduationCap },
    { id: 3, title: "Experience", icon: Briefcase },
    { id: 4, title: "Additional Information", icon: CheckCircle },
  ];

  // Mock additional questions from the job posting
  const additionalQuestions = [
    {
      id: 1,
      question: "Why are you interested in this position?",
      type: "textarea",
      required: true,
    },
    {
      id: 2,
      question: "Are you authorized to work in the United States?",
      type: "radio",
      options: ["Yes", "No"],
      required: true,
    },
    {
      id: 3,
      question: "Are you willing to relocate?",
      type: "radio",
      options: ["Yes", "No", "Maybe"],
      required: false,
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/profile");
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);
  // Effect to populate form data when parsedResumeData is available
  useEffect(() => {
    if (userProfile || parsedResumeData) {
      setFormData((prevData) => ({
        ...prevData,
        personalInfo: {
          ...prevData.personalInfo,
          // Priority: userProfile > parsedResumeData > existing
          firstName:
            userProfile?.firstName ||
            parsedResumeData?.name ||
            prevData.personalInfo.firstName,
          lastName:
            userProfile?.lastName ||
            parsedResumeData?.lastName ||
            prevData.personalInfo.lastName,
          email:
            userProfile?.email ||
            parsedResumeData?.email ||
            prevData.personalInfo.email,
          phone:
            userProfile?.phone ||
            parsedResumeData?.contact_no ||
            prevData.personalInfo.phone,
          address:
            userProfile?.address ||
            parsedResumeData?.address ||
            prevData.personalInfo.address,
          city:
            userProfile?.city ||
            parsedResumeData?.city ||
            prevData.personalInfo.city,
          state:
            userProfile?.state ||
            parsedResumeData?.state ||
            prevData.personalInfo.state,
          zipCode:
            userProfile?.zipCode ||
            parsedResumeData?.zipCode ||
            prevData.personalInfo.zipCode,
          linkedinUrl:
            userProfile?.linkedinUrl ||
            parsedResumeData?.linkedin_profile_link ||
            prevData.personalInfo.linkedinUrl,
          portfolioUrl:
            userProfile?.portfolioUrl ||
            parsedResumeData?.portfolioUrl ||
            prevData.personalInfo.portfolioUrl,
        },
        skills: userProfile?.skills?.length
          ? userProfile.skills
          : parsedResumeData?.skills?.length
          ? parsedResumeData.skills
          : prevData.skills,
        education: userProfile?.education?.length
          ? userProfile.education.map((edu, index) => ({
              id: edu.id || Date.now() + index,
              institution: edu.institution || "",
              degree: edu.degree || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              graduationYear: edu.graduationYear || "",
              gpa: edu.gpa || "",
            }))
          : parsedResumeData?.education?.length
          ? parsedResumeData.education.map((edu, index) => ({
              id: edu.id || Date.now() + index,
              institution: edu.institution || "",
              degree: edu.degree || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              graduationYear: edu.graduationYear || "",
              gpa: edu.gpa || "",
            }))
          : prevData.education,
        experience: userProfile?.experience?.length
          ? userProfile.experience.map((exp, index) => ({
              id: exp.id || Date.now() + index,
              company: exp.company || "",
              position: exp.position || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
              current: exp.current || false,
              description: exp.description || "",
            }))
          : prevData.experience,
      }));
    }
  }, [userProfile, parsedResumeData]);

  const handleFileUpload = async (file, type) => {
    if (type === "resume") {
      setFormData((prev) => ({ ...prev, resume: file }));
      setIsParsingResume(true);

      // Prepare FormData
      const formData = new FormData();
      formData.append("resume_file", file); // this key must match FastAPI

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_FASTAPI_URI}/resume-agent`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = response.data;
        setparsedResumeData(data);
        setIsParsingResume(false);
      } catch (error) {
        console.error("Upload failed:", error.response?.data || error.message);
      }
    } else if (type === "additional") {
      setFormData((prev) => ({
        ...prev,
        additionalDocuments: [...prev.additionalDocuments, file],
      }));
    }
  };

  const removeFile = (type, index = null) => {
    if (type === "resume") {
      setFormData((prev) => ({ ...prev, resume: null }));
      // Clear parsed data when resume is removed
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          dateOfBirth: "",
          linkedinUrl: "",
          portfolioUrl: "",
        },
        skills: [],
        education: [
          {
            id: 1,
            institution: "",
            degree: "",
            fieldOfStudy: "",
            graduationYear: "",
            gpa: "",
          },
        ],
        experience: [
          {
            id: 1,
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          },
        ],
      }));
    } else if (type === "additional" && index !== null) {
      setFormData((prev) => ({
        ...prev,
        additionalDocuments: prev.additionalDocuments.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      graduationYear: "",
      gpa: "",
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const removeEducation = (id) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const updateEducation = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const removeExperience = (id) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = () => {
    const applicationData = {
      ...formData,
      jobId: job.id,
      testResult,
      submittedAt: new Date().toISOString(),
    };
    onSubmit(applicationData);
  };

  const FileUploadArea = ({ type, accept, multiple = false }) => (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleFileUpload(file, type);
        }}
        className="hidden"
        id={`file-${type}`}
      />
      <label htmlFor={`file-${type}`} className="cursor-pointer">
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {accept.includes(["pdf", "docx"])
            ? "PDF files only"
            : "PDF, DOC, DOCX files"}
        </p>
      </label>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Test Result Banner */}
      {testResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">
              Aptitude Test Passed with {testResult.score}% score
            </span>
          </div>
        </div>
      )}

      {/* Data Source Banner */}
      {(userProfile || parsedResumeData) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-800 dark:text-blue-200">
              Form auto-filled from{" "}
              {userProfile ? "your profile" : "resume parsing"}
              {userProfile &&
                parsedResumeData &&
                " (profile data takes priority)"}
            </span>
          </div>
        </div>
      )}

      {/* Resume Parsing Status */}
      {isParsingResume && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800 dark:text-blue-200">
              Parsing your resume and auto-filling the form...
            </span>
          </div>
        </div>
      )}

      {/* Auto-filled Data Banner */}
      {parsedResumeData && !isParsingResume && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200">
              Resume parsed successfully! Form has been auto-filled with your
              information.
            </span>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <section.icon className="h-4 w-4 mr-2" />
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Skills & Documents - Now First Section */}
        {currentSection === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Skills & Documents
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Upload your resume first to auto-populate the form
              </div>
            </div>

            {/* Resume Upload - Priority Section */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Resume * (PDF,DOCX only) - Upload to auto-fill form
              </label>
              {formData.resume ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-green-800 dark:text-green-200">
                      {formData.resume.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile("resume")}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <FileUploadArea type="resume" accept={[".pdf", ".docx"]} />
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Skills{" "}
                {parsedResumeData && (
                  <span className="text-green-600">
                    (Auto-filled from resume)
                  </span>
                )}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formData.skills.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  No skills added yet. Upload your resume or add them manually.
                </p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Cover Letter
              </label>
              <textarea
                rows={6}
                value={formData.coverLetter}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverLetter: e.target.value,
                  }))
                }
                placeholder="Write a compelling cover letter..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Additional Documents */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Additional Documents (Optional)
              </label>
              {formData.additionalDocuments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.additionalDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-gray-800 dark:text-gray-200">
                          {doc.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile("additional", index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileUploadArea
                type="additional"
                accept=".pdf,.doc,.docx"
                multiple
              />
            </div>
          </motion.div>
        )}

        {/* Personal Information - Now Second Section */}
        {currentSection === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              {parsedResumeData && (
                <span className="text-green-600 text-sm">
                  Auto-filled from resume
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        firstName: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        lastName: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.personalInfo.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        email: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.personalInfo.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        phone: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Address
              </label>
              <input
                type="text"
                value={formData.personalInfo.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      address: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  City
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        city: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  State
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        state: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        zipCode: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedinUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        linkedinUrl: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.personalInfo.portfolioUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        portfolioUrl: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Education - Now Third Section */}
        {currentSection === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Education
                </h3>
                {parsedResumeData && (
                  <span className="text-green-600 text-sm">
                    Auto-filled from resume
                  </span>
                )}
              </div>
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Add Education
              </button>
            </div>

            {formData.education.map((edu, index) => (
              <div
                key={edu.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Education {index + 1}
                  </h4>
                  {formData.education.length > 1 && (
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Institution *
                    </label>
                    <input
                      type="text"
                      required
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        updateEducation(edu.id, "fieldOfStudy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={edu.graduationYear}
                      onChange={(e) =>
                        updateEducation(
                          edu.id,
                          "graduationYear",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) =>
                      updateEducation(edu.id, "gpa", e.target.value)
                    }
                    placeholder="e.g., 3.8/4.0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Experience - Now Fourth Section */}
        {currentSection === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Work Experience
                </h3>
                {parsedResumeData && (
                  <span className="text-green-600 text-sm">
                    Auto-filled from resume
                  </span>
                )}
              </div>
              <button
                onClick={addExperience}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Add Experience
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div
                key={exp.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Experience {index + 1}
                  </h4>
                  {formData.experience.length > 1 && (
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={exp.position}
                      onChange={(e) =>
                        updateExperience(exp.id, "position", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      End Date
                    </label>
                    <div className="space-y-2">
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) =>
                          updateExperience(exp.id, "endDate", e.target.value)
                        }
                        disabled={exp.current}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => {
                            updateExperience(
                              exp.id,
                              "current",
                              e.target.checked
                            );
                            if (e.target.checked) {
                              updateExperience(exp.id, "endDate", "");
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          I currently work here
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Job Description & Achievements
                  </label>
                  <textarea
                    rows={4}
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                    placeholder="Describe your role, responsibilities, and key achievements..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Additional Information - Now Fifth Section */}
        {currentSection === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Additional Information
            </h3>

            {/* Availability */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Availability
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Earliest Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.availability.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          startDate: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Notice Period
                  </label>
                  <select
                    value={formData.availability.noticePeriod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          noticePeriod: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select notice period</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">1 Week</option>
                    <option value="2-weeks">2 Weeks</option>
                    <option value="1-month">1 Month</option>
                    <option value="2-months">2 Months</option>
                    <option value="3-months">3 Months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Salary Expectation
                  </label>
                  <input
                    type="text"
                    value={formData.availability.salaryExpectation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          salaryExpectation: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g., $80,000 - $100,000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Work Type Preference
                  </label>
                  <select
                    value={formData.availability.workType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          workType: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Questions */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Additional Questions
              </h4>

              {additionalQuestions.map((question) => (
                <div key={question.id} className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    {question.question}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {question.type === "textarea" && (
                    <textarea
                      rows={4}
                      required={question.required}
                      value={formData.questions[question.id] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          questions: {
                            ...prev.questions,
                            [question.id]: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}

                  {question.type === "radio" && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={formData.questions[question.id] === option}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                questions: {
                                  ...prev.questions,
                                  [question.id]: e.target.value,
                                },
                              }))
                            }
                            className="mr-2"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation & Submit */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {currentSection < sections.length - 1 ? (
            <button
              onClick={() =>
                setCurrentSection(
                  Math.min(sections.length - 1, currentSection + 1)
                )
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Submit Application
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Step {currentSection + 1} of {sections.length}
        </div>
      </div>
    </div>
  );
}

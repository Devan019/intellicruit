import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit3, Save, X, Plus } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    jobTitle: "",
    linkedinUrl: "",
    portfolioUrl: "",
    skills: [],
    experience: [],
    education: [],
  });
  const [newSkill, setNewSkill] = useState("");

  const [newExperience, setNewExperience] = useState({
    position: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/profile");
      const sortedExperiences = sortExperiencesByDate(response.data.experience || []);
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
        city: response.data.city || "",
        state: response.data.state || "",
        zipCode: response.data.zipCode || "",
        jobTitle: response.data.jobTitle || "",
        linkedinUrl: response.data.linkedinUrl || "",
        portfolioUrl: response.data.portfolioUrl || "",
        skills: response.data.skills || [],
        experience: sortedExperiences,
        education: response.data.education || [],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put("/api/profile", formData);
      setProfile(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addExperience = () => {
  if (newExperience.position && newExperience.company && newExperience.startDate) {
    // Validate dates
    const validationError = validateExperienceDates(newExperience);
    if (validationError) {
      alert(validationError);
      return;
    }
    
    // Check for overlapping current positions
    if (newExperience.current && formData.experience.some(exp => exp.current)) {
      if (!confirm("You already have a current position. Continue anyway?")) {
        return;
      }
    }
    
    // Add the new experience
    const updatedExperiences = [...formData.experience, newExperience];
    
    // Sort experiences by date
    const sortedExperiences = sortExperiencesByDate(updatedExperiences);
    
    setFormData(prev => ({
      ...prev,
      experience: sortedExperiences
    }));
    
    // Reset form
    setNewExperience({
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    });
  } else {
    alert("Position, company, and start date are required");
  }
};
  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Helper to convert MM/YYYY to Date object for comparison
  const parseExperienceDate = (dateString) => {
    if (!dateString || dateString.trim() === "") return null;
    const [month, year] = dateString.split("/");
    if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year)))
      return null;
    return new Date(parseInt(year), parseInt(month) - 1);
  };

  // Validates experience dates
  const validateExperienceDates = (experience) => {
    const startDate = parseExperienceDate(experience.startDate);
    if (!startDate) return "Start date must be in MM/YYYY format";

    if (!experience.current) {
      const endDate = parseExperienceDate(experience.endDate);
      if (!endDate) return "End date must be in MM/YYYY format";
      if (endDate < startDate) return "End date cannot be before start date";
    }

    return null; // No error
  };

  // Sort experiences by date (most recent first)
  const sortExperiencesByDate = (experiences) => {
    return [...experiences].sort((a, b) => {
      // Current positions come first
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;

      // Then sort by end date or start date
      const aDate = a.current
        ? parseExperienceDate(a.startDate)
        : parseExperienceDate(a.endDate) || parseExperienceDate(a.startDate);

      const bDate = b.current
        ? parseExperienceDate(b.startDate)
        : parseExperienceDate(b.endDate) || parseExperienceDate(b.startDate);

      // Sort descending (most recent first)
      return bDate - aDate;
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="col-span-2 space-y-6">
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <button
          onClick={() => (editing ? setEditing(false) : setEditing(true))}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {editing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </button>
      </div>

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

            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Job Title"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      jobTitle: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {profile?.firstName || "John"} {profile?.lastName || "Doe"}
                </h3>
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                  {profile?.jobTitle || "Full Stack Developer"}
                </p>
              </>
            )}

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  profile?.email || "john.doe@email.com"
                )}
              </div>
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  profile?.phone || "+1 (555) 123-4567"
                )}
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                {editing ? (
                  <input
                    type="text"
                    value={`${formData.city}, ${formData.state}`}
                    onChange={(e) => {
                      const [city, state] = e.target.value.split(", ");
                      setFormData((prev) => ({
                        ...prev,
                        city: city || "",
                        state: state || "",
                      }));
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="City, State"
                  />
                ) : (
                  `${profile?.city || "San Francisco"}, ${
                    profile?.state || "CA"
                  }`
                )}
              </div>
            </div>

            {editing && (
              <button
                onClick={handleSave}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            )}
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

            {editing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(editing
                ? formData.skills
                : profile?.skills || [
                    "React",
                    "Node.js",
                    "TypeScript",
                    "Python",
                    "AWS",
                    "MongoDB",
                  ]
              ).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {skill}
                  {editing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
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

            {editing && (
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 className="text-md font-medium mb-3 text-gray-800 dark:text-white">
                  Add Experience
                </h5>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Position"
                    value={newExperience.position}
                    onChange={(e) =>
                      setNewExperience((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={newExperience.company}
                    onChange={(e) =>
                      setNewExperience((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Start Date (MM/YYYY)"
                    value={newExperience.startDate}
                    onChange={(e) =>
                      setNewExperience((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="End Date (MM/YYYY)"
                      value={newExperience.endDate}
                      onChange={(e) =>
                        setNewExperience((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      disabled={newExperience.current}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="currentJob"
                        checked={newExperience.current}
                        onChange={(e) =>
                          setNewExperience((prev) => ({
                            ...prev,
                            current: e.target.checked,
                          }))
                        }
                        className="mr-1"
                      />
                      <label
                        htmlFor="currentJob"
                        className="text-xs text-gray-600 dark:text-gray-300"
                      >
                        Current
                      </label>
                    </div>
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                  rows="3"
                />
                <button
                  onClick={addExperience}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </button>
              </div>
            )}

            <div className="space-y-4">
              {editing ? (
                formData.experience.length > 0 ? (
                  formData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 dark:border-opacity-50 relative"
                    >
                      <button
                        onClick={() => removeExperience(index)}
                        className="absolute right-0 top-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {exp.position}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {exp.company} • {exp.startDate} -{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </p>
                      <p className="text-sm mt-2 text-gray-700 dark:text-gray-400">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-gray-500 dark:text-gray-400">
                    No experience added yet.
                  </p>
                )
              ) : formData.experience.length > 0 ? (
                formData.experience.slice(0, 3).map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 dark:border-opacity-50"
                  >
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {exp.position}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {exp.company} • {exp.startDate} -{" "}
                      {exp.current ? "Present" : exp.endDate}
                    </p>
                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-400">
                      {exp.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border-l-4 border-blue-500 pl-4 dark:border-opacity-50">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Position
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Company. • 2023 - Present
                  </p>
                  <p className="text-sm mt-2 text-gray-700 dark:text-gray-400">
                    Job Description
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

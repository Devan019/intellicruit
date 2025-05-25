"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Calendar,
  Check,
} from "lucide-react";
import axios from "axios";

export default function Contact() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: "",
  });

  // Form status
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  // Demo booking status
  const [demoStatus, setDemoStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [demoEmail, setDemoEmail] = useState("");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      value: "intellicruitorg@gmail.com",
      color: "from-blue-500 to-cyan-500",
    },
    // {
    //   icon: Phone,
    //   title: "Call Us",
    //   description: "Speak with our team",
    //   value: "+1 (555) 123-4567",
    //   color: "from-green-500 to-emerald-500",
    // },
    // {
    //   icon: MapPin,
    //   title: "Visit Us",
    //   description: "Our office location",
    //   value: "San Francisco, CA",
    //   color: "from-purple-500 to-pink-500",
    // },
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle contact form submission
  // Handle contact form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.firstName || !formData.email || !formData.message) {
      setFormStatus({
        loading: false,
        success: false,
        error: "Please fill in all required fields",
      });
      return;
    }

    setFormStatus({ loading: true, success: false, error: null });

    try {
      // Send email using the NodeMailer API route
      await axios.post("/api/send-mail", {
        to: "intellicruitorg@gmail.com", // Your company email
        from: formData.email, // Send from the user's email
        replyTo: formData.email, // Ensure replies go to the user
        subject: `Contact Form: ${formData.firstName} ${formData.lastName} from ${formData.company}`,
        text: `
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Company: ${formData.company}

Message:
${formData.message}
      `,
        html: `
<h2>Contact Form Submission</h2>
<p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
<p><strong>Email:</strong> ${formData.email}</p>
<p><strong>Company:</strong> ${formData.company}</p>
<h3>Message:</h3>
<p>${formData.message.replace(/\n/g, "<br>")}</p>
      `,
      });

      // Success
      setFormStatus({ loading: false, success: true, error: null });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setFormStatus({
        loading: false,
        success: false,
        error:
          error.response?.data?.error ||
          "Failed to send message. Please try again.",
      });
    }
  };

  // Handle demo booking
  const handleBookDemo = async () => {
    // Validate email first
    if (!demoEmail || !demoEmail.includes("@")) {
      setDemoStatus({
        loading: false,
        success: false,
        error: "Please provide a valid email address",
      });
      return;
    }

    setDemoStatus({ loading: true, success: false, error: null });

    try {
      // Send email to book a demo
      await axios.post("/api/send-mail", {
        to: "intellicruitorg@gmail.com", // Your company email
        from: demoEmail, // Send from the user's email
        replyTo: demoEmail, // Ensure replies go to the user
        subject: "Demo Booking Request",
        text: `A demo has been requested by ${demoEmail}`,
        html: `
<h2>Demo Booking Request</h2>
<p>A user has requested a demo of IntelliCruit from your website.</p>
<p><strong>Contact Email:</strong> ${demoEmail}</p>
<p>Please reach out to schedule the demo.</p>
      `,
      });

      // Success
      setDemoStatus({ loading: false, success: true, error: null });
      setShowDemoForm(false);
      setDemoEmail("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setDemoStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      console.error("Error booking demo:", error);
      setDemoStatus({
        loading: false,
        success: false,
        error:
          error.response?.data?.error ||
          "Failed to book demo. Please try again.",
      });
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
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
            <MessageCircle className="h-4 w-4" />
            <span>Get In Touch</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Ready to Transform Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Hiring Process?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Contact us today to learn how our AI-powered hiring assistant can
            streamline your talent acquisition process and help you find the
            best candidates faster.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a message
            </h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    placeholder="John"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    placeholder="Doe"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="john@company.com"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Your Company"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message*
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
                  placeholder="Tell us about your hiring challenges..."
                  required
                />
              </motion.div>

              {formStatus.error && (
                <div className="text-red-500 text-sm">{formStatus.error}</div>
              )}

              {formStatus.success && (
                <div className="text-green-500 flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>
                    Message sent successfully! We'll be in touch soon.
                  </span>
                </div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={formStatus.loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formStatus.loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get in touch
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We're here to help you revolutionize your hiring process. Reach
                out to us through any of the following channels.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${info.color}`}
                  >
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {info.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {info.description}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {info.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-6 w-6" />
                <h4 className="text-lg font-semibold">Schedule a Demo</h4>
              </div>
              <p className="mb-4 opacity-90">
                See our AI hiring assistant in action with a personalized demo.
              </p>

              {demoStatus.success && (
                <div className="bg-white bg-opacity-20 p-3 rounded-lg mb-4 flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>
                    Request sent! We'll contact you shortly to schedule your
                    demo.
                  </span>
                </div>
              )}

              {demoStatus.error && (
                <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg mb-4">
                  {demoStatus.error}
                </div>
              )}

              {showDemoForm ? (
                <div className="mt-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-white mb-1">
                      Your Email Address*
                    </label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-blue-600 text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={demoStatus.loading}
                      onClick={handleBookDemo}
                      className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-70"
                    >
                      {demoStatus.loading ? "Processing..." : "Request Demo"}
                    </motion.button>
                    <button
                      onClick={() => setShowDemoForm(false)}
                      className="px-4 py-2 rounded-lg border border-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDemoForm(true)}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Book Demo
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

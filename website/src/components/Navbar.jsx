"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserButton, useAuth, useUser } from "@clerk/nextjs"
import { Menu, X, Bot, UserPlus, LogIn, Briefcase, Moon, Sun, User } from "lucide-react"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import axios from "axios"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch user role when signed in
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn && isLoaded) {
        try {
          const response = await axios.get('/api/get-role')
          setUserRole(response.data.role)
        } catch (err) {
          console.error('Error fetching user role:', err)
          setUserRole(null)
        } finally {
          setRoleLoading(false)
        }
      } else {
        setUserRole(null)
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [isSignedIn, isLoaded])

  const baseNavItems = [
    { name: "Home", href: "/", type: "link" },
    { name: "Features", href: "/#features", type: "link" },
    { name: "Contact", href: "/#contact", type: "link" },
  ]

  // Add role-specific navigation items
  const getNavItems = () => {
    if (!isSignedIn || roleLoading) {
      // Show default navigation for non-signed-in users
      return [...baseNavItems, { name: "Candidate", href: "/candidate", type: "link" }]
    }


    if (userRole === 'HR') {
      return [...baseNavItems, { name: "HR Dashboard", href: "/hr", type: "link", icon: Briefcase }]
    } else if (userRole === 'Candidate') {
      return [...baseNavItems, { name: "Candidate", href: "/candidate", type: "link", icon: User }]
    }
    
    // Fallback for unknown roles
    return [...baseNavItems, { name: "Candidate", href: "/candidate", type: "link" }]

  }

  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  const handleNavigation = (item) => {
    if (item.type === "scroll") {
      scrollToSection(item.href)
    } else {
      setIsOpen(false)
    }
  }

  const currentNavItems = getNavItems()

  const headerClass = isScrolled
    ? "py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700"
    : "py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Intellicruit</span> */}
              <img src="/Intellicruit2.png" alt="" className="h-56"/>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNavItems.map((item) =>
              item.type === "link" ? (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              ) : (
                <motion.button
                  key={item.name}
                  whileHover={{ y: -2 }}
                  onClick={() => handleNavigation(item)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {item.name}
                </motion.button>
              ),
            )}
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 block dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </motion.button>
            

            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center gap-4">
                  {/* Show role badge for signed-in users */}
                  {!roleLoading && userRole && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userRole === 'HR' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}
                      
                    >
                      {userRole}
                    </motion.div>
                  )}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-9 w-9 border-2 border-blue-800 hover:border-blue-400",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/sign-in"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm px-4 py-2 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              ))}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle for mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 block dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Show role badge for mobile users */}
              {isSignedIn && !roleLoading && userRole && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-center"
                >
                  <div className={`px-3 py-1 text-sm font-medium rounded-full ${userRole === 'HR'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                    {userRole === 'HR' ? 'HR Dashboard Access' : 'Candidate Portal Access'}
                  </div>
                </motion.div>
              )}

              {currentNavItems.map((item) =>
                item.type === "link" ? (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center space-x-2 w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    key={item.name}
                    whileHover={{ x: 10 }}
                    onClick={() => handleNavigation(item)}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    {item.name}
                  </motion.button>
                ),
              )}

              {isLoaded && !isSignedIn && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <SignInButton mode="modal">
                    <motion.button
                      whileHover={{ x: 10 }}
                      className="flex items-center space-x-2 w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </motion.button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <motion.button
                      whileHover={{ x: 10 }}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </motion.button>
                  </SignUpButton>
                </div>
              )}

              {isLoaded && isSignedIn && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-9 w-9 border-2 border-blue-800 hover:border-blue-400",
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
import React from "react";

const Loader = ({ 
  size = "medium", 
  variant = "primary", 
  fullScreen = false,
  text = "Loading...",
  showText = true
}) => {
  // Size mapping
  const sizeMap = {
    small: "w-5 h-5 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
    xlarge: "w-16 h-16 border-4"
  };
  
  // Color variants
  const variantMap = {
    primary: "border-blue-600 border-t-transparent",
    secondary: "border-gray-600 border-t-transparent",
    success: "border-green-500 border-t-transparent",
    danger: "border-red-500 border-t-transparent",
    warning: "border-yellow-500 border-t-transparent",
    info: "border-cyan-500 border-t-transparent"
  };

  // Determine size and variant classes
  const sizeClass = sizeMap[size] || sizeMap.medium;
  const variantClass = variantMap[variant] || variantMap.primary;

  const spinnerClasses = `animate-spin rounded-full ${sizeClass} ${variantClass}`;
  
  // Loader container with spinner and optional text
  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {showText && <p className={`mt-2 text-${variant === 'primary' ? 'blue-600' : variant}-600 font-medium`}>{text}</p>}
    </div>
  );

  // If fullScreen, show loader centered on screen with backdrop
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  // Otherwise return just the spinner with optional text
  return loaderContent;
};

export default Loader;

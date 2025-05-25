'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Role selection popup component
 * @param {Object} props
 * @param {boolean} props.isOpen - Control visibility of the popup
 * @param {Function} props.onClose - Function to call when popup is closed
 * @param {Function} props.onRoleSelected - Callback when role is selected (optional)
 */
const PopUp = ({ isOpen, onClose, onRoleSelected = () => {} }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelection = async (role) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      console.log(`User role updated to: ${role}`);

      await user.reload();

      onRoleSelected(role);
      onClose();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Select Your Role</h2>
          <p className="text-gray-600 mt-2">
            Choose your role to access appropriate features
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            disabled={isLoading}
            onClick={() => handleRoleSelection('HR')}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center"
          >
            {isLoading && (
              <span className="inline-block h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
            )}
            HR
          </button>

          <button
            disabled={isLoading}
            onClick={() => handleRoleSelection('Candidate')}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center"
          >
            {isLoading && (
              <span className="inline-block h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
            )}
            Candidate
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;

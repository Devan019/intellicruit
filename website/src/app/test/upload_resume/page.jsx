"use client"
import { useState } from 'react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Clear previous errors when new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadResume(file);
      setUploadedUrl(result.url);
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsLoading(false);
    }
  };

  async function uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  }

  return (
    <div className='mt-16 max-w-md mx-auto p-4 border rounded-lg shadow'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-2 font-medium'>
            Upload Resume (PDF/DOC/DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className='w-full p-2 border rounded'
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !file}
          className={`px-4 py-2 rounded text-white ${
            isLoading || !file ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Upload Resume'}
        </button>

        {error && (
          <p className='text-red-500'>{error}</p>
        )}

        {uploadedUrl && (
          <div className='mt-4 p-3 bg-green-50 rounded'>
            <p className='font-medium'>Upload successful!</p>
            <a 
              href={uploadedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-blue-600 hover:underline break-all'
            >
              {uploadedUrl}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
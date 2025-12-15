import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';

const Dashboard: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadSuccess = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Audio Knowledge Base
        </h1>
        <p className="text-gray-600">
          Upload audio files and ask questions to get instant answers from your content.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Audio File
        </h2>
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Getting Started Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Getting Started
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Upload an audio file (MP3, WAV, M4A, AAC, FLAC, or OGG)</li>
          <li>Wait for automatic transcription</li>
          <li>Start asking questions about the content</li>
        </ul>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h2>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-800">
                  {file.original_filename || file.filename}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded successfully
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

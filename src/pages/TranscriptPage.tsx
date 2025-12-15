import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Transcript {
  id: number;
  audio_file_id: number;
  transcript_text: string;
  language: string;
  confidence_score: number;
  created_at: string;
}

interface AudioFile {
  id: number;
  original_filename: string;
  status: string;
}

const TranscriptPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTranscript();
    fetchAudioFile();
  }, [fileId]);

  const fetchAudioFile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/files/${fileId}`);
      const data = await response.json();
      
      if (data.success) {
        setAudioFile(data.data);
      }
    } catch (err) {
      console.error('Error fetching audio file:', err);
    }
  };

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/transcripts/${fileId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setTranscript(data.data);
      } else {
        setTranscript(null);
      }
    } catch (err) {
      setError('Failed to load transcript');
      console.error('Error fetching transcript:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTranscript = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const response = await fetch(`http://localhost:3001/api/transcripts/${fileId}/generate`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTranscript(data.data);
      } else {
        setError(data.error?.message || 'Failed to generate transcript');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate transcript');
      console.error('Error generating transcript:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/files"
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← Back to Files
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Transcript</h1>
        {audioFile && (
          <p className="text-gray-600 mt-1">
            {audioFile.original_filename}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* No Transcript - Generate Button */}
      {!transcript && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transcript available
          </h3>
          <p className="text-gray-600 mb-6">
            Generate a transcript for this audio file to view and search the content
          </p>
          <button
            onClick={generateTranscript}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Transcript...
              </span>
            ) : (
              'Generate Transcript'
            )}
          </button>
        </div>
      )}

      {/* Transcript Content */}
      {transcript && (
        <div className="space-y-6">
          {/* Transcript Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="text-lg font-medium text-gray-900">
                  {transcript.language || 'English'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence Score</p>
                <p className="text-lg font-medium text-gray-900">
                  {transcript.confidence_score ? `${Math.round(transcript.confidence_score * 100)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Generated</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(transcript.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript Text */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Transcript Text</h2>
              <button
                onClick={() => navigator.clipboard.writeText(transcript.transcript_text)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {transcript.transcript_text}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
            <div className="space-y-3">
              <button
                onClick={generateTranscript}
                disabled={generating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-left flex items-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate Transcript
              </button>
              <Link
                to={`/chat/${fileId}`}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center block"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Start Q&A Chat
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptPage;

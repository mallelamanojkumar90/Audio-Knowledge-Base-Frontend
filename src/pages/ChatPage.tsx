import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  context_sections?: string[]; // sources
  created_at?: string;
}

interface AudioFile {
  id: number;
  original_filename: string;
}

const ChatPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false); // Initial load
  const [sending, setSending] = useState(false); // Sending message
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAudioFile();
    fetchChatHistory();
  }, [fileId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAudioFile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/files/${fileId}`);
      const data = await response.json();
      if (data.success) setAudioFile(data.data);
    } catch (error) {
      console.error('Error loading file info:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/chat/${fileId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const userMsg: Message = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setSending(true);

    try {
      const response = await fetch(`http://localhost:3001/api/chat/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await response.json();

      if (data.success) {
        const aiMsg: Message = {
          role: 'assistant',
          content: data.data.answer,
          context_sections: data.data.sources
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Handle error (maybe add system message)
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Chat with {audioFile?.original_filename || 'Audio File'}
          </h1>
          <Link to={`/transcripts/${fileId}`} className="text-sm text-blue-600 hover:text-blue-800">
            View Transcript
          </Link>
        </div>
        <div className="text-xs text-gray-500">
          Powered by Llama 3 (Groq)
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {loading ? (
           <div className="flex justify-center p-4">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">No messages yet.</p>
            <p>Ask a question about the audio content!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* Sources/Citations */}
                {msg.context_sections && msg.context_sections.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                    <p className="font-semibold text-gray-500 mb-1">Sources:</p>
                    {msg.context_sections.map((source: string, i: number) => (
                      <div key={i} className="mb-1 p-1 bg-gray-50 rounded italic text-gray-400 truncate">
                        "{source.trim()}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 rounded-lg p-4 rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask specific questions about the audio..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FilesPage from './pages/FilesPage';
import TranscriptPage from './pages/TranscriptPage';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/transcripts/:fileId" element={<TranscriptPage />} />
          <Route path="/chat/:fileId" element={<ChatPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

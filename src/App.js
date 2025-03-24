import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MicrosoftLoginApp from './components/MicrosoftLoginApp';
import AuthCallback from './components/AuthCallback';
import WebhookTest from './components/WebhookTest';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MicrosoftLoginApp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/webhook-test" element={<WebhookTest />} />
      </Routes>
    </Router>
  );
}

export default App;

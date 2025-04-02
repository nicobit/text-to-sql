import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ChatPage from '../pages/ChatPage';
import QuestionQueryExamplePage from '../pages/QuestionQueryExamplePage';
import FlowPage from '../pages/FlowPage'; // Ensure the file exists at this path or update the path accordingly

const Content: React.FC = () => {
  return (
    <main
      style={{
        marginTop: 48, // Header height
       // padding: '20px',
        transition: 'margin-left 0.3s',
        height: 'calc(100% - 48px)'
          }}
        >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/settings" element={<h2>Profile Settings</h2>} />
        
        <Route path="/profile/stats" element={<h2>Profile Stats</h2>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/Flow" element={<FlowPage />} />
        <Route path="/settings/Examples" element={<QuestionQueryExamplePage/>} />
      </Routes>
    </main>
  );
};

export default Content;
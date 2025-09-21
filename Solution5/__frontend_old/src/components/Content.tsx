import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ChatPage from '../pages/ChatPage';
import QuestionQueryExamplePage from '../pages/QuestionQueryExamplePage';
import FlowPage from '../pages/FlowPage'; // Ensure the file exists at this path or update the path accordingly
import Login from '../pages/Login';
const Content: React.FC = () => {
  return (
    <>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/settings" element={<h2>Profile Settings</h2>} />
        <Route path="/np/resources" element={<Profile />} />
        
        <Route path="/profile/stats" element={<h2>Profile Stats</h2>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/Flow" element={<FlowPage />} />
        <Route path="/settings/Examples" element={<QuestionQueryExamplePage/>} />
      </Routes>
    </>
  );
};

export default Content;
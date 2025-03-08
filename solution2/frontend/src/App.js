import React from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChartInterface';
import LoginButton from './components/LoginButton';


function App() {
  
  
  const isAuthenticated = useIsAuthenticated();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <ChatInterface /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginButton />} />
    </Routes>
  );
}

export default App;
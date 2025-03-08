import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './App.css';
import { useIsAuthenticated } from "@azure/msal-react";

function App() {
  
  
  const isAuthenticated = useIsAuthenticated();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Navigate replace to="/" />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
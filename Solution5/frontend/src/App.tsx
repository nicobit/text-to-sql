import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import { useIsAuthenticated } from "@azure/msal-react";
import Login from './pages/Login';
import { SnackbarProvider} from 'notistack';

const App: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
     
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
        </Routes>
    
    );
  }

  return (
    <ThemeProvider>
      <SnackbarProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
          {/* Header at the top */}
          <Header />
            <div style={{ display: 'flex', flexGrow: 1 }}>
            {/* Sidebar and Content */}
            <Sidebar />
            <div style={{ flexGrow: 1, height: '100%'}}>
              <Content />
            </div>
            </div>
        </div>
        </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
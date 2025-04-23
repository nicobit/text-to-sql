import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import { useMsal } from "@azure/msal-react";
import Login from './pages/Login';
import { SnackbarProvider} from 'notistack';
import Box from '@mui/material/Box/Box';

import 'driver.js/dist/driver.css';
import './styles/driver-theme.css';  
import { DriverProvider } from 'driverjs-react'; 

//import { DriverProvider, useDriver } from 'driverjs-react'; 

const App: React.FC = () => {
  const { accounts } = useMsal();
  const isAuthenticated = accounts && accounts.length > 0;

  if (!isAuthenticated) {
    console.log("User is not authenticated");
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }else{
    console.log("User is authenticated");

  }
 
  return (
    <ThemeProvider>
      <SnackbarProvider>
      <DriverProvider  driverOptions={{ showProgress: true , popoverClass: 'my-tour' }} >
      
      <Box sx={{ display: 'flex', minHeight: '100vh', width:"100%" , bgcolor: 'blue'}}>
     
       
          <Sidebar />
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'red' }}>
          <Header />
          <Box component="main" sx={{ flex: 1, bgcolor: '#eaeff1' }}>
            <Content />
          </Box>
          <Box component="footer" sx={{ p: 2, bgcolor: '#eaeff1'}}>
            
          </Box>
        </Box>
      </Box>
      </DriverProvider>
        </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
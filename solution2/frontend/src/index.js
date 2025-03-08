import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { msalInstance } from './authConfig';
import { MsalProvider } from "@azure/msal-react";
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryContext';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');
const root = createRoot(container);
// Wrap App in MsalProvider to make MSAL available throughout the app
root.render(
  <MsalProvider instance={msalInstance}>
   <React.StrictMode>
    <CssBaseline />
    <AuthProvider>
      <QueryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryProvider>
    </AuthProvider>
  </React.StrictMode>
  </MsalProvider>

);
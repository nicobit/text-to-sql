import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryContext';
import App from './App';
import { CssBaseline } from '@mui/material';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";


const msalInstance = new PublicClientApplication(msalConfig);


ReactDOM.render(
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
  </MsalProvider>,
  document.getElementById('root')
);
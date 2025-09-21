import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';
import './index.css'; // TailwindCSS 
import './styles/rgl-placeholder.css'
import 'driver.js/dist/driver.css';     // spotlight / tooltip styles
import './i18n'; // i18n setup
import { SnackbarProvider} from 'notistack'; 
import { DriverProvider } from 'driverjs-react'; 

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <MsalProvider instance={msalInstance}>
        <AuthProvider>
        <SnackbarProvider>
          <DriverProvider>
          <QueryProvider>
            <App />
          </QueryProvider>
          </DriverProvider>
          </SnackbarProvider>
        </AuthProvider>
    </MsalProvider>
  </React.StrictMode>
);

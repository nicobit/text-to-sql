import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryContext';
import { PublicClientApplication } from "@azure/msal-browser";
import ThemeProvider from './theme/ThemeProvider';

/* src/main.tsx (or index.tsx) */
import 'driver.js/dist/driver.css';     // spotlight / tooltip styles
import './styles/rgl-placeholder.css'


const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <QueryProvider>
            <ThemeProvider>
              <BrowserRouter>
                <App />
            </BrowserRouter>
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </MsalProvider>
  </StrictMode>,
)

import React, { ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig, loginRequest } from '../authConfig'



const msalInstance = new PublicClientApplication(msalConfig);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export default AuthProvider;
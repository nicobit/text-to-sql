import React, { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalConfig, loginRequest } from "../authConfig";

const msalInstance = new PublicClientApplication(msalConfig);
// Create authentication context
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </MsalProvider>
  );
}

// Internal provider handling login state
function AuthProviderInternal({ children }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      setUser({
        name: account.name,
        username: account.username,
      });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, accounts]);

  // Login function
  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // Logout function
  const logout = () => {
    instance.logoutPopup();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  return useContext(AuthContext);
}
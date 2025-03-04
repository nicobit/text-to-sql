import React, { createContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '../api/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile on initial load
    async function loadUser() {
      const profile = await fetchUserProfile();
      if (profile) {
        setUser(profile);
      }
    }
    loadUser();
  }, []);

  const login = () => {
    // Redirect to Azure AD login page
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=/';
  };

  const logout = () => {
    // Redirect to logout and return to home page after logout
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface AuthResponse {
  account: any;
}

const Login: React.FC = () => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const handleLogin = () => {
    
    instance.loginPopup(loginRequest).then((authResponse: AuthResponse) => {
      console.info("set user info");
      console.info(authResponse);
      const account = instance.getAllAccounts()[0];  // Get the first account
      instance.setActiveAccount(account);  // Set the active account
      navigate('/');  // Redirect to the main page after login
    }).catch((e) => {
      console.error(e);
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Please sign in</Typography>
      <Button variant="contained" color="primary" onClick={handleLogin} sx={{ alignSelf: 'center' }}>
      Login with Azure AD
      </Button>
    </Box>
  );
};

export default Login;
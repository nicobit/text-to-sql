

import { useIsAuthenticated,useMsal  } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { AuthContext } from '../context/AuthContext';
import React, { useContext, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';



function Login() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
   const navigate = useNavigate();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
    });
  };

 
  if(isAuthenticated ){
    navigate('/');
  }

  return (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
  <Typography variant="h5" sx={{ mb: 3 }}>Please sign in</Typography>
  <Button variant="contained" color="primary" onClick={handleLogin}>
    Login with Azure AD
  </Button>
  </Box>
  );
};

export default Login;
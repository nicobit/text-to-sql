

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

import React, { useContext, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export const Login = () => {
  const { instance } = useMsal();
  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
    });
  };
  return (
    
     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Please sign in</Typography>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login with Azure AD
          </Button>
        </Box>
  );
};


import { useIsAuthenticated,useMsal  } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { AuthContext } from '../context/AuthContext';
import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';



function Login() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
     
   const handleLogin = () => {
     console.error("Handle Login");
     console.info("Handle Login");
      instance.loginPopup(loginRequest).then( (authResponse)=>{ 
        console.error("set user info"); 
        setUserInfo(authResponse.account); 
        // After user signs in
        const account = instance.getAllAccounts()[0];  // Get the first account
        instance.setActiveAccount(account);  // Set the active account
      }).catch((e) => {
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
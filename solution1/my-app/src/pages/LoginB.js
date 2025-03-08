import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Please sign in</Typography>
      <Button variant="contained" color="primary" onClick={login}>
        Login with Azure AD
      </Button>
    </Box>
  );
}

export default Login;
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>404 - Page Not Found</Typography>
      <Typography variant="body1">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Go to Dashboard
        </Link>
      </Typography>
    </Box>
  );
}
export default NotFound;
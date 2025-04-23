import React from 'react';
import { AppBar, Toolbar, Typography, Switch, Box, Button, Divider } from '@mui/material';
import { useTheme } from '../theme/ThemeProvider';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { toggleTheme, mode } = useTheme();
  const { instance, accounts } = useMsal();
  const { user } = useAuth();

  const handleLogout = () => {
    instance.logoutPopup();
  };

  return (
    <React.Fragment>
    <AppBar position="sticky" color="primary" sx={{border:0, boxShadow: 0}}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <img src="/logo.png" alt="Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ height: '30px', marginRight: '10px' }} />
          
        </Typography>
        <Box>
          <Switch checked={mode === 'dark'} onChange={toggleTheme} />
          <Typography variant="caption">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Typography>
        </Box>
        <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Divider orientation="vertical" flexItem sx={{ height: '24px' }} />
        </Box>
        {accounts.length > 0 ? (
            
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              <i className="fas fa-user" style={{ marginRight: '5px' }}></i>
              {user?.name || user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
               Guest
            </Typography>
                      
        )}
      </Toolbar>
      
    </AppBar>
    </React.Fragment>
  );
};

export default Header;
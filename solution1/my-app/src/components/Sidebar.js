import React, { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { QueryContext } from '../context/QueryContext';
import { Box, List, ListItem, ListItemText, Divider, Button, Typography } from '@mui/material';

function Sidebar() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { queries, selectQuery } = useContext(QueryContext);

  return (
    <Box sx={{ width: 250, p: 2, borderRight: '1px solid #ddd', height: '100vh', boxSizing: 'border-box' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Text-to-SQL App
      </Typography>
      {user && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          Hello, {user.userDetails}
        </Typography>
      )}
      <Divider />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Previous Queries:</Typography>
      <List>
        {queries.map((entry, idx) => (
          <ListItem button key={idx} onClick={() => selectQuery(idx)}>
            <ListItemText 
              primary={entry.query} 
              primaryTypographyProps={{ noWrap: true, title: entry.query }}
            />
          </ListItem>
        ))}
        {queries.length === 0 && (
          <ListItem>
            <ListItemText primary="(No queries yet)" />
          </ListItem>
        )}
      </List>
      <Divider sx={{ mt: 'auto', mb: 2 }} />
      <Button variant="outlined" color="secondary" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
}

export default Sidebar;
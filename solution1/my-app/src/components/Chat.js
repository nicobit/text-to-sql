import React, { useState, useContext } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Box, TextField, Button, List, ListItem, Typography } from '@mui/material';

function Chat() {
  const { queries, runQuery } = useContext(QueryContext);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Trigger the query processing
    runQuery(input.trim());
    setInput('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat history */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {queries.map((entry, index) => (
            <ListItem key={index} sx={{ display: 'block' }}>
              <Typography variant="body1"><strong>User:</strong> {entry.query}</Typography>
              {entry.error ? (
                <Typography variant="body2" color="error"><strong>Error:</strong> {entry.error}</Typography>
              ) : entry.result ? (
                <Typography variant="body2"><strong>System:</strong> Query executed. Returned {Array.isArray(entry.result) ? entry.result.length : 0} rows.</Typography>
              ) : null}
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Input box */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex' }}>
        <TextField 
          variant="outlined" 
          label="Enter query" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          fullWidth 
        />
        <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
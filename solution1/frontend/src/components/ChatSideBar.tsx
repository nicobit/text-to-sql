import React, { useContext } from 'react';

import { QueryContext } from '../context/QueryContext';
import { Box, List, ListItemButton, ListItemText, Divider, Typography, ListItem } from '@mui/material';

interface Query {
    query: string;
}

const ChatSidebar: React.FC = () => {
   
    const queryContext = useContext(QueryContext);
    
        if (!queryContext) {
          return <div>Loading...</div>;
        }
      
    const { queries, selectQuery } = queryContext;
    

    return (
        <Box sx={{ width: 250, p: 2, borderRight: '1px solid #ddd', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
            <Divider />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Previous Queries:</Typography>
            <List>
                {queries.map((entry: Query, idx: number) => (
                    <ListItemButton key={idx} onClick={() => selectQuery(idx)}>
                        <ListItemText 
                            primary={entry.query} 
                            primaryTypographyProps={{ noWrap: true, title: entry.query }}
                        />
                    </ListItemButton>
                ))}
                {queries.length === 0 && (
                    <ListItem>
                        <ListItemText primary="(No queries yet)" />
                    </ListItem>
                )}
            </List>
            <Divider sx={{ mt: 'auto', mb: 2 }} />
          
        </Box>
    );
}

export default ChatSidebar;
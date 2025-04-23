import { useContext } from 'react';
import { QueryContext } from '../../context/QueryContext';
import ReactMarkdown from 'react-markdown';

import { Box, Typography, List, ListItem } from '@mui/material';



function Reasoning() {
  const queryContext = useContext(QueryContext);
  
  if (!queryContext) {
    return <div>Loading...</div>;
  }
    
  const { queries, selectedIndex } = queryContext;
  
  const currentEntry = (selectedIndex !== null && selectedIndex < queries.length) ? queries[selectedIndex] : null;

  const executionHistory = currentEntry?.execution_history
  


  return (
    <Box sx={{ mt: 2, width: '100%' , height:500, maxHeight:'60vh', position: 'relative' }}>
       <Typography variant="body2" sx={{ mt: 1 }}>
                        
                        {Array.isArray(executionHistory) ? (
                          <List>
                          {executionHistory.map((historyItem, idx) => (
                            <ListItem key={idx} sx={{ display: 'block', mb: 1 }}>
                            {Object.entries(historyItem).map(([key, value]) => (
                              <Typography key={key} variant="body2">
                              <strong>
                                {key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                                :
                              </strong>{' '}
                              {String(value)}
                              </Typography>
                            ))}
                            </ListItem>
                          ))}
                          </List>
                        ) : (
                          <Typography variant="body2">{executionHistory}</Typography>
                        )}
                        </Typography>
    </Box>
  );
}

export default Reasoning;

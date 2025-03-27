import  { useState, useContext, FormEvent } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Box,IconButton, TextField,  List, ListItem, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

/*interface QueryEntry {
    query: string;
    error?: string | null;
    result?: any;
    answer:string;
    chartType:string;
}*/

function Chat() {

    const queryContext = useContext(QueryContext);

    if (!queryContext) {
      return <div>Loading...</div>;
    }
  
    const { queries, runQuery } = queryContext;
    
    const [input, setInput] = useState<string>('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        // Trigger the query processing
        runQuery(input.trim());
        setInput('');
        
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Chat history */}
        <Box
          sx={{
            flexGrow: 1,
            mb: 2,
            overflowY: 'auto' // scroll only here
          }}
        >
          <List>
            {queries.map((entry, index) => (
              <ListItem key={index} sx={{ display: 'block' }}>
                <Typography variant="body1" sx={{ color: 'darkgreen' }}>
                  <strong>User:</strong> {entry.query}
                </Typography>
                {entry.error ? (
                  <Typography variant="body2" color="error">
                    <strong>Error:</strong> {entry.error}
                  </Typography>
                ) : entry.result ? (
                  <div>
                    <Typography variant="body1">
                      <ReactMarkdown>{entry.answer}</ReactMarkdown>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'gray' }}>
                      <strong>System:</strong> Query executed. Returned{' '}
                      {Array.isArray(entry.result) ? entry.result.length : 0} rows.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton
                        sx={{ color: 'gray', fontSize: 'small', outline: 'none', '&:focus': { outline: 'none' } }}
                        aria-label="copy to clipboard"
                        onClick={() => navigator.clipboard.writeText(entry.answer)}
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={{ color: 'gray', fontSize: 'small', outline: 'none', '&:focus': { outline: 'none' } }} aria-label="like">
                        <ThumbUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={{ color: 'gray', fontSize: 'small', outline: 'none', '&:focus': { outline: 'none' }}} aria-label="dislike">
                        <ThumbDownIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={{ color: 'gray', fontSize: 'small', outline: 'none', '&:focus': { outline: 'none' } }} aria-label="speaker">
                        <VolumeUpIcon fontSize="small" />
                    </IconButton>
                    </Box>
                  </div>
                ) : null}
              </ListItem>
            ))}
          </List>
        </Box>
        {/* Input box */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            borderRadius: '10px',
            border: 1,
            borderColor: 'divider',
            p: 1,
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)'
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            minRows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { border: 'none' }
              }
            }}
          />
        </Box>
      </Box>
      
    );
}

export default Chat;
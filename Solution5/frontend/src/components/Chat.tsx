import { useState, useContext, FormEvent } from 'react';
import { QueryContext } from '../context/QueryContext';
import { Box, IconButton, TextField, List, ListItem, Typography } from '@mui/material';
import { Tabs, Tab, Dialog, DialogContent, DialogTitle } from '@mui/material';
import ReactMarkdown from 'react-markdown';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TableViewIcon from '@mui/icons-material/TableView';
import CloseIcon from '@mui/icons-material/Close';
import LoadingIndicator from './LoadingIndicator';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';

function Chat() {
  const queryContext = useContext(QueryContext);

  if (!queryContext) {
    return <div>Loading...</div>;
  }

  const { queries, runQuery , selectQuery} = queryContext;
  

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // State for dialog
  const [selectedTab, setSelectedTab] = useState<number>(0); // State for tabs

  const toggleDialog = (idx?: number) => {
    if (idx !== undefined) {
      selectQuery(idx);
    }
    setIsDialogOpen((prev) => !prev); // Toggle dialog open/close state
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue); // Handle tab change
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput('');
    setLoading(true); // Start loading
    try {
      await runQuery(input.trim());
    } finally {
      setLoading(false); // Stop loading regardless of success or error
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
   
      {/* Chat history */}
      <Box
        sx={{
          flexGrow: 1,
          mb: 2,
          overflowY: 'auto', // scroll only here
        }}
      >
        <List>
          {queries.map((entry, index) => (
            <ListItem
              key={index}
              sx={{ display: 'block' }}
              ref={index === queries.length - 1 ? (el) => el?.scrollIntoView({ behavior: 'smooth' }) : null}
            >
              <Typography variant="body1" sx={{ color: 'darkgreen' }}>
                <strong>User:</strong> {entry.query}
              </Typography>
              {entry.error ? (
                <Typography variant="body2" color="error">
                  <strong>Error:</strong> {entry.error}
                </Typography>
              ) : entry.answer ? (
                <div>
                  <Typography variant="body1">
                    <ReactMarkdown>
                      {entry.result === null ? entry.answer : entry.answer}
                    </ReactMarkdown>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray' }}>
                    <strong>System:</strong> Query executed. Returned{' '}
                    {Array.isArray(entry.result) ? entry.result.length : 0} rows.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton
                      sx={{
                        color: 'gray',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                      }}
                      aria-label="copy to clipboard"
                      onClick={() => navigator.clipboard.writeText(entry.answer)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: 'gray',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                      }}
                      aria-label="like"
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: 'gray',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                      }}
                      aria-label="dislike"
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: 'gray',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                      }}
                      aria-label="speaker"
                    >
                      <VolumeUpIcon fontSize="small" />
                    </IconButton>
                    {entry.result !== null && (
                      <IconButton
                      sx={{
                        color: 'gray',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                      }}
                      aria-label="table"
                      onClick={() => toggleDialog(index)} // Wrap in an arrow function
                      >
                      <TableViewIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </div>
              ) : null}
            </ListItem>
          ))}
        </List>
        {loading ? <LoadingIndicator /> : <p></p>}
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
          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
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
              '& fieldset': { border: 'none' },
            },
          }}
        />
      </Box>
      <Dialog open={isDialogOpen} onClose={() => toggleDialog()} fullWidth maxWidth="lg">
        <DialogTitle>
          Results
          <IconButton
        aria-label="close"
        onClick={() => toggleDialog()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
          >
        <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Results Table" />
          <Tab label="Chart" />
        </Tabs>
        <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 700 }}>
          {selectedTab === 0 && <ResultsTable />}
          {selectedTab === 1 && <BarChart />}
        </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Chat;
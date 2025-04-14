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
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LoadingIndicator from './LoadingIndicator';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import MermaidDiagram from './MermaidDiagram';
import Mermaid from './Mermaid';


function Chat() {
  const queryContext = useContext(QueryContext);

  if (!queryContext) {
    return <div>Loading...</div>;
  }

  const { queries, runQuery , selectQuery} = queryContext;
  

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // State for dialog
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false); // State for full screen
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
                  <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid grey', color: 'grey' }}>
                    <Box
                      sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      }}
                      onClick={() => {
                      const updatedQueries = [...queries];
                      updatedQueries[index] = {
                        ...updatedQueries[index],
                        isExpanded: !updatedQueries[index].isExpanded,
                      };
                      queryContext?.setQueries(updatedQueries);
                      }}
                    >
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      Reasoned
                      </Typography>
                        <IconButton
                        sx={{
                        color: 'lightgrey',
                        fontSize: 'small',
                        outline: 'none',
                        '&:focus': { outline: 'none' },
                        }}
                        aria-label="expand"
                        onClick={() => {
                        const updatedQueries = [...queries];
                        updatedQueries[index] = {
                          ...updatedQueries[index],
                          isExpanded: !updatedQueries[index].isExpanded,
                        };
                        queryContext?.setQueries(updatedQueries);
                        }}
                        >
                        {queries[index].isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                    {queries[index].isExpanded  && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {Array.isArray(entry.execution_history) ? (
                          <List>
                            {entry.execution_history.map((historyItem, idx) => (
                              <ListItem key={idx} sx={{ display: 'block', mb: 1 }}>
                                {Object.entries(historyItem).map(([key, value]) => (
                                  <Typography key={key} variant="body2">
                                    <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}:</strong> {String(value)}
                                  </Typography>
                                ))}
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2">{entry.execution_history}</Typography>
                        )}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="body1">
                    <ReactMarkdown>
                      {entry.result === null ? entry.answer : entry.answer}
                    </ReactMarkdown>
                    <MermaidDiagram chart={entry.mermaid || ''} />
                    
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
      <Dialog
        open={isDialogOpen}
        onClose={() => toggleDialog()}
        fullWidth
        maxWidth="lg"
        fullScreen={isFullScreen} // Add fullScreen prop
      >
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
          <IconButton
        aria-label="toggle fullscreen"
        onClick={() => setIsFullScreen((prev) => !prev)} // Toggle full screen state
        sx={{
          position: 'absolute',
          right: 48,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
          >
        {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Results Table" />
          <Tab label="Chart" />
          <Tab label="Mermaid Diagram" />
        </Tabs>
        <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 700 }}>
          {selectedTab === 0 && <ResultsTable />}
          {selectedTab === 1 && <BarChart />}
          {selectedTab === 2 && <Mermaid />}
        </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Chat;
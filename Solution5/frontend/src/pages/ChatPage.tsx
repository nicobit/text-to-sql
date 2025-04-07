import React, { useState } from 'react';
import Chat from '../components/Chat';
import ContentTitle from '../components/ContentTitle';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import { Box, Tabs, Tab, IconButton, Dialog, DialogContent, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatSideBar from '../components/ChatSideBar';

const ChatPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setIsDialogOpen(prev => !prev);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div style={{ height: '88vh', overflow: 'hidden' }}>
      <ContentTitle title="Questions/SQL Query Examples" />
      {/* Adjust the remaining height by subtracting header height (e.g., 60px) */}
      <Box sx={{ display: 'flex', height: 'calc(100% - 60px)' }}>
        <ChatSideBar />
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <Chat />
        </Box>
      
      </Box>

     
    </div>
  );
};

export default ChatPage;

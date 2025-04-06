import React, { useState } from 'react';
import Chat from '../components/Chat';
import ContentTitle from '../components/ContentTitle';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import { Box, Tabs, Tab, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatSideBar from '../components/ChatSideBar';

const ChatPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
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
            width: isCollapsed ? '100%' : '0%',
            visibility: isCollapsed ? 'visible' : 'hidden',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <Chat />
        </Box>
        {/* Updated container for the Collapse */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: isCollapsed ? 'auto' : '100%',
            transition: 'width 1s ease',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <IconButton
            onClick={toggleCollapse}
            sx={{
              alignSelf: 'flex-end',
              outline: 'none',
              '&:focus': { outline: 'none' }
            }}
          >
            {isCollapsed ? (
              <ExpandMoreIcon style={{ transform: 'rotate(90deg)' }} />
            ) : (
              <ExpandMoreIcon style={{ transform: 'rotate(-90deg)' }} />
            )}
          </IconButton>
          <Collapse in={!isCollapsed} timeout="auto" unmountOnExit sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh',  maxWidth: '70%' }}>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label="Results Table" />
                <Tab label="Chart" />
              </Tabs>
              <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight : 700}}>
                {selectedTab === 0 && <ResultsTable />}
                {selectedTab === 1 && <BarChart />}
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </div>
  );
};

export default ChatPage;

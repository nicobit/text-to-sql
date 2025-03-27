import React, { useState } from 'react';

import Chat from '../components/Chat';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import { Box, Tabs, Tab, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ChatSideBar from '../components/ChatSideBar';


const ChatPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <div style={{ height: '100%' }}>
            <h2>Chat</h2>
             <Box sx={{ display: 'flex', height: '90%' }}>
                        <ChatSideBar/>
                        <Box  sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', width: isCollapsed ? '100%' : '0%', boxSizing: 'border-box' }}>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', height: '100%' }}>
                                <Chat />
                            </Box>
                            
                        </Box>
                        <Box sx={{ width: isCollapsed ? 'auto' : '100%', transition: 'width 1s ease' , overflow: 'hidden' }}>
                                <IconButton onClick={toggleCollapse} sx={{ alignSelf: 'flex-end', outline: 'none', '&:focus': { outline: 'none' } }}>
                                    {isCollapsed ? <ExpandMoreIcon style={{ transform: 'rotate(90deg)' }} /> : <ExpandMoreIcon style={{ transform: 'rotate(-90deg)' }} />}
                                </IconButton>
                                <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                                    <Tabs value={selectedTab} onChange={handleTabChange}>
                                        <Tab label="Results Table" />
                                        <Tab label="Bar Chart" />
                                    </Tabs>
                                    {selectedTab === 0 && <ResultsTable />}
                                    {selectedTab === 1 && <BarChart />}
                                </Collapse>
                            </Box>
            </Box>
        </div>
    );
};

export default ChatPage;

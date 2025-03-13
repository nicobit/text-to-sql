import React, { useState } from 'react';

import Chat from '../components/Chat';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import { Box, Tabs, Tab } from '@mui/material';
import ChatSideBar from '../components/ChatSideBar';

const ChatPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        console.info(event)
        setSelectedTab(newValue);
    };

    return (
        <div>
            <h2>Chat</h2>
        <Box sx={{ display: 'flex' }}>
            <ChatSideBar/>
            <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Chat />
                </Box>
                <Box sx={{ height: '70%' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange}>
                        <Tab label="Results Table" />
                        <Tab label="Bar Chart" />
                    </Tabs>
                    {selectedTab === 0 && <ResultsTable />}
                    {selectedTab === 1 && <BarChart />}
                </Box>
            </Box>
        </Box>
        </div>
    );
}

export default ChatPage;
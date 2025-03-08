import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import ResultsTable from '../components/ResultsTable';
import BarChart from '../components/BarChart';
import { Box, Tabs, Tab } from '@mui/material';

function Dashboard() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
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
  );
}

export default Dashboard;
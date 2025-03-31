import React, { useState } from 'react';
import Box from '@mui/material/Box';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Dashboard,
  
  Chat,
  
} from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';


import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';

import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar expand/collapse
  const [subMenuOpen, setSubMenuOpen] = useState<{ [key: string]: boolean }>({}); // Sub-menu expand/collapse

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Toggle Sub-Menu
  const toggleSubMenu = (id: string) => {
    setSubMenuOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const item = {
    py: '2px',
    px: 3,
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover, &:focus': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      /*color: '#4fc3f7',*/
    },
  };
  
  const itemCategory = {
    boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
    py: 1.5,
    px: 3,
    color: 'rgb(255, 255, 255)',
    '&:hover, &:focus': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      /*color: 'rgb(255, 197, 37)', */
    },
  };

  const categories = [
    {
      id: 'Home',
      icon: '',
      to: '',
      children: [
        { id: 'Dashboard', icon: <Dashboard />,
          to: '/'},
        { id: 'Chat', icon: <Chat/>, to: '/chat'},
      ],
      
    },
    {
      id: 'Settings',
      icon: <SettingsIcon />,
      to: '',
      children: [
        { id: 'General', icon: <SettingsIcon />, to:'' },
        { id: 'Question Ex.', icon: <SettingsInputComponentIcon />, to:'/settings/examples'},
      ],
    },
    {
      id: 'Quality',
      icon: '',
      to: '',
      children: [
        { id: 'Analytics', icon: <SettingsIcon />, to:'' },
        { id: 'Performance', icon: <TimerIcon /> , to:'' },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> , to:'' },
      ],
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? 240 : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? 240 : 60,
          position: 'fixed',
          top: 64, /* Height of the Header */
          height: 'calc(100% - 64px)', /* Fill remaining height */
          overflowX: 'hidden',
          transition: 'width 0.3s',
        },
      }}
    >
      <List>
        {categories.map(({ id, children, icon, to }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            {children && (
              <ListItem
                onClick={() => toggleSubMenu(id)}
                sx={{
                  ...itemCategory,
                  cursor: 'pointer', // Add hand icon on hover
                }}
              >
                  <ListItemIcon>{ isOpen ? (subMenuOpen[id] ? "":(icon || "" ) ):(icon || "" ) }</ListItemIcon>
                <ListItemText primary={isOpen ? id : ''} />
                {subMenuOpen[id] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
            )}

            {!children && (
              <ListItem component={Link} to={to} sx={{ ...itemCategory }}>
                  <ListItemIcon>{ isOpen ? (subMenuOpen[id] ? "":(icon || "" ) ):(icon || "" ) }</ListItemIcon>
                <ListItemText primary={isOpen ? id : ''} />
              </ListItem>
            )}

            {/* Collapse component to handle the visibility of sub-menu items */}
            <Collapse in={subMenuOpen[id]} timeout="auto" unmountOnExit>
              {(children ?? []).map(({ id: childId, icon, to }) => (
                <ListItem disablePadding key={childId} component={Link} to={to} sx={{ bgcolor: '#142840' }}>
                  <ListItemButton sx={{ ...item, bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  <ListItemIcon>{icon}</ListItemIcon> 
                    {/* !/* Uncomment if you want to show icons for sub-menu items */}
                    <ListItemText>{childId}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </Collapse>
          </Box>
        ))}
      </List>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          bgcolor: '#101F33',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: isOpen ? 'flex-end' : 'center',
            padding: '10px',
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              outline: 'none',
              '&:focus': { outline: 'none' },
            }}
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

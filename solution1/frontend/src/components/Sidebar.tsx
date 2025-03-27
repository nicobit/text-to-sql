import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Person,
  Settings,
  Chat,
  SubdirectoryArrowRight,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar expand/collapse
  const [subMenuOpen, setSubMenuOpen] = useState(false); // Sub-menu expand/collapse

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Toggle Sub-Menu
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

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
     
      <div
        style={{
          display: 'flex',
          justifyContent: isOpen ? 'flex-end' : 'center',
          padding: '10px',
        }}
      >
        <IconButton onClick={toggleSidebar} sx={{ outline: 'none', '&:focus': { outline: 'none' } }}>
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </div>
      <Divider />
      <List>
        {/* Dashboard Menu */}
        <ListItem  component={Link} to="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary={isOpen ? 'Dashboard' : ''} />
        </ListItem>
         {/* Chat Menu */}
         <ListItem  component={Link} to="/chat">
          <ListItemIcon>
            <Chat />
          </ListItemIcon>
          <ListItemText primary={isOpen ? 'Chat' : ''} />
        </ListItem>
        {/* Profile Menu with Sub-Menu */}
        <ListItem  onClick={toggleSubMenu}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={isOpen ? 'Profile' : ''} />
          {subMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={subMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem  component={Link} to="/profile/settings" sx={{ pl: 4 }}>
              <ListItemIcon>
                <SubdirectoryArrowRight />
              </ListItemIcon>
              <ListItemText primary={isOpen ? 'Settings' : ''} />
            </ListItem>
            <ListItem  component={Link} to="/profile/stats" sx={{ pl: 4 }}>
              <ListItemIcon>
                <SubdirectoryArrowRight />
              </ListItemIcon>
              <ListItemText primary={isOpen ? 'Stats' : ''} />
            </ListItem>
          </List>
        </Collapse>

        {/* Settings Menu */}
        <ListItem  component={Link} to="/settings">
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary={isOpen ? 'Settings' : ''} />
        </ListItem>
        
      </List>
      
    </Drawer>
  );
};

export default Sidebar;
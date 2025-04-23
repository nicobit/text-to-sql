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



import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SchemaIcon from '@mui/icons-material/Schema';
import HomeIcon from '@mui/icons-material/Home';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import HistoryIcon from '@mui/icons-material/History';



import { Link } from 'react-router-dom';




const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar expand/collapse
  const [subMenuOpen, setSubMenuOpen] = useState<{ [key: string]: boolean }>({}); // Sub-menu expand/collapse


  const showSubMenuIcon = true // Set to false if you don't want to show icons for sub-menu items
  const autoCollapseOtherMenu = true

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

 
  const toggleSubMenu = (id: string) => {
    setSubMenuOpen((prev) => {
      if (autoCollapseOtherMenu) {
        // Collapse all other menus and toggle the selected one
        return {
          [id]: !prev[id],
        };
      } else {
        // Toggle only the selected menu
        return {
          ...prev,
          [id]: !prev[id],
        };
      }
    });
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
      icon: <HomeIcon />,
      to: '',
      children: [
        { id: 'Dashboard', icon: <Dashboard />,
          to: '/'},
        { id: 'Chat', icon: <Chat/>, to: '/chat'},
      ],
      
    },
    {
       id: "Non Prod " ,
       icon: <CloudSyncIcon/>,  
       to: '',
       children:[
        {
          id: 'Resources',
          icon: <CloudIcon />,
          to: '/np/resources'
        },
        {
          id: 'Configuration Settings',
          icon: <SettingsApplicationsIcon />,
          to: '/np/resources'
        },
        {
          id: 'Deployment History',
          icon: <HistoryIcon />,
          to: '/np/resources'
        },

       ],
    },
    {
      id: 'Settings',
      icon: <SettingsIcon />,
      to: '',
      children: [
        { id: 'Flow', icon: <SchemaIcon />, to:'/settings/flow' },
        { id: 'Question / SQL Query', icon: <SettingsSuggestIcon />, to:'/settings/examples'},
      ],
    },
    {
      id: 'Quality',
      icon: <WidgetsIcon />,
      to: '',
      children: [
        { id: 'Analytics', icon: <AnalyticsIcon />, to:'' },
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
        
         
          overflowX: 'hidden',
          transition: 'width 0.3s',
        },
      }}
    >
      <List>
      <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          Admin Portal
        </ListItem>
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
                    {showSubMenuIcon && (
                    <ListItemIcon>{ isOpen ? (subMenuOpen[id] ? "" : (icon || "")) : (icon || "") }</ListItemIcon>
                    )}
                <ListItemText primary={isOpen ? id : ''} />
              </ListItem>
            )}

            {/* Collapse component to handle the visibility of sub-menu items */}
            <Collapse in={subMenuOpen[id]} timeout="auto" unmountOnExit>
              {(children ?? []).map(({ id: childId, icon, to }) => (
                <ListItem disablePadding key={childId} component={Link} to={to} sx={{ bgcolor: '#142840' }}>
                  <ListItemButton sx={{ ...item, bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  {showSubMenuIcon && ( <ListItemIcon>{icon}</ListItemIcon> )}
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

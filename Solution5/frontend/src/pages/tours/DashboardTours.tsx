// src/DashboardTour.tsx

import { useDriver } from 'driverjs-react';

import { IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export default function DashboardTpur() {
  const { driver, setSteps } = useDriver();

  const launch = () => {

     // stop if user has already completed or driver not ready yet
     if (localStorage.getItem('dashTourDone') || !driver) return;
    /* register (or re‑register) the tour steps */
    setSteps([
        {
          element: '.edit-toggle',
          
          popover: {
            title: 'Edit layout',
            description: 'Turn editing on or off here.',
          },
        },
        {
          element: '.add-widget',
          popover: {
            title: 'Add widgets',
            description: 'Open the palette to insert a widget.',
          },
        },
        {
          element: '.drag-handle',
          popover: {
            title: 'Move widgets',
            description: 'Grab the header to drag a widget anywhere.',
          },
        },
      ]);

    driver.drive();      // ⬅️  start when the user clicks
  };

  return (

     <Tooltip title="Help">
        <IconButton color="inherit" onClick={launch}  sx={{
              
              outline: 'none',
              '&:focus': { outline: 'none' },
            }}>
            <HelpIcon />
        </IconButton>
    </Tooltip>
   
  );
}


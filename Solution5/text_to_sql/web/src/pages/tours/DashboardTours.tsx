// src/components/DashboardTour.tsx
import React from 'react';
import { useDriver } from 'driverjs-react';
import { HelpCircle } from 'lucide-react';

export default function DashboardTour() {
  const { driver, setSteps } = useDriver();

  const launch = () => {

    console.log('Launching tour...');
    // stop if user has already completed or driver not ready
    //if (localStorage.getItem('dashTourDone') || !driver) return;
    if (!driver) return;
    console.log('To be started...');
    // register (or re-register) the tour steps
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

    driver.drive(); // start when the user clicks
    localStorage.setItem('dashTourDone', 'true');
  };

  return (
    <div className="relative inline-block group">
      <button
        onClick={launch}
        className="help-button p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5 text-gray-900 dark:text-white" />
      </button>
      <span className="pointer-events-none absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Help
      </span>
    </div>
  );
}

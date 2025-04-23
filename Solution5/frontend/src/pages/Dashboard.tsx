import React from 'react';

import WidgetManager from '../components/WidgetManager';



const Dashboard: React.FC = () => {
    return (
        <div style={{ height: '88vh', overflow: 'auto' }}>
        
         <WidgetManager />
     
        </div>
     );
}
export default Dashboard;

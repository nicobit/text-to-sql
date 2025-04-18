import React from 'react';
import ContentTitle from '../components/ContentTitle';
import WidgetManager from '../components/WidgetManager';



const Dashboard: React.FC = () => {
    return (
        <div style={{ height: '88vh', overflow: 'auto' }}>
        
         <WidgetManager />
        </div>
     );
}
export default Dashboard;

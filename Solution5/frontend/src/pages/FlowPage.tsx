import React from 'react';
import ContentTitle from '../components/ContentTitle';
import { API_BASE_URL } from '../config/settings';



const FlowPage: React.FC = () => {
    return (
        <div style={{ height: '88vh', overflow: 'hidden' }}>
         <ContentTitle title="Natural Language To SQL FLow" />
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <img 
                     src={`${API_BASE_URL}/graph.png`} 
                     alt="Graph" 
                     style={{ width: '150px', cursor: 'pointer' }} 
                     onClick={() => {
                         const modal = document.createElement('div');
                         modal.style.position = 'fixed';
                         modal.style.top = '0';
                         modal.style.left = '0';
                         modal.style.width = '100vw';
                         modal.style.height = '100vh';
                         modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                         modal.style.display = 'flex';
                         modal.style.justifyContent = 'center';
                         modal.style.alignItems = 'center';
                         modal.style.zIndex = '1000';
         
                         const img = document.createElement('img');
                         img.src = `${API_BASE_URL}/graph.png`;
                         img.style.maxWidth = '90%';
                         img.style.maxHeight = '90%';
                         img.style.border = '2px solid white';
                         img.style.borderRadius = '8px';
         
                         modal.appendChild(img);
         
                         modal.onclick = () => {
                         document.body.removeChild(modal);
                         };
         
                         document.body.appendChild(modal);
                     }}
                     />
                     </div>
        </div>
     );
}
export default FlowPage;

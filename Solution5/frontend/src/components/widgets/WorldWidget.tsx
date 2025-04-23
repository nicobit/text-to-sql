import React, { useRef, useState, useLayoutEffect } from 'react';
import WorldMap from "react-svg-worldmap";
import Box from '@mui/material/Box';

import '../../styles/worldmap.css'; 

const WorldWidget: React.FC = () => {


    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    // Update width on mount & window resize
    useLayoutEffect(() => {
        function update() {
        if (containerRef.current) {
            setWidth(containerRef.current.offsetWidth);
        }
        }
        update();
        const resizeObserver = new ResizeObserver(() => update());
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
        
    }, []);

    const COUNTRIES = [
        { iso: 'CH', name: 'Switzerland' },
        { iso: 'GB', name: 'United Kingdom' },
        { iso: 'FR', name: 'France' },
        { iso: 'IT', name: 'Italy' },
        { iso: 'JP', name: 'Japan' },
        { iso: 'IN', name: 'India' },
        { iso: 'SE', name: 'Sweden' },
        { iso: 'AT', name: 'Austria' },
        { iso: 'GR', name: 'Greece' },
      ];
    
    const data = COUNTRIES.map(c => ({ country: c.iso, value: 1 }));
    
     // styleFunction example: countries with a value get blue,
    // others get light gray
    const stylingFunction = ({ countryValue, color }: any) => ({
        fill: countryValue != null ? color : '#b0c4de',  // light steel blue
        stroke: '#FFFFFF',
        strokeWidth: 0.5,
        cursor: countryValue != null ? 'pointer' : 'default'
    });

    return (
       
        
        <Box ref={containerRef} sx={{ flex: 1, width: '100%' , height: '100%'}}>
        {width > 0 && (
          <WorldMap
            color="#1976d2"
            size={width}             // numeric width in px
            data={data}
            backgroundColor="transparent"
            styleFunction={stylingFunction}
          />
        )}
      </Box>
          
    );
};

export default WorldWidget;
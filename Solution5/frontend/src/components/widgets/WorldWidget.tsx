// src/components/WorldWidget.tsx
import React, { useRef, useState, useLayoutEffect } from 'react';
import WorldMap from 'react-svg-worldmap';
import '../../styles/worldmap.css'; 
import { Globe } from 'lucide-react';

// Widget icon for menus or legends
export const icon = <Globe className="w-6 h-6 text-blue-500" />;

const COUNTRIES = [
  { iso: 'CH', name: 'Switzerland' },
  { iso: 'GB', name: 'United Kingdom' },
  { iso: 'FR', name: 'France' },
  { iso: 'IT', name: 'Italy' },
  { iso: 'JP', name: 'Japan' },
  { iso: 'IN', name: 'India' },
  { iso: 'SE', name: 'Sweden' },
  { iso: 'AT', name: 'Austria' },
  { iso: 'GR', name: 'Greece' },
];

const data = COUNTRIES.map((c) => ({ country: c.iso, value: 1 }));

// Style active countries blue, others light gray
const stylingFunction = ({ countryValue, color }: any) => ({
  fill: countryValue != null ? color : '#e5e7eb', // gray-200
  stroke: '#ffffff',
  strokeWidth: 0.5,
  cursor: countryValue != null ? 'pointer' : 'default',
});

export default function WorldWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Update width on mount & resize
  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      {width > 0 && (
        <WorldMap
          color="#3b82f6"              /* blue-500 */
          size={width}                   /* px width */
          data={data}
          backgroundColor="transparent"
          styleFunction={stylingFunction}
        />
      )}
    </div>
  );
}

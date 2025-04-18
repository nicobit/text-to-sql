import React from 'react';
import { WidgetType } from '../types';
import { motion } from 'framer-motion';

interface Props {
  addWidget: (type: WidgetType) => void;
}

const types: { type: WidgetType; label: string }[] = [
  { type: 'clock', label: 'Clock' },
  { type: 'counter', label: 'Counter' },
  { type: 'quote', label: 'Quote' }
];

const Palette: React.FC<Props> = ({ addWidget }) => {
  return (
    <div className="palette">
      <h3>Widget Palette</h3>
      {types.map(({ type, label }) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addWidget(type)}
        >
          ➕ {label}
        </motion.button>
      ))}
    </div>
  );
};

export default Palette;

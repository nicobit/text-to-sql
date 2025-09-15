import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CounterWidget: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="counter-widget"
      style={{ textAlign: 'center' }}
    >
      <h2>{count}</h2>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </motion.div>
  );
};

export default CounterWidget;

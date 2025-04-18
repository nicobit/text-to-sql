import React from 'react';
import { WidgetType } from '../types';
import ClockWidget from '../widgets/ClockWidget';
import CounterWidget from '../widgets/CounterWidget';
import QuoteWidget from '../widgets/QuoteWidget';

interface Props {
  id: string;
  type: WidgetType;
  remove: (id: string) => void;
}

const componentMap: Record<WidgetType, React.FC> = {
  clock: ClockWidget,
  counter: CounterWidget,
  quote: QuoteWidget
};

const WidgetWrapper: React.FC<Props> = ({ id, type, remove }) => {
  const Cmp = componentMap[type];

  return (
    <div className="widget-box">
      <div className="toolbar drag-handle">
        <span>{type.toUpperCase()}</span>
        <button style={{ marginLeft: 'auto' }} onClick={() => remove(id)}>✖</button>
      </div>
      <div className="widget-content">
        <Cmp />
      </div>
    </div>
  );
};

export default WidgetWrapper;

import React, { useCallback, useEffect, useReducer } from 'react';
import { WidthProvider, Responsive, Layout, Layouts } from 'react-grid-layout';
import { v4 as uuidv4 } from 'uuid';
import Palette from './components/Palette';
import WidgetWrapper from './components/WidgetWrapper';
import { WidgetConfig, WidgetType, DashboardSnapshot } from './types';
import { motion } from 'framer-motion';
import './styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface State {
  widgets: WidgetConfig[];
  layouts: Layouts;
  history: DashboardSnapshot[];
  historyIndex: number;
}

type Action =
  | { type: 'ADD_WIDGET'; widgetType: WidgetType }
  | { type: 'REMOVE_WIDGET'; id: string }
  | { type: 'UPDATE_LAYOUT'; layouts: Layouts }
  | { type: 'LOAD_SNAPSHOT'; snapshot: DashboardSnapshot }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const reducer = (state: State, action: Action): State => {
  const saveHistory = (partial: Partial<State>): State => {
    const newSnapshot: DashboardSnapshot = {
      widgets: partial.widgets ?? state.widgets,
      layouts: partial.layouts ?? state.layouts
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newSnapshot);
    return {
      ...state,
      ...partial,
      history: newHistory,
      historyIndex: newHistory.length - 1
    };
  };

  switch (action.type) {
    case 'ADD_WIDGET': {
      const id = uuidv4();
      const newWidget: WidgetConfig = { id, type: action.widgetType };
      const lgLayout: Layout[] = [...(state.layouts.lg || [])];
      lgLayout.push({
        i: id,
        x: 0,
        y: Infinity,
        w: 4,
        h: 4,
        minW: 2,
        minH: 2
      });
      const newLayouts = { ...state.layouts, lg: lgLayout };
      return saveHistory({ widgets: [...state.widgets, newWidget], layouts: newLayouts });
    }
    case 'REMOVE_WIDGET': {
      const newWidgets = state.widgets.filter(w => w.id !== action.id);
      const newLayouts = { ...state.layouts };
      Object.keys(newLayouts).forEach(brk => {
        newLayouts[brk] = (newLayouts[brk] || []).filter(l => l.i !== action.id);
      });
      return saveHistory({ widgets: newWidgets, layouts: newLayouts });
    }
    case 'UPDATE_LAYOUT': {
      return saveHistory({ layouts: action.layouts });
    }
    case 'LOAD_SNAPSHOT': {
      return {
        ...state,
        widgets: action.snapshot.widgets,
        layouts: action.snapshot.layouts,
        history: [action.snapshot],
        historyIndex: 0
      };
    }
    case 'UNDO': {
      if (state.historyIndex === 0) return state;
      const prev = state.history[state.historyIndex - 1];
      return { ...state, ...prev, historyIndex: state.historyIndex - 1 };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const next = state.history[state.historyIndex + 1];
      return { ...state, ...next, historyIndex: state.historyIndex + 1 };
    }
    default:
      return state;
  }
};

const initialSnapshot: DashboardSnapshot = {
  widgets: [],
  layouts: { lg: [] }
};

const encodeSnapshot = (snap: DashboardSnapshot) =>
  btoa(encodeURIComponent(JSON.stringify(snap)));

const decodeSnapshot = (str: string): DashboardSnapshot | null => {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch {
    return null;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    widgets: initialSnapshot.widgets,
    layouts: initialSnapshot.layouts,
    history: [initialSnapshot],
    historyIndex: 0
  });

  // Load from URL if snapshot param exists
  useEffect(() => {
    const url = new URL(window.location.href);
    const snap = url.searchParams.get('snapshot');
    if (snap) {
      const decoded = decodeSnapshot(snap);
      if (decoded) dispatch({ type: 'LOAD_SNAPSHOT', snapshot: decoded });
    }
  }, []);

  const addWidget = (type: WidgetType) => dispatch({ type: 'ADD_WIDGET', widgetType: type });
  const removeWidget = (id: string) => dispatch({ type: 'REMOVE_WIDGET', id });
  const onLayoutChange = (_: Layout[], layouts: Layouts) =>
    dispatch({ type: 'UPDATE_LAYOUT', layouts });

  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });

  const share = useCallback(() => {
    const snapshot: DashboardSnapshot = { widgets: state.widgets, layouts: state.layouts };
    const url = new URL(window.location.href);
    url.searchParams.set('snapshot', encodeSnapshot(snapshot));
    navigator.clipboard.writeText(url.toString());
    alert('Snapshot URL copied to clipboard!');
  }, [state.widgets, state.layouts]);

  return (
    <div className="dashboard-container">
      <Palette addWidget={addWidget} />
      <div style={{ flex: 1, padding: 8, overflow: 'auto' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <button onClick={undo} disabled={state.historyIndex === 0}>Undo</button>{' '}
            <button onClick={redo} disabled={state.historyIndex === state.history.length - 1}>Redo</button>{' '}
            <button onClick={share}>Share Snapshot</button>
          </div>
          <ResponsiveGridLayout
            className="layout"
            layouts={state.layouts}
            rowHeight={30}
            cols={{ lg: 12, md: 10, sm: 6 }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            draggableHandle=".drag-handle"
            onLayoutChange={onLayoutChange}
            preventCollision={true}
          >
            {state.widgets.map(w => (
              <div key={w.id} data-grid={(state.layouts.lg || []).find(l => l.i === w.id)}>
                <WidgetWrapper id={w.id} type={w.type} remove={removeWidget} />
              </div>
            ))}
          </ResponsiveGridLayout>
        </motion.div>
      </div>
    </div>
  );
};

export default App;

// src/components/WidgetManager.tsx
import React, { useEffect, useReducer, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { v4 as uuid } from 'uuid';
import { loadDashboard, saveDashboard } from '../api/dashboard';
import { TabConfig, WidgetType } from '../types';
import Palette from './Palette';
import DashboardTour from '../pages/tours/DashboardTours';
import { Grid, Plus, Check, Edit3, X, Edit2 } from 'lucide-react';
import WidgetGrid from './WidgetGrid';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

interface State {
  tabs: TabConfig[];
  active: number;
}

type Action =
  | { type: 'SET'; tabs: TabConfig[] }
  | { type: 'PATCH_TAB'; index: number; patch: Partial<TabConfig> }
  | { type: 'ADD_TAB' }
  | { type: 'REMOVE_TAB'; index: number }
  | { type: 'SET_ACTIVE'; index: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET':
      return { ...state, tabs: action.tabs };
    case 'PATCH_TAB': {
      const next = [...state.tabs];
      next[action.index] = { ...next[action.index], ...action.patch };
      return { ...state, tabs: next };
    }
    case 'ADD_TAB': {
      const newTab: TabConfig = {
        id: uuid(),
        name: `Tab ${state.tabs.length + 1}`,
        widgets: [],
        layouts: { lg: [] },
      };
      return { ...state, tabs: [...state.tabs, newTab], active: state.tabs.length };
    }
    case 'REMOVE_TAB': {
      const remaining = state.tabs.filter((_, i) => i !== action.index);
      return { ...state, tabs: remaining, active: Math.max(0, state.active - 1) };
    }
    case 'SET_ACTIVE':
      return { ...state, active: action.index };
    default:
      return state;
  }
};

export default function WidgetManager() {
  const { instance } = useMsal();
  const [state, dispatch] = useReducer(reducer, { tabs: [], active: 0 });
  const [editMode, setEditMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [addType, setAddType] = useState<WidgetType | null>(null);
  const [renameIdx, setRenameIdx] = useState<number | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // Load or initialize dashboard tabs
  useEffect(() => {
    (async () => {
      try {
        await instance.initialize();
        const tabs = await loadDashboard(instance);
        dispatch({ type: 'SET', tabs: tabs || [{ id: uuid(), name: 'Home', widgets: [], layouts: { lg: [] } }] });
      } catch {
        dispatch({ type: 'SET', tabs: [{ id: uuid(), name: 'Home', widgets: [], layouts: { lg: [] } }] });
      }
    })();
  }, [instance]);

  // Save on changes in edit mode
  useEffect(() => {
    if (editMode) {
      const t = setTimeout(() => saveDashboard(instance, state.tabs).catch(console.error), 800);
      return () => clearTimeout(t);
    }
  }, [state.tabs, editMode, instance]);

  // Handle palette add request
  useEffect(() => {
    if (addType && state.tabs[state.active]) {
      const id = uuid();
      const newWidget = { id, type: addType };
      const tab = state.tabs[state.active];
      const yMax = tab.layouts.lg?.reduce((max, l) => Math.max(max, l.y + l.h), 0) || 0;
      const layoutItem = { i: id, x: 0, y: yMax, w: 2, h: 3, minW: 1, minH: 2 };
      // propagate to all breakpoints
      const layouts = Object.fromEntries(
        Object.entries(tab.layouts).map(([bp, arr]) => [bp, [...arr, layoutItem]])
      ) as TabConfig['layouts'];
      dispatch({ type: 'PATCH_TAB', index: state.active, patch: { widgets: [...tab.widgets, newWidget], layouts } });
      setAddType(null);
    }
  }, [addType, state.active, state.tabs]);

  const current = state.tabs[state.active];

  const openRename = (i: number) => { setRenameIdx(i); setRenameVal(state.tabs[i].name); };
  const saveRename = () => {
    if (renameIdx !== null) {
      dispatch({ type: 'PATCH_TAB', index: renameIdx, patch: { name: renameVal } });
      setRenameIdx(null);
    }
  };

  

  return (
    <div className="flex flex-col w-full h-full" >
     
      <div className="flex  bg-gray-100 dark:bg-gray-900 p-2" style={{ height: 'auto' }}>
        <Tabs value={state.tabs[state.active]?.name || ''}>
        <TabsHeader indicatorProps={{ className: "bg-blue-500" }} placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
        {state.tabs.map((tab, i) => {
          const active = i === state.active;
          return (
            <Tab
            key={tab.id}
            value={tab.name}
            onClick={() => { dispatch({ type: 'SET_ACTIVE', index: i }); }}
            className={`${active ? 'active-tab-class' : 'inactive-tab-class'} whitespace-nowrap px-4`}
            style={{ cursor: 'pointer' }}
            
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            >
            <div className="flex items-center">
              {tab.name}
              {editMode && (
              <button
          onClick={(e) => { e.stopPropagation(); openRename(i); }}
          className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none no-drag"
          style={{ cursor: 'pointer' }}
              >
          <Edit2 size={16} />
              </button>
              )}
              {editMode && state.tabs.length > 1 && (
              <button
          onClick={(e) => {
          e.stopPropagation();
          if (confirm('Delete this tab?')) dispatch({ type: 'REMOVE_TAB', index: i });
          }}
          className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none no-drag"
          style={{ cursor: 'pointer' }}
              >
          <X size={16} />
              </button>
              )}
            </div>
            </Tab>
          );
        })}
         </TabsHeader>
         </Tabs>
        <div className="flex items-center space-x-3 ml-auto">
          {editMode && (
        <button onClick={() => dispatch({ type: 'ADD_TAB' })} title="Add tab"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
          <Plus size={20} />
        </button>
          )}
          <button onClick={() => setEditMode(!editMode)} title={editMode ? 'Finish editing' : 'Edit layout'}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none edit-toggle">
        {editMode ? <Check size={20} /> : <Edit3 size={20} />}
          </button>
          {editMode && (
        <button onClick={() => setPaletteOpen(true)} title="Add widget"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none add-widget">
          <Grid size={20} />
        </button>
          )}
          <DashboardTour />
        </div>
      
      </div>

      {/* Content */}
      <div className="flex-1 w-full h-full overflow-hidden">
        {current && (
          <WidgetGrid
            tab={current}
            editMode={editMode}
            onUpdate={(patch) => dispatch({ type: 'PATCH_TAB', index: state.active, patch })}
          />
        )}
      </div>

      {/* Palette */}
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAdd={(t) => setAddType(t)} />

      {/* Rename Modal */}
      {renameIdx !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRenameIdx(null)} />
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 z-10 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rename Tab</h2>
            <input
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveRename())}
              className="mt-4 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setRenameIdx(null)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none">
                Cancel
              </button>
              <button onClick={saveRename} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

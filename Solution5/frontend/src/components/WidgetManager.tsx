// src/components/Dashboard.tsx
import React, { useEffect, useReducer, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
} from '@mui/material';

import AddBoxIcon      from '@mui/icons-material/AddBox';
import WidgetsIcon     from '@mui/icons-material/Widgets';
import CheckIcon       from '@mui/icons-material/Check';
import EditIcon        from '@mui/icons-material/Edit';
import CloseIcon       from '@mui/icons-material/Close';
import RenameIcon      from '@mui/icons-material/DriveFileRenameOutline';

import { v4 as uuid } from 'uuid';
import { loadDashboard, saveDashboard } from '../api/dashboard';
import { TabConfig, WidgetType } from '../types';
import WidgetGrid from './WidgetGrid';
import Palette    from './Palette';

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
      next[action.index] = { ...next[action.index], ...action.patch } as TabConfig;
      return { ...state, tabs: next };
    }

    case 'ADD_TAB': {
      const newTab: TabConfig = {
        id: uuid(),
        name: `Tab ${state.tabs.length + 1}`,
        widgets: [],
        layouts: { lg: [] }
      };
      return { ...state, tabs: [...state.tabs, newTab], active: state.tabs.length };
    }

    case 'REMOVE_TAB': {
      const next = state.tabs.filter((_, i) => i !== action.index);
      return { ...state, tabs: next, active: Math.max(0, state.active - 1) };
    }

    case 'SET_ACTIVE':
      return { ...state, active: action.index };

    default:
      return state;
  }
};

const WidgetManager: React.FC = () => {
  /** ------------------ local state ------------------ **/
  const [state, dispatch] = useReducer(reducer, { tabs: [], active: 0 });
  const [editMode, setEditMode] = useState(false);

  // palette (add‑widget) dialog
  const [paletteOpen, setPaletteOpen]       = useState(false);
  const [paletteWidgetType, setPaletteType] = useState<WidgetType | null>(null);

  // rename dialog
  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  /** ------------------ init + autosave ------------------ **/
  useEffect(() => {
    (async () => {
      try {
        dispatch({ type: 'SET', tabs: await loadDashboard() });
      } catch {
        dispatch({
          type: 'SET',
          tabs: [{
            id: uuid(), name: 'Home', widgets: [], layouts: { lg: [] }
          }]
        });
      }
    })();
  }, []);

  // debounce‑save every 800 ms
  useEffect(() => {
    const id = setTimeout(() => saveDashboard(state.tabs).catch(console.error), 800);
    return () => clearTimeout(id);
  }, [state.tabs]);

  /** ------------------ rename helpers ------------------ **/
  const openRename = (i: number) => {
    setRenameIndex(i);
    setRenameValue(state.tabs[i].name);
  };
  const saveRename = () => {
    if (renameIndex !== null)
      dispatch({ type: 'PATCH_TAB', index: renameIndex, patch: { name: renameValue } });
    setRenameIndex(null);
  };

  /** ------------------ JSX ------------------ **/
  const currentTab = state.tabs[state.active];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ---------- Top Bar ---------- */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Dashboard</Typography>

          {/* Edit‑mode toggle */}
          <Tooltip title={editMode ? 'Finish editing' : 'Edit layout'}>
            <IconButton edge="end" onClick={() => setEditMode(e => !e)}>
              {editMode ? <CheckIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>

          {/* Add widget (only in edit‑mode) */}
          {editMode && currentTab && (
            <Tooltip title="Add widget">
              <IconButton edge="end" onClick={() => setPaletteOpen(true)}>
                <AddBoxIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* ---------- Tabs ---------- */}
      <Tabs
        value={state.active}
        onChange={(_e, v) => dispatch({ type: 'SET_ACTIVE', index: v })}
        variant="scrollable"
        scrollButtons="auto"
      >
        {state.tabs.map((t, i) => (
          <Tab
            key={t.id}
            wrapped
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t.name}
                {/* rename icon (span = not a <button>) */}
                <IconButton
                  component="span"
                  size="small"
                  disableRipple
                  onClick={e => { e.stopPropagation(); openRename(i); }}
                >
                  <RenameIcon fontSize="inherit" />
                </IconButton>
                {/* remove tab */}
                {state.tabs.length > 1 && (
                  <IconButton
                    component="span"
                    size="small"
                    disableRipple
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_TAB', index: i }); }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                )}
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* ---------- Active tab content ---------- */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {currentTab && (
          <WidgetGrid
            tab={currentTab}
            editMode={editMode}
            addRequest={paletteWidgetType ?? undefined}
            clearAddRequest={() => setPaletteType(null)}
            onUpdate={patch => dispatch({ type: 'PATCH_TAB', index: state.active, patch })}
          />
        )}
      </Box>

      {/* ---------- Palette dialog ---------- */}
      <Palette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAdd={t => setPaletteType(t)}
      />

      {/* ---------- Rename dialog ---------- */}
      <Dialog open={renameIndex !== null} onClose={() => setRenameIndex(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Tab</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            label="Tab name"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveRename(); } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameIndex(null)}>Cancel</Button>
          <Button onClick={saveRename} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WidgetManager;

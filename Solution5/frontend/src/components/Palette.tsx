import React from 'react';
import { Dialog, DialogTitle, List, ListItemButton, ListItemText } from '@mui/material';
import { WidgetType } from '../types';
const options: { type: WidgetType; label: string }[] = [ { type: 'chart', label: 'Chart' }, { type: 'text', label: 'Text' }, { type: 'table', label: 'Table' } ];
interface Props { open: boolean; onClose: () => void; onAdd: (t: WidgetType) => void; }
const Palette: React.FC<Props> = ({ open, onClose, onAdd }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Select widget</DialogTitle>
    <List>
      {options.map(o => (
        <ListItemButton key={o.type} onClick={() => { onAdd(o.type); onClose(); }}><ListItemText primary={o.label} /></ListItemButton>
      ))}
    </List>
  </Dialog>
);
export default Palette;
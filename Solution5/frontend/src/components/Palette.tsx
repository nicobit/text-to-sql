import { Dialog, DialogTitle, List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { WidgetType } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
}
import React, { useState } from 'react';

const Palette: React.FC<Props> = ({ open, onClose, onAdd }: Props) => {
  const [options, setOptions] = useState<Array<{ type: WidgetType; label: string; icon: React.ReactNode }>>([]);

  React.useEffect(() => {
    const loadWidgets = async () => {
      const widgetFiles = Object.entries(
        import.meta.glob('../components/widgets/*Widget.tsx', { eager: true })
      );

      const loadedOptions = widgetFiles.map(([path, module]: [string, any]) => {
        const name = path.match(/\/([^/]+)Widget\.tsx$/)?.[1];
        const label = name
          ? name.replace(/([a-z])([A-Z])/g, '$1 $2').trim().replace(/^./, str => str.toUpperCase())
          : '';
        const icon = module?.icon || null; // Assume each widget exports an `icon` property
        return name ? { type: name.toLowerCase() as WidgetType, label, icon } : { type: '' as WidgetType, label: '', icon: null };
      });

      setOptions(loadedOptions);
    };

    loadWidgets();
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select widget</DialogTitle>
      <List>
        {options.map((o: { type: WidgetType; label: string; icon: React.ReactNode }) => (
          <ListItemButton key={o.type} onClick={() => onAdd(o.type)}>
            {o.icon && <ListItemIcon>{o.icon}</ListItemIcon>}
            <ListItemText primary={o.label} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
};

export default Palette;

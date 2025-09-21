
import React from 'react';
import { Card, CardHeader, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { WidgetConfig } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const registry = Object.fromEntries(
    Object.entries(import.meta.glob('./*Widget.tsx', { eager: true }))
        .map(([path, module]) => {
            const name = path.match(/\.\/(.*)Widget\.tsx$/)?.[1]?.toLowerCase();
            return name ? [name, (module as { default: React.ComponentType }).default] : null;
        })
        .filter((entry): entry is [string, React.ComponentType] => entry !== null)
) as Record<string, React.ComponentType>;

interface Props {
    widget: WidgetConfig;
    editMode: boolean;
    onRemove: () => void;
    layout: {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    onLayoutChange: (layout: {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }) => void;
}

const WidgetWrapper: React.FC<Props> = ({ widget, editMode, onRemove, layout }) => {
    const Comp = registry[widget.type];
    const showTitle = true;

    return (
        <div
            style={{ width: '100%', height: '100%' ,
                gridArea: `${layout.y + 1} / ${layout.x + 1} / span ${layout.h} / span ${layout.w}`,
            }}
        >
            <Card
                className={editMode ? 'drag-handle' : undefined}
                sx={{
                    height: '100%',
                    // Ensure the card matches the parent div's width
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: editMode ? 'move' : 'default',
                                        }}
                                        >
                                        {showTitle && (
                                            <CardHeader
                                                title={widget.type.toUpperCase()} // Display the widget type in uppercase
                                                sx={{ pb: 0, fontSize: '16px' }} // Reduced padding and font size for a compact header
                                                action={
                                                    editMode && (
                                                        <IconButton size="small" className="no-drag" onClick={onRemove}>
                                                            <DeleteIcon fontSize="inherit" /> {/* Small delete icon for removing the widget */}
                                                        </IconButton>
                                                    )
                                                }
                                            />
                                        )}  <CardContent sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
                    <Comp />
                </CardContent>
            </Card>
        </div>
    );
};

export default WidgetWrapper;

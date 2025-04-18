import ChartWidget from './ChartWidget';
import TextWidget from './TextWidget';
import TableWidget from './TableWidget';
import React from 'react';
import { Card, CardHeader, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { WidgetConfig } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const registry = { chart: ChartWidget, text: TextWidget, table: TableWidget } as const;

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

const WidgetWrapper: React.FC<Props> = ({ widget, editMode, onRemove, layout, onLayoutChange }) => {
    const Comp = registry[widget.type];

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
                    width: '100%', // Ensure the card matches the parent div's width
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: editMode ? 'move' : 'default',
                }}
            >
                <CardHeader
                    title={widget.type.toUpperCase()}
                    sx={{ pb: 0 }}
                    action={
                        editMode && (
                            <IconButton size="small" className="no-drag" onClick={onRemove}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        )
                    }
                />
                <CardContent sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
                    <Comp />
                </CardContent>
            </Card>
        </div>
    );
};

export default WidgetWrapper;

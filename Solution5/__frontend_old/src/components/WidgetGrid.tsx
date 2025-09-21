import React, { useEffect } from 'react';
import { WidthProvider, Responsive, Layout, Layouts } from 'react-grid-layout';
import Box from '@mui/material/Box';
import { TabConfig, WidgetType } from '../types';
import { v4 as uuid } from 'uuid';
import WidgetWrapper from './widgets/WidgetWrapper';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Breakpoints & columns: 12‑col grid at every size
const breakpoints = { lg: 1200, md: 996, sm: 768 } as const;
const cols        = { lg: 12,   md: 12,  sm: 12  } as const;

type BP = keyof typeof breakpoints;

interface Props {
    tab: TabConfig;
    editMode: boolean;
    addRequest?: WidgetType;
    clearAddRequest: () => void;
    onUpdate: (patch: Partial<TabConfig>) => void;
}

const WidgetGrid: React.FC<Props> = ({ tab, editMode, addRequest, clearAddRequest, onUpdate }) => {
    /* ------------------------------------------------------------------
     * Helpers
     * ----------------------------------------------------------------*/
    const nextY = (layout: Layout[]) =>
        layout.length ? Math.max(...layout.map(l => l.y + l.h)) : 0;

    const propagateToAllBreakpoints = (item: Layout): Layouts => {
        const next: Layouts = { ...tab.layouts };
        (Object.keys(breakpoints) as BP[]).forEach(bp => {
            const arr = next[bp] ? [...next[bp]!] : [];
            if (!arr.find(l => l.i === item.i)) arr.push({ ...item });
            next[bp] = arr;
        });
        return next;
    };

    const addWidget = (type: WidgetType) => {
        const id = uuid();
        const base: Layout = {
            i: id,
            x: 0,
            y: nextY(tab.layouts.lg || []),
            w: 2,
            h: 3,
            minW: 1,
            minH: 2
        };
        onUpdate({
            widgets: [...tab.widgets, { id, type }],
            layouts: propagateToAllBreakpoints(base)
        });
    };

    /* Palette request (fire once) */
    useEffect(() => {
        if (addRequest) {
            addWidget(addRequest);
            clearAddRequest();
        }
    }, [addRequest, clearAddRequest]);

    const onLayoutChange = (_: Layout[], layouts: Layouts) => onUpdate({ layouts });

   

    const onResizeStop = (layout: Layout[], newItem: Layout) => {
        const updatedLayouts = layout.map(item => (item.i === newItem.i ? newItem : item));
        const adjustedLayouts = adjustPositions(updatedLayouts);
    
        const layouts: Layouts = { ...tab.layouts };
        (Object.keys(breakpoints) as BP[]).forEach(bp => {
            layouts[bp] = layouts[bp]?.map(item =>
                item.i === newItem.i
                    ? {
                          ...newItem,
                          y: adjustedLayouts.find(l => l.i === item.i)?.y ?? item.y
                      }
                    : item
            );
        });
    
        onUpdate({ layouts });
    };
    

 

    const adjustPositions = (layout: Layout[]): Layout[] => {
    const sortedLayout = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const adjustedLayout: Layout[] = [];

    sortedLayout.forEach(item => {
        let newY = item.y;
        while (
            adjustedLayout.some(
                l =>
                    l.i !== item.i &&
                    l.y < newY + item.h &&
                    l.y + l.h > newY &&
                    l.x < item.x + item.w &&
                    l.x + l.w > item.x
            )
        ) {
            newY++;
        }
        adjustedLayout.push({ ...item, y: newY });
    });

    return adjustedLayout;
};



    /* ------------------------------------------------------------------
     * JSX
     * ----------------------------------------------------------------*/
    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
            <ResponsiveGridLayout
                className={`layout ${editMode ? 'editing-grid' : ''}`}
                layouts={tab.layouts}
                breakpoints={breakpoints}
                cols={cols}
                rowHeight={30}
                margin={[8, 8]}
                containerPadding={[16, 16]}
                compactType={editMode ? null : 'vertical'} // Allow vertical resizing
                isDraggable={editMode}
                isResizable={editMode}
                preventCollision={!editMode}
                draggableHandle={editMode ? '.drag-handle' : undefined}
                draggableCancel=".no-drag"
                useCSSTransforms={false}
                onLayoutChange={(curr, all) => onLayoutChange(curr, all)}  // pass both args through
                onResizeStop={onResizeStop}
                style={{ height: '100%' }}
            >
                {tab.widgets.map(w => (
                    <div key={w.id} data-grid={{ ...tab.layouts.lg?.find(l => l.i === w.id) }}>
                        <WidgetWrapper
                            widget={w}
                            editMode={editMode}
                            layout={tab.layouts.lg?.find(l => l.i === w.id) ?? { i: w.id, x: 0, y: 0, w: 1, h: 1 }}
                            onLayoutChange={(layout) => onLayoutChange([layout], tab.layouts)}
                            onRemove={() => {
                                if (!window.confirm('Delete this widget?')) return;
                                const widgets = tab.widgets.filter(x => x.id !== w.id);
                                const layouts: Layouts = Object.fromEntries(
                                    Object.entries(tab.layouts).map(([bp, arr]) => [
                                        bp,
                                        (arr as Layout[]).filter(l => l.i !== w.id)
                                    ])
                                ) as Layouts;
                                onUpdate({ widgets, layouts });
                            }}
                          
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </Box>
    );
};

export default WidgetGrid;
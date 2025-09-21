// src/components/widgets/WidgetWrapper.tsx
import React from 'react';
import { X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
  } from "@material-tailwind/react";
  


const registry = Object.fromEntries(
  Object.entries(import.meta.glob('./*Widget.tsx', { eager: true }))
    .map(([path, module]) => {
      const match = path.match(/\.\/([^/]+)Widget\.tsx$/);
      const name = match?.[1]?.toLowerCase();
      return name
        ? [name, (module as { default: React.ComponentType }).default]
        : null;
    })
    .filter((entry): entry is [string, React.ComponentType] => entry !== null)
) as Record<string, React.ComponentType>;

interface Props {
  widget: { id: string; type: string };
  editMode: boolean;
  onRemove: () => void;
  layout: { i: string; x: number; y: number; w: number; h: number };
  onLayoutChange: (layout: { i: string; x: number; y: number; w: number; h: number }) => void;
}

const WidgetWrapper: React.FC<Props> = ({ widget, editMode, onRemove, layout }) => {
  const Component = registry[widget.type];
  const title = widget.type.toUpperCase();

  return (
    <div
      className="relative w-full h-full"
      style={{
        gridArea: `${layout.y + 1} / ${layout.x + 1} / span ${layout.h} / span ${layout.w}`,
      }}
    >

    <Card className={`border border-blue-gray-100 shadow-sm ${editMode ? 'cursor-move drag-handle' : 'cursor-default'}`}>
         <CardHeader variant="gradient" floated={false} shadow={false}>
          
          {editMode && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none no-drag"
              aria-label="Remove widget"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
      </CardHeader>
       
        {/* Content */}
        <CardBody className="px-6 pt-0">
          {Component ? <Component /> : <div className="text-sm text-gray-500">Component not found</div>}
         
        </CardBody>
      </Card>
    </div>
  );
};

export default WidgetWrapper;

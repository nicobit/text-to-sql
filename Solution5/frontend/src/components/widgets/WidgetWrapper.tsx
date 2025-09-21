// src/components/widgets/WidgetWrapper.tsx
import React from 'react';
import { X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Typography from '@material-tailwind/react/components/Typography';


const registry = Object.fromEntries(
  Object.entries(import.meta.glob('./*Widget.tsx', { eager: true }))
    .map(([path, module]: [string, any]) => {
      const match = path.match(/\.\/([^/]+)Widget\.tsx$/);
      const name = match?.[1]?.toLowerCase();
      const name1 = match?.[1]
      const title = name1
        ? name1
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .trim()
          .replace(/^./, (str) => str.toUpperCase())
        : '';
      const icon = module?.icon || null;
      return name
        ? [name, { component: (module as { default: React.ComponentType }).default, icon, title }]
        : null;
    })
    .filter((entry): entry is [string, { component: React.ComponentType; icon: React.ReactNode | null; title: string }] => entry !== null)
) as Record<string, { component: React.ComponentType; icon: React.ReactNode | null; title: string }>;

interface Props {
  widget: { id: string; type: string };
  editMode: boolean;
  onRemove: () => void;
  layout: { i: string; x: number; y: number; w: number; h: number };
  onLayoutChange: (layout: { i: string; x: number; y: number; w: number; h: number }) => void;
}

const WidgetWrapper: React.FC<Props> = ({ widget, editMode, onRemove, layout }) => {
  const Component = registry[widget.type].component;
  const name = Component?.name || widget.type;
  const title = registry[widget.type].title || null;
 
  const icon = registry[widget.type].icon || null;

  return (
    <div
      className="relative w-full h-full "
      style={{
        gridArea: `${layout.y + 1} / ${layout.x + 1} / span ${layout.h} / span ${layout.w}`,
      }}
    >
      <div
        className={`relative flex flex-col bg-clip-border text-gray-700  dark:text-gray-300 h-full overflow-hidden
          ${editMode ? 'cursor-move drag-handle' : 'cursor-default'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 ">
            <Typography variant="h6" color="blue-gray" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
            {title}
            </Typography>
            {icon && <span className="mr-3 h-5 w-5">{icon}</span>}
          
          {editMode && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none no-drag"
              aria-label="Remove widget"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {Component ? <Component /> : <div className="text-sm text-gray-500">Component not found</div>}
        </div>
      </div>
    </div>
  );
};

export default WidgetWrapper;
